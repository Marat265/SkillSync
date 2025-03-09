import { handleError } from "../../Helpers/errorHandler";


export const SessionService = {

    async CreateSession(sessionData : any){
        const response = await fetch('https://localhost:7002/api/Mentor/Create/Session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(sessionData),
            credentials: 'include', // Чтобы отправить куки (если они есть)
          });
    
          if (!response.ok) {
            throw new Error('Failed to create session');
          }
       
    },

    async GetMentorSessions(){
        const response = await fetch('https://localhost:7002/api/Mentor/Session', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include', // Важно! Это заставляет браузер отправлять куки
          });

          if(response.status == 204){
            return [];
          }
          
          if (!response.ok) {
            throw new Error('Failed to fetch sessions');
          }
          
          return response.json();
    },


    async DeleteSession(sessionId:number){
        const response = await fetch(
            `https://localhost:7002/api/Mentor/Delete/${sessionId}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
            }
          );
    
          if (!response.ok) {
            throw new Error("Failed to delete session");
          }
    },


    async GetSessionDetails(sessionId:string){
        const response = await fetch(
            `https://localhost:7002/api/Anonymous/Session/${sessionId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
  
          if (!response.ok) {
            throw new Error("Failed to fetch session details");
          }
          return response.json();
    },


    async GetAllSessions(){
        const response = await fetch('https://localhost:7002/api/Anonymous/Sessions', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include', // Важно! Это заставляет браузер отправлять куки
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch sessions');
          }

          return response.json();
    },


    async JoinSession(sessionId:number){
        const response = await fetch(`https://localhost:7002/api/Students/Session/register/${sessionId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include', // Важно! Это заставляет браузер отправлять куки
          });
  
          if (!response.ok) {
            const errorText = await response.text(); // Получаем текст ошибки
             throw new Error(errorText); // Выбрасываем ошибку с текстом
          }
    },


    async LogOutOfSession(sessionId:number){
         const response = await fetch(`https://localhost:7002/api/Students/Session/register/${sessionId}`, {
                method: "DELETE",
                credentials: "include",
              });
        
              if (!response.ok) {
                const errorText = await handleError(response);
                throw new Error(errorText);
              }
    }

};