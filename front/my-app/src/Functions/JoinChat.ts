import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

export const joinChat = async (UserName:string, ChatRoom:string) => {
  const connection = new HubConnectionBuilder()
  .withUrl("https://localhost:7002/chatHub")
  .withAutomaticReconnect()
  .build()

  connection.on("ReceiveMessage", (userName, message) => {
    console.log(userName);
    console.log(message);
  })

  try {
      await connection.start();
      await connection.invoke("JoinChat", {UserName, ChatRoom});
    
  } catch (error) {
    console.log(error);
    
  }
};
