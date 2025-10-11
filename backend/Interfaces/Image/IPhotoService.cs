using CloudinaryDotNet.Actions;

namespace Skillsync.Interfaces.Image
{
    public interface IPhotoService
    {
        Task<ImageUploadResult> AddPhotoAsync(IFormFile file);
        Task<DeletionResult> DeletePhotoAsync(string photoId);
    }
}
