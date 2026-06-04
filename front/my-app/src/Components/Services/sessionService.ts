import { handleError } from "../../Helpers/errorHandler";
import { API_URL } from '../../config';

export const SessionService = {

    async CreateSession(sessionData : any){
        const response = await fetch(`${API_URL}/api/Mentor/Create/Session`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(sessionData),
            credentials: 'include', 
          });
    
          if (!response.ok) {
            throw new Error('Failed to create session');
          }
       
    },

    async GetMentorSessions(){
        const response = await fetch(`${API_URL}/api/Mentor/Session`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
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
            `${API_URL}/api/Mentor/Delete/${sessionId}`,
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
            `${API_URL}/api/Anonymous/Session/${sessionId}`,
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
        const response = await fetch(`${API_URL}/api/Anonymous/Sessions`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include', 
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch sessions');
          }

          return response.json();
    },


    async JoinSession(sessionId:number){
        const response = await fetch(`${API_URL}/api/Students/Session/register/${sessionId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include', 
          });
  
          if (!response.ok) {
            const errorText = await response.text(); 
             throw new Error(errorText); 
          }
    },


    async LogOutOfSession(sessionId:number){
         const response = await fetch(`${API_URL}/api/Students/Session/register/${sessionId}`, {
                method: "DELETE",
                credentials: "include",
              });
        
              if (!response.ok) {
                const errorText = await handleError(response);
                throw new Error(errorText);
              }
    }

};