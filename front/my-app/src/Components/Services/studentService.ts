import { handleError } from "../../Helpers/errorHandler";


export const StudentService = {

    async GetAllStudents(){
        const response = await fetch('https://localhost:7002/api/Anonymous/Students', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Важно! Это заставляет браузер отправлять куки
        })
          if (!response.ok) {
            throw new Error('Failed to fetch students');
          }
          return response.json();
    },



    async GetStudentDetails(studentId:string){
        const response = await fetch(
            `https://localhost:7002/api/Anonymous/Student/${studentId}`, // Обновляем URL для студентов
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include", // Если нужно для авторизации
            }
          );
  
          if (!response.ok) {
            throw new Error("Failed to fetch student details");
          }
          return response.json();
    }

};