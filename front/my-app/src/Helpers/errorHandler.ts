export const handleError = async (response: Response): Promise<string> => {
    const errorText = await response.text();
  
    try {

      const errorJson = JSON.parse(errorText);
  

      if (Array.isArray(errorJson) && errorJson.length > 0 && errorJson[0].description) {
        return errorJson[0].description;
      }
  

      if (errorJson.message) {
        return errorJson.message;
      }
  

      return errorText;
    } catch {
      return errorText;
    }
  };