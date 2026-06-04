export const isLoggedIn = (): boolean => {
  const user = localStorage.getItem('user');
  if (!user) return false;

  try {
    const parsed = JSON.parse(user);
    return parsed.isAuthenticated === true;
  } catch {
    return false;
  }
};