export interface User {
  id: string;
  email: string;
  role: "admin" | "officer" | "user";
}

export const setUserData = (user: User) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const getUserData = (): User | null => {
  const userData = localStorage.getItem("user");
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  }
  return null;
};

export const getUserRole = (): "admin" | "officer" | "user" | null => {
  const user = getUserData();
  return user ? user.role : null;
};

export const clearUserData = () => {
  localStorage.removeItem("user");
};
