export const isMentor = (): boolean => {
  try {
    // Достаем пользователя из localStorage
    const userData = localStorage.getItem("user");

    if (!userData) {
      console.log("Нет данных в localStorage");
      return false;
    }

    // Разбираем JSON
    const user = JSON.parse(userData);

    // Проверяем, есть ли у пользователя массив ролей и содержит ли он "Mentor"
    if (Array.isArray(user.role) && user.role.includes("Mentor")) {
      return true;
    }

    console.log("Роль Mentor не найдена");
    return false;
  } catch (error) {
    console.error("Ошибка при разборе данных из localStorage", error);
    return false;
  }
};
