"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Black_And_White_Picture } from "next/font/google";

export default function AuthPage() {
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);

  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPhone, setRegPhone] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");

  async function handleRegister() {
    const res = await registerUser(
      regUsername,
      regEmail,
      regPassword,
      regPhone
    );
    alert("Register: " + JSON.stringify(res));
  }

  async function handleLogin() {
    const res = await loginUser(loginEmail, loginPassword);
    if (res?.token) {
      setToken(res.token);
      if (typeof window !== "undefined")
        localStorage.setItem("token", res.token);
      const profileRes = await getProfile(res.token);
      setProfile(profileRes.user);
      router.push("/home");
    } else {
      alert("Login gagal: " + JSON.stringify(res));
    }
  }

  async function handleLogout() {
    if (!token) return alert("Login dulu");
    await logoutUser(token);
    setToken(null);
    setProfile(null);
    router.push("/");
  }

  function handleGoogleLogin() {
    if (typeof window !== "undefined") localStorage.removeItem("token");
    window.location.href = `${API_URL}/auth/google`;
  }

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
      const res = await resetPassword(
        forgotEmail,
        forgotOtp,
        forgotNewPassword
      );
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

  // --- Styles
  const containerStyle: React.CSSProperties = {
    maxWidth: 500,
    margin: "40px auto",
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#5b0675ff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    fontFamily: "Arial, sans-serif",
    color: "#FFFFFF",
  };

  const sectionStyle: React.CSSProperties = { marginBottom: 30 };
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    border: "1px solid #ccc",
    fontSize: 14,
  };
  const buttonStyle: React.CSSProperties = {
    padding: "10px 20px",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
    fontWeight: 500,
    backgroundColor: "#f82fddff",
    color: "white",
  };
  const linkButtonStyle: React.CSSProperties = {
    background: "none",
    border: "none",
    color: "#f82fddff",
    textDecoration: "underline",
    cursor: "pointer",
    marginTop: 5,
    fontSize: 14,
  };
  const modalOverlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  };
  const modalContentStyle: React.CSSProperties = {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: 400,
    maxWidth: "90%",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ textAlign: "center", marginBottom: 20 }}>
        Testing Auth NestJS
      </h1>

      {/* Register */}
      <div style={sectionStyle}>
        <h2>Register</h2>
        <input
          style={inputStyle}
          placeholder="Username"
          value={regUsername}
          onChange={(e) => setRegUsername(e.target.value)}
        />
        <input
          style={inputStyle}
          placeholder="Email"
          value={regEmail}
          onChange={(e) => setRegEmail(e.target.value)}
        />
        <input
          style={inputStyle}
          placeholder="Password"
          type="password"
          value={regPassword}
          onChange={(e) => setRegPassword(e.target.value)}
        />
        <input
          style={inputStyle}
          placeholder="Phone"
          value={regPhone}
          onChange={(e) => setRegPhone(e.target.value)}
        />
        <button style={buttonStyle} onClick={handleRegister}>
          Register
        </button>
      </div>

      {/* Login */}
      <div style={sectionStyle}>
        <h2>Login</h2>
        <input
          style={inputStyle}
          placeholder="Email"
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
        />
        <input
          style={inputStyle}
          placeholder="Password"
          type="password"
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
        />
        <button style={buttonStyle} onClick={handleLogin}>
          Login
        </button>
        <button style={linkButtonStyle} onClick={openForgotModal}>
          Forgot Password?
        </button>
      </div>

      {/* Login Google */}
      <div style={sectionStyle}>
        <h2>Login with Google</h2>
        <button style={buttonStyle} onClick={handleGoogleLogin}>
          Login dengan Google
        </button>
      </div>

      {/* Modal Forgot Password */}
      {showForgotModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3>Reset Password</h3>
            <p>Step {forgotStep}/3</p>

            {forgotStep === 1 && (
              <>
                <input
                  style={inputStyle}
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                />
                <button style={buttonStyle} onClick={handleForgotPassword}>
                  Send OTP
                </button>
              </>
            )}

            {forgotStep === 2 && (
              <>
                <input
                  style={inputStyle}
                  placeholder="Enter OTP"
                  value={forgotOtp}
                  onChange={(e) => setForgotOtp(e.target.value)}
                />
                <button style={buttonStyle} onClick={handleForgotPassword}>
                  Verify OTP
                </button>
              </>
            )}

            {forgotStep === 3 && (
              <>
                <input
                  style={inputStyle}
                  placeholder="Enter new password"
                  type="password"
                  value={forgotNewPassword}
                  onChange={(e) => setForgotNewPassword(e.target.value)}
                />
                <button style={buttonStyle} onClick={handleForgotPassword}>
                  Reset Password
                </button>
              </>
            )}

            {forgotMessage && (
              <p
                style={{
                  color: forgotMessage.includes("Error") ? "red" : "green",
                  marginTop: 10,
                }}
              >
                {forgotMessage}
              </p>
            )}

            <button
              style={{
                ...buttonStyle,
                backgroundColor: "#ccc",
                color: "#000",
                marginTop: 10,
              }}
              onClick={closeForgotModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
