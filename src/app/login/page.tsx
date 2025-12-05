"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  registerUser,
  loginUser,
  getProfile,
  forgotPassword,
  verifyOtp,
  resetPassword,
  API_URL,
} from "../services/auth";

export default function AuthPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

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
      if (typeof window !== "undefined")
        localStorage.setItem("token", res.token);
      await getProfile(res.token);
      router.push("/home");
    } else {
      alert("Login gagal: " + JSON.stringify(res));
    }
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

  const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #5b0675ff 0%, #8b0ca8 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  };

  const containerStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: 450,
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderRadius: 20,
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
    overflow: "hidden",
    animation: "fadeIn 0.5s ease-in",
  };

  const headerStyle: React.CSSProperties = {
    background: "linear-gradient(135deg, #5b0675ff 0%, #7a0894 100%)",
    padding: "30px 20px",
    textAlign: "center",
    color: "white",
  };

  const titleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: 28,
    fontWeight: 600,
    letterSpacing: "0.5px",
  };

  const subtitleStyle: React.CSSProperties = {
    margin: "8px 0 0 0",
    fontSize: 14,
    opacity: 0.9,
    fontWeight: 300,
  };

  const tabContainerStyle: React.CSSProperties = {
    display: "flex",
    borderBottom: "1px solid #e0e0e0",
    backgroundColor: "#f8f8f8",
  };

  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "15px",
    textAlign: "center",
    cursor: "pointer",
    fontWeight: isActive ? 600 : 400,
    color: isActive ? "#5b0675ff" : "#666",
    backgroundColor: isActive ? "white" : "transparent",
    borderBottom: isActive ? "3px solid #f82fddff" : "none",
    transition: "all 0.3s ease",
  });

  const formContainerStyle: React.CSSProperties = {
    padding: "30px",
  };

  const inputGroupStyle: React.CSSProperties = {
    marginBottom: 20,
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    marginBottom: 8,
    fontSize: 13,
    fontWeight: 500,
    color: "#333",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 15px",
    borderRadius: 10,
    border: "2px solid #e0e0e0",
    fontSize: 14,
    transition: "all 0.3s ease",
    outline: "none",
    backgroundColor: "white",
  };

  const buttonStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 15,
    background: "linear-gradient(135deg, #f82fddff 0%, #c925b8 100%)",
    color: "white",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(248, 47, 221, 0.3)",
    marginTop: 10,
  };

  const secondaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: "white",
    color: "#5b0675ff",
    border: "2px solid #5b0675ff",
    boxShadow: "none",
  };

  const linkButtonStyle: React.CSSProperties = {
    background: "none",
    border: "none",
    color: "#f82fddff",
    textDecoration: "none",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
    padding: 0,
    marginTop: 15,
    display: "block",
    textAlign: "center",
    transition: "opacity 0.3s ease",
  };

  const dividerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    margin: "25px 0",
    color: "#999",
    fontSize: 13,
  };

  const dividerLineStyle: React.CSSProperties = {
    flex: 1,
    height: 1,
    backgroundColor: "#e0e0e0",
  };

  const dividerTextStyle: React.CSSProperties = {
    padding: "0 15px",
  };

  const modalOverlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    animation: "fadeIn 0.3s ease-in",
  };

  const modalContentStyle: React.CSSProperties = {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 15,
    width: 400,
    maxWidth: "90%",
    boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
    animation: "slideUp 0.3s ease-out",
  };

  const modalHeaderStyle: React.CSSProperties = {
    fontSize: 22,
    fontWeight: 600,
    color: "#5b0675ff",
    marginBottom: 10,
  };

  const stepIndicatorStyle: React.CSSProperties = {
    fontSize: 13,
    color: "#666",
    marginBottom: 20,
    fontWeight: 500,
  };

  return (
    <>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          input:focus {
            border-color: #f82fddff !important;
          }
          button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(248, 47, 221, 0.4);
          }
          button:active {
            transform: translateY(0);
          }
        `}
      </style>
      <div style={pageStyle}>
        <div style={containerStyle}>
          <div style={headerStyle}>
            <h1 style={titleStyle}>SportZone</h1>
            <p style={subtitleStyle}>Welcome back! Please login to continue</p>
          </div>

          <div style={tabContainerStyle}>
            <div
              style={tabStyle(activeTab === "login")}
              onClick={() => setActiveTab("login")}
            >
              Login
            </div>
            <div
              style={tabStyle(activeTab === "register")}
              onClick={() => setActiveTab("register")}
            >
              Register
            </div>
          </div>

          <div style={formContainerStyle}>
            {activeTab === "login" ? (
              <>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Email Address</label>
                  <input
                    style={inputStyle}
                    placeholder="Enter your email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Password</label>
                  <input
                    style={inputStyle}
                    placeholder="Enter your password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>
                <button style={buttonStyle} onClick={handleLogin}>
                  Login
                </button>
                <button style={linkButtonStyle} onClick={openForgotModal}>
                  Forgot Password?
                </button>

                <div style={dividerStyle}>
                  <div style={dividerLineStyle}></div>
                  <span style={dividerTextStyle}>OR</span>
                  <div style={dividerLineStyle}></div>
                </div>

                <button style={secondaryButtonStyle} onClick={handleGoogleLogin}>
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                    <svg width="18" height="18" viewBox="0 0 18 18">
                      <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                      <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                      <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
                      <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
                    </svg>
                    Login with Google
                  </span>
                </button>
              </>
            ) : (
              <>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Username</label>
                  <input
                    style={inputStyle}
                    placeholder="Choose a username"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                  />
                </div>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Email Address</label>
                  <input
                    style={inputStyle}
                    placeholder="Enter your email"
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                  />
                </div>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Password</label>
                  <input
                    style={inputStyle}
                    placeholder="Create a password"
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                  />
                </div>
                <div style={inputGroupStyle}>
                  <label style={labelStyle}>Phone Number</label>
                  <input
                    style={inputStyle}
                    placeholder="Enter your phone number"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                  />
                </div>
                <button style={buttonStyle} onClick={handleRegister}>
                  Create Account
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {showForgotModal && (
        <div style={modalOverlayStyle} onClick={closeForgotModal}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={modalHeaderStyle}>Reset Password</h3>
            <p style={stepIndicatorStyle}>
              Step {forgotStep} of 3
              {forgotStep === 1 && " - Enter Email"}
              {forgotStep === 2 && " - Verify OTP"}
              {forgotStep === 3 && " - New Password"}
            </p>

            {forgotStep === 1 && (
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Email Address</label>
                <input
                  style={inputStyle}
                  placeholder="Enter your email"
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                />
              </div>
            )}

            {forgotStep === 2 && (
              <div style={inputGroupStyle}>
                <label style={labelStyle}>OTP Code</label>
                <input
                  style={inputStyle}
                  placeholder="Enter 6-digit OTP"
                  value={forgotOtp}
                  onChange={(e) => setForgotOtp(e.target.value)}
                  maxLength={6}
                />
              </div>
            )}

            {forgotStep === 3 && (
              <div style={inputGroupStyle}>
                <label style={labelStyle}>New Password</label>
                <input
                  style={inputStyle}
                  placeholder="Enter new password"
                  type="password"
                  value={forgotNewPassword}
                  onChange={(e) => setForgotNewPassword(e.target.value)}
                />
              </div>
            )}

            {forgotMessage && (
              <div
                style={{
                  padding: "12px",
                  borderRadius: 8,
                  marginBottom: 15,
                  backgroundColor: forgotMessage.includes("Error")
                    ? "#fee"
                    : "#efe",
                  color: forgotMessage.includes("Error") ? "#c33" : "#363",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                {forgotMessage}
              </div>
            )}

            <button style={buttonStyle} onClick={handleForgotPassword}>
              {forgotStep === 1 && "Send OTP"}
              {forgotStep === 2 && "Verify OTP"}
              {forgotStep === 3 && "Reset Password"}
            </button>

            <button
              style={{
                ...secondaryButtonStyle,
                marginTop: 10,
              }}
              onClick={closeForgotModal}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
