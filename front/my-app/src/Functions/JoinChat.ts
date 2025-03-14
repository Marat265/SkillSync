import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

export const joinChat = async (userId: string) => {
  const connection = new HubConnectionBuilder()
  .withUrl("https://localhost:7002/chatHub", {
    withCredentials: true, // Убедитесь, что credentials передаются
  })
    .configureLogging(LogLevel.Information)
    .withAutomaticReconnect()
    .build();
  try {
      await connection.start();
      await connection.invoke("JoinChat", userId);
    
  } catch (error) {
    console.error("Ошибка подключения:", error);
    
  }
};
