using AutoMapper;
using Portfolio.Models;
using Skillsync.Dto.Profiles;
using Skillsync.Dto.Sessions;
using Skillsync.Dto.User;

namespace Portfolio.Helpers
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Users, UserDto>();
            CreateMap<Session, SessionDto>();
            CreateMap<Users, MentorProfileDto>()
             .ForMember(dest => dest.Skills, opt => opt.MapFrom(src => src.MentorSkills.Select(ms => ms.Skill.Name).ToList()))
            .ForMember(dest => dest.Reviews, opt => opt.MapFrom(src => src.Reviews.Select(r => r.Comment).ToList()));
            CreateMap<Users, StudentProfileDto>();

        }
    }
}
