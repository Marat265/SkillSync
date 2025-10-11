using AutoMapper;
using Skillsync.Repositories;
using FakeItEasy;
using Portfolio.Models;
using Portfolio.Controllers;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Session;
using Portfolio.Dto;

namespace Tests
{
    public class AnonymusControllerTests
    {
        private readonly ISessionService _sessionrep;
        private readonly IStudentService _studentrep;
        private readonly IMentorService _mentorrep;
        private readonly IMapper _mapper;

        public AnonymusControllerTests()
        {
            _sessionrep = A.Fake<ISessionService>();
            _studentrep = A.Fake<IStudentService>();
            _mentorrep = A.Fake<IMentorService>();
            _mapper = A.Fake<IMapper>();
        }



        [Fact]
        public async void AnonymusController_GetSession_ReturnOK()
        {
            //Arrange
            int sessionId = 1;
            var session = A.Fake<Session>();
            var sessiondto = A.Fake<SessionDto>();
            A.CallTo(() =>  _sessionrep.GetSessionWithMentorByIdAsync(sessionId)).Returns(Task.FromResult(session));
            A.CallTo(() => _mapper.Map<SessionDto>(session)).Returns(sessiondto);
            var controller = new AnonymousController(_mapper,_sessionrep,_studentrep,_mentorrep);
            //Act
            var result = await controller.GetSession(sessionId);
            //Assert
            result.Should().NotBeNull();
            result.Should().BeOfType(typeof(OkObjectResult));
        }


        [Fact]
        public async void AnonymusController_GetSessions_ReturnOK()
        {
            //Arrange
            var sessions = new List<Session>
            {
                A.Fake<Session>(),
                A.Fake<Session>()
            }; 

            var sessiondtos = new List<SessionDto>
            {
              A.Fake<SessionDto>(),
              A.Fake<SessionDto>()
            }; 

            A.CallTo(() => _sessionrep.GetAllSessionsWithMentorsAsync()).Returns(Task.FromResult(sessions));
            A.CallTo(() => _mapper.Map<List<SessionDto>>(sessions)).Returns(sessiondtos);
            var controller = new AnonymousController(_mapper, _sessionrep, _studentrep, _mentorrep);

            //Act
            var result = await controller.GetSessions();

            //Assert
            result.Should().NotBeNull();
            result.Should().BeOfType(typeof(OkObjectResult));
        }



        [Fact]
        public async void AnnonymusController_GetStudents_ReturnOK()
        {
            //Arrange
            var students = new List<Users>
            {
                A.Fake<Users>(),
                A.Fake<Users>()
            };

            var sessiondtos = new List<UserDto>
            {
              A.Fake<UserDto>(),
              A.Fake<UserDto>()
            };
            A.CallTo(() => _studentrep.GetStudentsAsync()).Returns(Task.FromResult(students));
            A.CallTo(() => _mapper.Map<List<UserDto>>(students)).Returns(sessiondtos);
            var controller = new AnonymousController(_mapper, _sessionrep, _studentrep, _mentorrep);
            
            //Act
            var result = await controller.GetStudents();

            //Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<OkObjectResult>();
        }



        [Fact]
        public async void AnnonymusController_GetStudentsByID_ReturnOK()
        {
            //Arrange
            string studentid = "1";
            var student = A.Fake<Users>();
            var sessiondto = A.Fake<UserDto>();
            A.CallTo(() => _studentrep.GetStudentByIdAsync(studentid)).Returns(Task.FromResult(student));
            A.CallTo(() => _mapper.Map<UserDto>(student)).Returns(sessiondto);
            var controller = new AnonymousController(_mapper, _sessionrep, _studentrep, _mentorrep);

            //Act
            var result = await controller.GetStudents(studentid);

            //Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<OkObjectResult>();
        }

        [Fact]
        public async void AnnonymusController_GetMentors_ReturnOK()
        {
            //Arrange
            var mentors = new List<Users>
            {
                A.Fake<Users>(),
                A.Fake<Users>()
            };

            var mentorsdtos = new List<UserDto>
            {
              A.Fake<UserDto>(),
              A.Fake<UserDto>()
            };
            A.CallTo(() => _mentorrep.GetAllMentorsAsync()).Returns(Task.FromResult(mentors));
            A.CallTo(() => _mapper.Map<List<UserDto>>(mentors)).Returns(mentorsdtos);
            var controller = new AnonymousController(_mapper, _sessionrep, _studentrep, _mentorrep);

            //Act
            var result = await controller.GetMentors();

            //Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<OkObjectResult>();
        }


        [Fact]
        public async void AnnonymusController_GetMentorsByID_ReturnOK()
        {
            //Arrange
            string mentorId = "1";
            var mentor = A.Fake<Users>();
            var mentordto = A.Fake<UserDto>();
            
            A.CallTo(() => _mentorrep.GetMentorByIdAsync(mentorId)).Returns(Task.FromResult(mentor));
            A.CallTo(() => _mapper.Map<UserDto>(mentor)).Returns(mentordto);
            var controller = new AnonymousController(_mapper, _sessionrep, _studentrep, _mentorrep);

            //Act
            var result = await controller.GetMentor(mentorId);

            //Assert
            result.Should().NotBeNull();
            result.Should().BeOfType<OkObjectResult>();
        }

    }
}