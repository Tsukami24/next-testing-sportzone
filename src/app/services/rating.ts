// Gunakan env agar mudah menyesuaikan base URL backend (sertakan prefix jika ada, mis. http://localhost:3000/api)
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"; // sesuaikan dengan port/prefix NestJS

// Create rating
export async function createRating(userId: string, produkId: string, rating: number, token: string) {
  const res = await fetch(`${API_URL}/rating`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userId, produkId, rating }),
  });
  return res.json();
}

// Update rating
export async function updateRating(id: string, rating: number, token: string) {
  const res = await fetch(`${API_URL}/rating/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ rating }),
  });
  return res.json();
}

// Get ratings by product
export async function getRatingsByProduct(produkId: string) {
  const res = await fetch(`${API_URL}/rating/product/${produkId}`);
  return res.json();
}

// Get average rating by product
export async function getAverageRating(produkId: string) {
  const res = await fetch(`${API_URL}/rating/product/${produkId}/average`);
  return res.json();
}

// Get ratings by user
export async function getRatingsByUser(userId: string, token: string) {
  const res = await fetch(`${API_URL}/rating/user/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}
