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

// Check if user is admin
export async function isAdmin(token: string): Promise<boolean> {
  try {
    const profile = await getProfile(token);
    console.log('User profile:', profile); // Debug log
    // Fix: role is nested inside profile.user.role
    console.log('User role:', profile.user?.role); // Debug log
    const isAdminUser = profile.user?.role?.name === 'admin' || profile.user?.role === 'admin';
    console.log('Is admin:', isAdminUser); // Debug log

    // Also check JWT token payload directly as backup
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('JWT payload role:', payload.role);
      if (payload.role === 'admin') {
        return true;
      }
    } catch (jwtError) {
      console.error('Error parsing JWT:', jwtError);
    }

    return isAdminUser;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// Check if user is petugas
export async function isPetugas(token: string): Promise<boolean> {
  try {
    const profile = await getProfile(token);
    console.log('User profile:', profile); // Debug log
    console.log('User role:', profile.user?.role); // Debug log
    const isPetugasUser = profile.user?.role?.name === 'petugas' || profile.user?.role === 'petugas';
    console.log('Is petugas:', isPetugasUser); // Debug log

    // Also check JWT token payload directly as backup
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('JWT payload role:', payload.role);
      if (payload.role === 'petugas') {
        return true;
      }
    } catch (jwtError) {
      console.error('Error parsing JWT:', jwtError);
    }

    return isPetugasUser;
  } catch (error) {
    console.error('Error checking petugas status:', error);
    return false;
  }
}

// Check if user is customer
export async function isCustomer(token: string): Promise<boolean> {
  try {
    const profile = await getProfile(token);
    console.log('User profile:', profile); // Debug log
    console.log('User role:', profile.user?.role); // Debug log
    const isCustomerUser = profile.user?.role?.name === 'customer' || profile.user?.role === 'customer';
    console.log('Is customer:', isCustomerUser); // Debug log

    // Also check JWT token payload directly as backup
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('JWT payload role:', payload.role);
      if (payload.role === 'customer') {
        return true;
      }
    } catch (jwtError) {
      console.error('Error parsing JWT:', jwtError);
    }

    return isCustomerUser;
  } catch (error) {
    console.error('Error checking customer status:', error);
    return false;
  }
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
