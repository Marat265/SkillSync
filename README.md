# SkillSync

SkillSync is a mentoring platform that allows mentors and mentees to connect and collaborate. Mentors can showcase their skills, manage their profiles, and interact with mentees through a user-friendly interface.

## Features

- **Mentor Profiles**: Mentors can create and manage their profiles, including personal information and skills.
- **Skill Management**: Mentors can add or remove skills from their profiles.
- **Profile Update**: Mentors can update their name and email.
- **User Reviews**: Mentees can leave reviews for mentors.

## Technologies Used

- **Frontend**: React
- **Backend**: ASP.NET Core
- **Database**: SQL Server
- **Authentication**: JWT (JSON Web Tokens)

## Getting Started

### Prerequisites

- Node.js
- .NET SDK
- SQL Server

### Installation

1. Clone the repository:
   git clone <repository-url>
   cd SkillSync

Navigate to the frontend directory:
cd front/my-app

Install the frontend dependencies:
npm install

Navigate to the backend directory:
cd ../backend


Restore the backend dependencies:
dotnet restore


Update the database connection string in appsettings.json and run the migrations:
dotnet ef database update

Start the backend server:
dotnet run

Start the frontend application:
npm start


Usage
Access the application at http://localhost:3000 for the frontend and http://localhost:7002 for the backend API.
Mentors can sign up, create a profile, and manage their skills.


