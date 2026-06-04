import React, { useEffect, useState } from 'react';
import { AiService } from '../../Components/Services/aiService';
import { isMentor } from '../../Functions/IsMentor';
import './AiHub.css';

type ChatMessage = {
  role: 'user' | 'assistant';
  text: string;
};

type MentorMatch = {
  mentorId: string;
  name: string;
  email: string;
  image: string;
  score: number;
  reason: string;
  skills: string[];
  upcomingSessions: string[];
};

type MentorAnalytics = {
  totalSessions: number;
  scheduledSessions: number;
  completedSessions: number;
  totalStudents: number;
  averageFillRate: number;
  topTopics: { topic: string; count: number }[];
  aiSummary: string;
};

const starterQuestions = [
  'How should I start learning React?',
  'Create a 2-week C# learning plan',
  'What should I ask a mentor before a session?',
];

const AiHub = () => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: 'Hi, I am your SkillSync learning assistant. Ask me about programming, learning plans, or which session to join next.',
    },
  ]);
  const [goal, setGoal] = useState('');
  const [matches, setMatches] = useState<MentorMatch[]>([]);
  const [matchAdvice, setMatchAdvice] = useState('');
  const [analytics, setAnalytics] = useState<MentorAnalytics | null>(null);
  const [loadingAssistant, setLoadingAssistant] = useState(false);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mentor = isMentor();

  const askAssistant = async (message = question) => {
    if (!message.trim()) return;

    setError(null);
    setLoadingAssistant(true);
    setMessages(prev => [...prev, { role: 'user', text: message }]);
    setQuestion('');

    try {
      const data = await AiService.askStudentAssistant(message);
      setMessages(prev => [...prev, { role: 'assistant', text: data.answer }]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingAssistant(false);
    }
  };

  const loadMatches = async () => {
    if (!goal.trim()) return;

    setError(null);
    setLoadingMatches(true);
    try {
      const data = await AiService.getMentorMatches(goal);
      setMatches(data.matches || []);
      setMatchAdvice(data.aiAdvice || '');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingMatches(false);
    }
  };

  const loadAnalytics = async () => {
    setError(null);
    setLoadingAnalytics(true);
    try {
      const data = await AiService.getMentorAnalytics();
      setAnalytics(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    if (mentor) loadAnalytics();
  }, []);

  return (
    <main className="ai-page">
      <div className="container">
        <section className="ai-hero">
          <div>
            <span className="ai-eyebrow">AI Learning Intelligence</span>
            <h1>SkillSync AI Hub</h1>
            <p>
              Ask for learning guidance, discover the best mentor for your goal,
              and turn session data into practical insights.
            </p>
          </div>
          <div className="ai-hero-stats">
            <div><strong>24/7</strong><span>assistant</span></div>
            <div><strong>Smart</strong><span>matching</span></div>
            <div><strong>Live</strong><span>analytics</span></div>
          </div>
        </section>

        {error && <div className="ai-error">{error}</div>}

        <div className="ai-grid">
          <section className="ai-panel ai-chat-panel">
            <div className="ai-panel-head">
              <div>
                <span className="ai-panel-kicker">For students</span>
                <h2>AI Assistant</h2>
              </div>
              <span className="ai-chip">Learning coach</span>
            </div>

            <div className="ai-chat">
              {messages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`ai-message ${message.role}`}>
                  {message.text}
                </div>
              ))}
              {loadingAssistant && <div className="ai-message assistant">Thinking...</div>}
            </div>

            <div className="ai-starters">
              {starterQuestions.map(item => (
                <button key={item} onClick={() => askAssistant(item)}>{item}</button>
              ))}
            </div>

            <div className="ai-input-row">
              <input
                value={question}
                onChange={event => setQuestion(event.target.value)}
                onKeyDown={event => {
                  if (event.key === 'Enter') askAssistant();
                }}
                placeholder="Ask about a topic, roadmap, or mentor..."
              />
              <button onClick={() => askAssistant()} disabled={loadingAssistant || !question.trim()}>
                Ask AI
              </button>
            </div>
          </section>

          <section className="ai-panel">
            <div className="ai-panel-head">
              <div>
                <span className="ai-panel-kicker">For students</span>
                <h2>Smart Mentor Matching</h2>
              </div>
              <span className="ai-chip">Top 5</span>
            </div>

            <div className="ai-input-row compact">
              <input
                value={goal}
                onChange={event => setGoal(event.target.value)}
                placeholder="Example: learn ASP.NET backend"
              />
              <button onClick={loadMatches} disabled={loadingMatches || !goal.trim()}>
                Match
              </button>
            </div>

            <div className="match-list">
              {matches.map(match => (
                <div className="match-card" key={match.mentorId}>
                  <img src={match.image || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} alt={match.name} />
                  <div>
                    <div className="match-top">
                      <strong>{match.name}</strong>
                      <span>{match.score}%</span>
                    </div>
                    <p>{match.reason}</p>
                    <small>{match.skills.length ? match.skills.join(', ') : 'Active mentor'}</small>
                  </div>
                </div>
              ))}
              {!loadingMatches && matches.length === 0 && goal.trim() && (
                <div className="ai-empty">No matching mentors yet. Try a broader goal.</div>
              )}
            </div>

            {matchAdvice && <div className="ai-advice">{matchAdvice}</div>}
          </section>

          <section className="ai-panel analytics-panel">
            <div className="ai-panel-head">
              <div>
                <span className="ai-panel-kicker">For mentors</span>
                <h2>AI Analytics</h2>
              </div>
              <button className="ai-refresh" onClick={loadAnalytics} disabled={loadingAnalytics}>
                Refresh
              </button>
            </div>

            {mentor ? (
              analytics ? (
                <>
                  <div className="analytics-cards">
                    <div><strong>{analytics.totalSessions}</strong><span>Sessions</span></div>
                    <div><strong>{analytics.totalStudents}</strong><span>Students</span></div>
                    <div><strong>{analytics.averageFillRate}%</strong><span>Fill rate</span></div>
                  </div>

                  <div className="topic-bars">
                    {analytics.topTopics.map(topic => (
                      <div key={topic.topic}>
                        <span>{topic.topic}</span>
                        <strong>{topic.count}</strong>
                      </div>
                    ))}
                  </div>

                  <div className="ai-advice">{analytics.aiSummary}</div>
                </>
              ) : (
                <div className="ai-empty">{loadingAnalytics ? 'Loading analytics...' : 'No analytics yet.'}</div>
              )
            ) : (
              <div className="ai-empty">Mentor analytics is available after logging in as a mentor.</div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default AiHub;
