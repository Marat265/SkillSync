export const isMentor = (): boolean => {
  try {
    const userData = localStorage.getItem("user");

    if (!userData) {
      console.log("Нет данных в localStorage");
      return false;
    }

    const user = JSON.parse(userData);

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
