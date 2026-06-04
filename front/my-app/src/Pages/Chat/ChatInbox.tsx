import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as signalR from '@microsoft/signalr';
import { API_URL } from '../../config';
import Chat from '../../Components/Chat/Chat';
import './ChatInbox.css';

const CHAT_HUB_URL = `${API_URL}/chatHub`;

interface ConversationSummary {
  chatRoom: string;
  partnerEmail: string;
  partnerName?: string;
  partnerImage?: string;
  lastMessage: string;
  lastMessageAt: string;
  lastSenderEmail: string;
}

interface Message {
  user: string;
  text: string;
  sentAt?: string;
}

interface ChatInboxProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadChange: (count: number) => void;
}

const LAST_READ_KEY = (room: string) => `inbox_last_read_${room}`;

const getLastReadDate = (chatRoom: string): Date => {
  const saved = localStorage.getItem(LAST_READ_KEY(chatRoom));
  return saved ? new Date(saved) : new Date(0);
};

const markAsRead = (chatRoom: string) => {
  localStorage.setItem(LAST_READ_KEY(chatRoom), new Date().toISOString());
};

const toUtcDate = (dateStr?: string) => {
  if (!dateStr) return new Date(0);
  return new Date(dateStr.endsWith('Z') ? dateStr : `${dateStr}Z`);
};

const formatPreviewTime = (dateStr?: string): string => {
  if (!dateStr) return '';

  const date = toUtcDate(dateStr);
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const truncate = (str: string, length = 44) =>
  str.length > length ? `${str.slice(0, length)}...` : str;

export const displayName = (email: string, fallbackName?: string) => {
  const source = fallbackName?.trim() || email.split('@')[0] || 'User';
  return source.replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

const getUserInfo = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
};

const isCallMessage = (message: string) =>
  message?.includes('CALL_MISSED') || message?.includes('CALL_END');

const ChatInbox: React.FC<ChatInboxProps> = ({ isOpen, onClose, onUnreadChange }) => {
  const [convList, setConvList] = useState<ConversationSummary[]>([]);
  const [activeConv, setActiveConv] = useState<ConversationSummary | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [partnerOnline, setPartnerOnline] = useState(false);
  const [unreadMap, setUnreadMap] = useState<Record<string, number>>({});
  const [chatConn, setChatConn] = useState<signalR.HubConnection | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const chatConnRef = useRef<signalR.HubConnection | null>(null);
  const activeConvRef = useRef<ConversationSummary | null>(null);
  const sendingRef = useRef(false);

  const userInfo = getUserInfo();
  const myEmail = userInfo?.email || '';
  const myName = userInfo?.name || userInfo?.userName || displayName(myEmail);
  const totalUnread = Object.values(unreadMap).reduce((sum, count) => sum + count, 0);

  useEffect(() => {
    onUnreadChange(totalUnread);
  }, [totalUnread, onUnreadChange]);

  useEffect(() => {
    activeConvRef.current = activeConv;
  }, [activeConv]);

  const fetchConversations = useCallback(async () => {
    if (!myEmail) return;

    try {
      const response = await fetch(
        `${API_URL}/api/Chat/conversations/${encodeURIComponent(myEmail)}`,
        { credentials: 'include' },
      );

      if (!response.ok) return;

      const data: ConversationSummary[] = await response.json();
      setConvList(data);
      setUnreadMap(prev => {
        const next = { ...prev };

        data.forEach(conv => {
          if (conv.lastSenderEmail === myEmail) {
            next[conv.chatRoom] = 0;
            return;
          }

          const lastRead = getLastReadDate(conv.chatRoom);
          const lastMessageAt = toUtcDate(conv.lastMessageAt);
          if (!next[conv.chatRoom]) {
            next[conv.chatRoom] = lastMessageAt > lastRead ? 1 : 0;
          }
        });

        return next;
      });
    } catch (error) {
      console.warn('[ChatInbox] Could not load conversations', error);
    }
  }, [myEmail]);

  useEffect(() => {
    if (myEmail) fetchConversations();
  }, [fetchConversations, myEmail]);

  useEffect(() => {
    if (isOpen) fetchConversations();
  }, [fetchConversations, isOpen]);

  useEffect(() => {
    if (!myEmail) return undefined;

    const hub = new signalR.HubConnectionBuilder()
      .withUrl(CHAT_HUB_URL, { withCredentials: true })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    hub.on(
      'ReceiveNewMessageNotification',
      (fromEmail: string, chatRoom: string, preview: string, sentAt?: string) => {
        const activeRoom = activeConvRef.current?.chatRoom;
        const lastMessageAt = sentAt || new Date().toISOString();

        setConvList(prev => {
          const existing = prev.find(conv => conv.chatRoom === chatRoom);
          if (!existing) {
            fetchConversations();
            return prev;
          }

          return prev
            .map(conv =>
              conv.chatRoom === chatRoom
                ? { ...conv, lastMessage: preview, lastMessageAt, lastSenderEmail: fromEmail }
                : conv,
            )
            .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
        });

        if (activeRoom === chatRoom) {
          markAsRead(chatRoom);
          setUnreadMap(prev => ({ ...prev, [chatRoom]: 0 }));
          return;
        }

        if (fromEmail !== myEmail) {
          setUnreadMap(prev => ({ ...prev, [chatRoom]: (prev[chatRoom] || 0) + 1 }));
        }
      },
    );

    hub
      .start()
      .then(() => hub.invoke('JoinNotifications', myEmail))
      .catch(error => console.warn('[ChatInbox] Notification hub error', error));

    return () => {
      hub.stop().catch(() => {});
    };
  }, [fetchConversations, myEmail]);

  const openConversation = useCallback(async (conv: ConversationSummary) => {
    onClose();
    setActiveConv(conv);
    setPartnerOnline(false);
    setMessages([]);
    setChatConn(null);

    if (chatConnRef.current) {
      try {
        await chatConnRef.current.stop();
      } catch {}
      chatConnRef.current = null;
    }

    markAsRead(conv.chatRoom);
    setUnreadMap(prev => ({ ...prev, [conv.chatRoom]: 0 }));

    try {
      const response = await fetch(
        `${API_URL}/api/Chat/${encodeURIComponent(conv.chatRoom)}`,
        { credentials: 'include' },
      );

      if (response.ok) {
        const data: Array<{ fromEmail: string; message: string; sentAt?: string }> = await response.json();
        setMessages(
          data.map(message => ({
            user: message.fromEmail === myEmail ? 'You' : displayName(message.fromEmail, conv.partnerName),
            text: message.message,
            sentAt: message.sentAt,
          })),
        );
      }
    } catch (error) {
      console.warn('[ChatInbox] Could not load messages', error);
    }

    setIsConnecting(true);

    const hub = new signalR.HubConnectionBuilder()
      .withUrl(CHAT_HUB_URL, { withCredentials: true })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    hub.on('ReceiveMessage', (userName: string, text: string, sentAt?: string, fromEmail?: string) => {
      const messageTime = sentAt || new Date().toISOString();
      const isOwn = fromEmail ? fromEmail === myEmail : userName === myName;

      setMessages(prev => [
        ...prev,
        {
          user: isOwn ? 'You' : displayName(fromEmail || conv.partnerEmail, conv.partnerName || userName),
          text,
          sentAt: messageTime,
        },
      ]);

      setConvList(prev =>
        prev.map(item =>
          item.chatRoom === conv.chatRoom
            ? {
                ...item,
                lastMessage: text,
                lastMessageAt: messageTime,
                lastSenderEmail: isOwn ? myEmail : conv.partnerEmail,
              }
            : item,
        ),
      );

      if (!isOwn) {
        markAsRead(conv.chatRoom);
        setUnreadMap(prev => ({ ...prev, [conv.chatRoom]: 0 }));
      }
    });

    hub.on('UserStatusChanged', (email: string, online: boolean) => {
      if (email === conv.partnerEmail) setPartnerOnline(online);
    });

    try {
      await hub.start();
      await hub.invoke('JoinChat', {
        UserName: myName,
        FromEmail: myEmail,
        ToEmail: conv.partnerEmail,
        ChatRoom: conv.chatRoom,
      });

      const online = await hub.invoke<boolean>('IsUserOnline', conv.partnerEmail);
      setPartnerOnline(online);
      chatConnRef.current = hub;
      setChatConn(hub);
    } catch (error) {
      console.error('[ChatInbox] Chat hub error', error);
      try {
        await hub.stop();
      } catch {}
    } finally {
      setIsConnecting(false);
    }
  }, [myEmail, myName, onClose]);

  const sendMessage = useCallback(async (text: string) => {
    if (sendingRef.current) return;

    const conn = chatConnRef.current;
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) return;

    sendingRef.current = true;
    try {
      await conn.invoke('SendMessage', text);
    } catch (error) {
      console.error('[ChatInbox] Send error', error);
    } finally {
      sendingRef.current = false;
    }
  }, []);

  const closeChat = useCallback(async () => {
    if (chatConnRef.current) {
      try {
        await chatConnRef.current.stop();
      } catch {}
      chatConnRef.current = null;
    }

    setChatConn(null);
    setActiveConv(null);
    setMessages([]);
    setPartnerOnline(false);
    fetchConversations();
  }, [fetchConversations]);

  return (
    <>
      {isOpen && !activeConv && (
        <div className="ci-panel" role="dialog" aria-label="Messages">
          <div className="ci-header">
            <div className="ci-header-left">
              <div className="ci-header-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
              </div>
              <span>Messages</span>
              {totalUnread > 0 && <span className="ci-header-badge">{totalUnread > 99 ? '99+' : totalUnread}</span>}
            </div>
            <button className="ci-header-close" onClick={onClose} aria-label="Close messages">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1 1L9 9M9 1L1 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="ci-list">
            {convList.length === 0 ? (
              <div className="ci-empty">
                <div className="ci-empty-icon">
                  <svg viewBox="0 0 64 64" fill="none" width="52" height="52">
                    <circle cx="32" cy="32" r="30" stroke="#e2e8f0" strokeWidth="2" />
                    <path d="M20 26h24M20 32h16M20 38h12" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="ci-empty-title">No conversations yet</p>
                <p className="ci-empty-sub">Start chatting with a mentor or student</p>
              </div>
            ) : (
              convList.map(conv => {
                const unread = unreadMap[conv.chatRoom] || 0;
                const preview = isCallMessage(conv.lastMessage) ? 'Video call' : truncate(conv.lastMessage || '');
                const partnerName = displayName(conv.partnerEmail, conv.partnerName);
                const partnerInitial = partnerName.charAt(0).toUpperCase();
                const hue = (conv.partnerEmail.charCodeAt(0) * 13 + 160) % 360;

                return (
                  <div
                    key={conv.chatRoom}
                    className={`ci-item${unread > 0 ? ' ci-item--unread' : ''}`}
                    onClick={() => openConversation(conv)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={event => {
                      if (event.key === 'Enter') openConversation(conv);
                    }}
                  >
                    <div className="ci-avatar" style={{ '--hue': hue } as React.CSSProperties}>
                      {conv.partnerImage ? (
                        <img src={conv.partnerImage} alt={partnerName} referrerPolicy="no-referrer" />
                      ) : (
                        partnerInitial
                      )}
                    </div>
                    <div className="ci-item-body">
                      <div className="ci-item-top">
                        <span className="ci-name">{partnerName}</span>
                        <span className="ci-time">{formatPreviewTime(conv.lastMessageAt)}</span>
                      </div>
                      <div className="ci-item-bottom">
                        <span className="ci-preview">
                          {!isCallMessage(conv.lastMessage) && conv.lastSenderEmail === myEmail && (
                            <span className="ci-you">You: </span>
                          )}
                          {preview}
                        </span>
                        {unread > 0 && <span className="ci-dot" aria-label="Unread message" />}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {activeConv && (
        <Chat
          messages={messages}
          sendMessage={sendMessage}
          closeChat={closeChat}
          chatPartnerName={displayName(activeConv.partnerEmail, activeConv.partnerName)}
          chatPartnerImage={activeConv.partnerImage || ''}
          chatPartnerOnline={partnerOnline}
          connection={chatConn}
          partnerEmail={activeConv.partnerEmail}
          myEmail={myEmail}
          myName={myName}
        />
      )}

      {isConnecting && (
        <div className="ci-connecting" aria-label="Connecting">
          <div className="ci-connecting-dots">
            <span />
            <span />
            <span />
          </div>
        </div>
      )}
    </>
  );
};

export default ChatInbox;
