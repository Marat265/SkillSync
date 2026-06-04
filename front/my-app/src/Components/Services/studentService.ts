import { handleError } from "../../Helpers/errorHandler";
import { API_URL } from '../../config';

export const StudentService = {

    async GetAllStudents(){
        const response = await fetch(`${API_URL}/api/Anonymous/Students`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        })
          if (!response.ok) {
            throw new Error('Failed to fetch students');
          }
          return response.json();
    },



    async GetStudentDetails(studentId:string){
        const response = await fetch(
            `${API_URL}/api/Anonymous/Student/${studentId}`, 
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include", 
            }
          );
  
          if (!response.ok) {
            throw new Error("Failed to fetch student details");
          }
          return response.json();
    },

    async GetProfile(){
      const response = await fetch(`${API_URL}/api/Students/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch student profile");
      }

      return response.json();
    },


    async UpdateStudentProfile(name: string, email: string){
       const response = await fetch(`${API_URL}/api/Students/profile`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ name, email }),
              credentials: "include",
            });
      
            if (!response.ok) {
              const errorText = await handleError(response);
              throw new Error(errorText);
            }
      
    }

};