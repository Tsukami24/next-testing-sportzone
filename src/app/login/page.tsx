"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // <-- import router
import {
  registerUser,
  loginUser,
  getProfile,
  logoutUser,
  forgotPassword,
  verifyOtp,
  resetPassword,
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

  // Forgot Password states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: email, 2: otp, 3: new password
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");

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

  // --- forgot password handlers
  async function handleForgotPassword() {
    if (forgotStep === 1) {
      const res = await forgotPassword(forgotEmail);
      if (res.message) {
        setForgotMessage("OTP sent to your email");
        setForgotStep(2);
      } else {
        setForgotMessage("Error: " + JSON.stringify(res));
      }
    } else if (forgotStep === 2) {
      const res = await verifyOtp(forgotEmail, forgotOtp);
      if (res.message) {
        setForgotMessage("OTP verified");
        setForgotStep(3);
      } else {
        setForgotMessage("Error: " + JSON.stringify(res));
      }
    } else if (forgotStep === 3) {
      const res = await resetPassword(forgotEmail, forgotOtp, forgotNewPassword);
      if (res.message) {
        setForgotMessage("Password reset successful");
        setShowForgotModal(false);
        setForgotStep(1);
        setForgotEmail("");
        setForgotOtp("");
        setForgotNewPassword("");
      } else {
        setForgotMessage("Error: " + JSON.stringify(res));
      }
    }
  }

  function openForgotModal() {
    setShowForgotModal(true);
    setForgotStep(1);
    setForgotEmail("");
    setForgotOtp("");
    setForgotNewPassword("");
    setForgotMessage("");
  }

  function closeForgotModal() {
    setShowForgotModal(false);
    setForgotStep(1);
    setForgotEmail("");
    setForgotOtp("");
    setForgotNewPassword("");
    setForgotMessage("");
  }

  return (
    <>
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
        <br />
        <button onClick={openForgotModal} style={{ marginTop: 10, color: 'blue', textDecoration: 'underline', border: 'none', background: 'none' }}>
          Forgot Password?
        </button>

        <h2>Login with Google</h2>
        <button onClick={handleGoogleLogin}>Login dengan Google</button>
      </div>

      {showForgotModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: 20,
            borderRadius: 8,
            width: 400,
            maxWidth: '90%'
          }}>
            <h3>Reset Password</h3>
            <p>Step {forgotStep}/3</p>
            
            {forgotStep === 1 && (
              <>
                <input
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  style={{ width: '100%', marginBottom: 10, padding: 8 }}
                />
                <button onClick={handleForgotPassword} style={{ marginRight: 10, padding: 8 }}>Send OTP</button>
              </>
            )}
            
            {forgotStep === 2 && (
              <>
                <input
                  placeholder="Enter OTP"
                  value={forgotOtp}
                  onChange={(e) => setForgotOtp(e.target.value)}
                  style={{ width: '100%', marginBottom: 10, padding: 8 }}
                />
                <button onClick={handleForgotPassword} style={{ marginRight: 10, padding: 8 }}>Verify OTP</button>
              </>
            )}
            
            {forgotStep === 3 && (
              <>
                <input
                  placeholder="Enter new password"
                  type="password"
                  value={forgotNewPassword}
                  onChange={(e) => setForgotNewPassword(e.target.value)}
                  style={{ width: '100%', marginBottom: 10, padding: 8 }}
                />
                <button onClick={handleForgotPassword} style={{ marginRight: 10, padding: 8 }}>Reset Password</button>
              </>
            )}
            
            {forgotMessage && (
              <p style={{ color: forgotMessage.includes('Error') ? 'red' : 'green', marginTop: 10 }}>
                {forgotMessage}
              </p>
            )}
            
            <button onClick={closeForgotModal} style={{ marginTop: 10, padding: 8, backgroundColor: '#ccc' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
