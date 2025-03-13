import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr"

 export const joinChat = async(userId:string) =>{

    var connection = new HubConnectionBuilder()
    .withUrl("https://localhost:7002/chatHub")
    .withAutomaticReconnect()
    .build();

    try{
        await connection.start();
        await connection.invoke("JoinChat", {userId});
    }
    catch(error){
        console.log(error);
    }

}