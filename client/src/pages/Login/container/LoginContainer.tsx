/**
 * Login flow: calls API, saves role, dispatches `auth:changed`, redirects home.
 */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginView from "../components/LoginView";
import { getCurrentUser, login } from "../../../services/api";

const LoginContainer: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password);
      localStorage.setItem("auth_email", email.trim());
      const me = await getCurrentUser();
      localStorage.setItem("auth_role", me.role);
      window.dispatchEvent(new Event("auth:changed"));
      navigate("/");
    } catch {
      setError("Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginView
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
    />
  );
};

export default LoginContainer;

