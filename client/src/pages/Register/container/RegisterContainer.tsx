/**
 * Registration: customer or business owner; then redirect to login.
 */
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import RegisterView from "../components/RegisterView";
import { register } from "../../../services/api";
import { getSafeReturnPath } from "../../../utils/returnNavigation";

type Role = "customer" | "business_owner";

const RegisterContainer: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("customer");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
        password,
        role,
      });
      setSuccess("Account created. Please login.");
      const returnTo = getSafeReturnPath(
        (location.state as { from?: string } | null)?.from
      );
      setTimeout(
        () =>
          navigate("/login", {
            replace: true,
            state: returnTo ? { from: returnTo } : undefined,
          }),
        600
      );
    } catch {
      setError("Registration failed. Email might already exist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegisterView
      fullName={fullName}
      setFullName={setFullName}
      email={email}
      setEmail={setEmail}
      phoneNumber={phoneNumber}
      setPhoneNumber={setPhoneNumber}
      password={password}
      setPassword={setPassword}
      role={role}
      setRole={setRole}
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      success={success}
    />
  );
};

export default RegisterContainer;

