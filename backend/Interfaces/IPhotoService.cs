using CloudinaryDotNet.Actions;

namespace Skillsync.Interfaces
{
    public interface IPhotoService
    {
        Task<ImageUploadResult> AddPhotoAsync(IFormFile file);
        Task<DeletionResult> DeletePhotoAsync(string photoId);
    }
}
