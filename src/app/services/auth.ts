// Gunakan env agar mudah menyesuaikan base URL backend (sertakan prefix jika ada, mis. http://localhost:3000/api)
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"; // sesuaikan dengan port/prefix NestJS

// Register user
export async function registerUser(
  username: string,
  email: string,
  password: string
) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  return res.json();
}

// Login user
export async function loginUser(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

// Get Profile
export async function getProfile(token: string) {
  const res = await fetch(`${API_URL}/auth/profile`, {
    headers: {
      Authorization: `Bearer ${token}`, // << penting biar tidak 401
    },
  });
  return res.json();
}

// Logout
export async function logoutUser(token: string) {
  const res = await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}
