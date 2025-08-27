"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // <-- import router
import {
  registerUser,
  loginUser,
  getProfile,
  logoutUser,
  API_URL,
} from "../services/auth";

export default function AuthPage() {
  const router = useRouter(); // <-- init router

  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);

  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // --- register
  async function handleRegister() {
    const res = await registerUser(regUsername, regEmail, regPassword);
    alert("Register: " + JSON.stringify(res));
  }

  // --- login
  async function handleLogin() {
    const res = await loginUser(loginEmail, loginPassword);
    if (res?.token) {
      setToken(res.token);
      // Simpan token agar halaman /home bisa membacanya
      if (typeof window !== "undefined") {
        localStorage.setItem("token", res.token);
      }
      const profileRes = await getProfile(res.token);
      setProfile(profileRes.user);

      // redirect ke halaman home dummy
      router.push("/home");
    } else {
      alert("Login gagal: " + JSON.stringify(res));
    }
  }

  // --- logout
  async function handleLogout() {
    if (!token) return alert("Login dulu");
    await logoutUser(token);
    setToken(null);
    setProfile(null);
    router.push("/"); // kembali ke halaman login
  }

  // --- login with Google: hapus token lama agar tidak pakai akun sebelumnya
  function handleGoogleLogin() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    window.location.href = `${API_URL}/auth/google`;
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Testing Auth NestJS di Next.js</h1>

      <h2>Register</h2>
      <input
        placeholder="Username"
        value={regUsername}
        onChange={(e) => setRegUsername(e.target.value)}
      />
      <input
        placeholder="Email"
        value={regEmail}
        onChange={(e) => setRegEmail(e.target.value)}
      />
      <input
        placeholder="Password"
        type="password"
        value={regPassword}
        onChange={(e) => setRegPassword(e.target.value)}
      />
      <button onClick={handleRegister}>Register</button>

      <h2>Login</h2>
      <input
        placeholder="Email"
        value={loginEmail}
        onChange={(e) => setLoginEmail(e.target.value)}
      />
      <input
        placeholder="Password"
        type="password"
        value={loginPassword}
        onChange={(e) => setLoginPassword(e.target.value)}
      />
      <button onClick={handleLogin}>Login</button>

      <h2>Login with Google</h2>
      <button onClick={handleGoogleLogin}>Login dengan Google</button>
    </div>
  );
}
