export const handleError = async (response: Response): Promise<string> => {
    const errorText = await response.text();
  
    try {
      // Пытаемся разобрать ошибку как JSON
      const errorJson = JSON.parse(errorText);
  
      // Если ошибка содержит массив с описанием, возвращаем первое описание
      if (Array.isArray(errorJson) && errorJson.length > 0 && errorJson[0].description) {
        return errorJson[0].description;
      }
  
      // Если ошибка содержит поле `message`, возвращаем его
      if (errorJson.message) {
        return errorJson.message;
      }
  
      // Если JSON не содержит полезной информации, возвращаем весь текст
      return errorText;
    } catch {
      // Если JSON парсинг не удался, возвращаем текст ошибки как есть
      return errorText;
    }
  };