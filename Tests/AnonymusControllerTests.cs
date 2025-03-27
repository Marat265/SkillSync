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
        private readonly ISessionRepository _sessionrep;
        private readonly IStudentRepository _studentrep;
        private readonly IMentorRepository _mentorrep;
        private readonly IMapper _mapper;

        public AnonymusControllerTests()
        {
            _sessionrep = A.Fake<ISessionRepository>();
            _studentrep = A.Fake<IStudentRepository>();
            _mentorrep = A.Fake<IMentorRepository>();
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
    }
}