import { useActionData } from "react-router-dom";
import { handleError } from "../../Helpers/errorHandler";

export const MentorService = {


    async GetAllMentors(){
        const response = await fetch('https://localhost:7002/api/Anonymous/Mentors', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', 
        })
        if (!response.ok) {
            throw new Error('Failed to fetch mentors');
          }
          return response.json();
    },

    async GetMentorProfile(){
        const response = await fetch("https://localhost:7002/api/Mentor/profile", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });
          if (!response.ok) throw new Error("Failed to fetch mentor profile");
          return response.json();
    },

    async AddSkill(skill:string){
        const response = await fetch(`https://localhost:7002/api/Mentor/Skills/${skill}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });
    
          if (!response.ok) {
            const errorText = await response.text(); // Ждем текст ошибки
            throw new Error(errorText || "Failed to add skill");
          }
          return response.text();
    },

    async DeleteSkill(skillName: string){
        const response = await fetch(`https://localhost:7002/api/Mentor/Skills/${skillName}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });
          if (!response.ok) {
            const errorText = await response.text(); // Ждем текст ошибки
            throw new Error(errorText || "Failed to remove skill");
          }
          return response.text();
    },


    async UpdateProfile(newName: string, newEmail: string){
         const response = await fetch("https://localhost:7002/api/Mentor/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ Name: newName, Email: newEmail }), // Отправляем новые данные
              });
        
              if (!response.ok) {
                const errorText = await handleError(response);
                throw new Error(errorText);
              }
    }


};