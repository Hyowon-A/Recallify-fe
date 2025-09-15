import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";

type Mode = "login" | "signup";

export default function AuthModal({
  mode,
  onClose,
  onSwitch,
  onSuccess
}: {
  mode: Mode;
  onClose: () => void;
  onSwitch: (m: Mode) => void;
  onSuccess: (user: { email: string; name: string }) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");

  const [emailError, setEmailError] = useState("");
  const [pwError, setPwError] = useState("");
  const [formError, setFormError] = useState(""); // general error (e.g., network)
  const [loading, setLoading] = useState(false);

  const [forgotPw, setForgotPw] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotError, setForgotError] = useState("");
  const [forgotStatus, setForgotStatus] = useState<null | "sent" | "verified">(null);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [resetCode, setResetCode] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPwError, setNewPwError] = useState("");
  const [confirmPwError, setConfirmPwError] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)\S{8,}$/;

  // Clear field-specific errors as user types
  const onEmailChange = (v: string) => {
    setEmail(v);
    if (emailError) setEmailError("");
    if (formError) setFormError("");
  };
  const onPwChange = (v: string) => {
    setPw(v);
    if (pwError) setPwError("");
    if (formError) setFormError("");
  };
  const onNameChange = (v: string) => setName(v);

  const onNewPwChange = (v: string) => {
    setNewPassword(v);
    if (newPwError) setNewPwError("");
    if (forgotError) setForgotError("");
  };
  const onConfirmPwChange = (v: string) => {
    setConfirmPassword(v);
    if (confirmPwError) setConfirmPwError("");
    if (forgotError) setForgotError("");
  };

  // Reset field + errors when switching tabs
  useEffect(() => {
    setEmailError("");
    setPwError("");
    setFormError("");
  }, [mode]);
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    // trim inputs
    const tEmail = email.trim();
    const tPw = pw.trim();
    const tName = name.trim();

    let valid = true;

    if (!emailRegex.test(tEmail)) {
      setEmailError("Please enter a valid email.");
      valid = false;
    }
    if (!passwordRegex.test(tPw)) {
      setPwError("Password must be 8+ characters with letters & numbers.");
      valid = false;
    }
    if (mode === "signup" && tName.length === 0) {
      setFormError("Please enter your name.");
      valid = false;
    }

    if (!valid) return;

    const endpoint = mode === "login" ? `${API_BASE_URL}/user/login` : `${API_BASE_URL}/user/register`;
    const payload =
      mode === "login" ? { email: tEmail, password: tPw } : { name: tName, email: tEmail, password: tPw };

    try {
      setLoading(true);
      setFormError("");

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Map server errors to fields
        if (mode === "signup") {
          // common patterns: 409 conflict or backend message includes 'exists'
          if (res.status === 409 || /already|exists/i.test(data?.error || "")) {
            setEmailError("This email is already registered.");
          } else {
            setFormError(data?.error || "Sign up failed. Please try again.");
          }
        } else {
          // login
          if (res.status === 401 || /invalid|wrong/i.test(data?.error || "")) {
            setPwError("Incorrect email or password.");
          } else {
            setFormError(data?.error || "Log in failed. Please try again.");
          }
        }
        return;
      }

      // success
      if (data?.accessToken) localStorage.setItem("token", data.accessToken);
      if (data?.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);

      if (data?.email) localStorage.setItem("email", data.email);
      if (data?.name) localStorage.setItem("name", data.name);

      onSuccess({ email: data.email, name: data.name });
    } catch (err) {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (forgotLoading) return;

    const tEmail = forgotEmail.trim();
    if (!emailRegex.test(tEmail)) {
      setForgotError("Please enter a valid email.");
      return;
    }

    try {
      setForgotLoading(true);
      setForgotError("");
      setForgotStatus(null);

      const res = await fetch(`${API_BASE_URL}/user/sendResetCode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: tEmail,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Common backend responses: 404 if not found (avoid leaking), generic error otherwise
        if (res.status === 404) {
          // For security, still show "sent" to avoid account enumeration
          setForgotStatus("sent");
        } else {
          setForgotError(data?.error || "Failed to send reset email. Please try again.");
        }
        return;
      }

      setForgotStatus("sent");
    } catch (err) {
      setForgotError("Something went wrong. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (forgotLoading) return;
  
    if (!/^\d{6}$/.test(resetCode)) {
      setForgotError("Enter the 6-digit code.");
      return;
    }
  
    try {
      setForgotLoading(true);
      setForgotError("");
      const res = await fetch(`${API_BASE_URL}/user/verifyResetCode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim(), code: resetCode }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setForgotError(data?.error);
        return;
      }
      setForgotStatus("verified");
    } catch {
      setForgotError("Something went wrong. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  }

  async function handleSaveNewPassword(e: React.FormEvent) {
    e.preventDefault();
    if (forgotLoading) return;
  
    const pw = newPassword.trim();
    const cpw = confirmPassword.trim();
  
    // client validation
    if (!passwordRegex.test(pw)) {
      setNewPwError("Password must be 8+ characters with letters & numbers.");
      return;
    }
    if (pw !== cpw) {
      setConfirmPwError("Passwords do not match.");
      return;
    }
  
    try {
      setForgotLoading(true);
      setNewPwError("");
      setConfirmPwError("");
      setForgotError("");
  
      const res = await fetch(`${API_BASE_URL}/user/resetPassword`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          },
        body: JSON.stringify({email: forgotEmail.trim(), newPassword: newPassword.trim()}),
      });

      const data = await res.json().catch(() => ({}));
  
      if (!res.ok) {
        setForgotError(data?.error || "Could not reset password.");
        return;
      }
  
      // success: go back to login view (or close modal)
      setForgotStatus(null);
      setForgotPw(false);
      onSwitch("login");
      setEmail(forgotEmail.trim());
    } catch {
      setForgotError("Something went wrong. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  }

  // helper: input classes with red border on error
  const baseInput =
    "w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400";
  const errClass = "border-red-400";
  const okClass = "border-gray-200";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        {!forgotPw ? (
          <>
            {/* Tabs */}
            <div className="mx-auto mb-6 flex w-fit rounded-full bg-gray-100 p-1">
              <button
                onClick={() => onSwitch("login")}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                  mode === "login" ? "bg-white shadow text-emerald-700" : "text-gray-600"
                }`}
              >
                Log in
              </button>
              <button
                onClick={() => onSwitch("signup")}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                  mode === "signup" ? "bg-white shadow text-emerald-700" : "text-gray-600"
                }`}
              >
                Sign up
              </button>
            </div>

            <form className="space-y-3" onSubmit={handleSubmit} noValidate>
              {mode === "signup" && (
                <div>
                  <label className="mb-1 block text-sm font-medium">Name</label>
                  <input
                    value={name}
                    onChange={(e) => onNameChange(e.target.value)}
                    placeholder="Your name"
                    className={`${baseInput} ${okClass}`}
                    autoComplete="name"
                  />
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                  type="email"
                  placeholder="you@example.com"
                  className={`${baseInput} ${emailError ? errClass : okClass}`}
                  aria-invalid={!!emailError}
                  autoComplete="email"
                />
                {emailError && <p className="text-sm text-red-500 mt-1">{emailError}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Password</label>
                <input
                  value={pw}
                  onChange={(e) => onPwChange(e.target.value)}
                  type="password"
                  placeholder="••••••••"
                  className={`${baseInput} ${pwError ? errClass : okClass}`}
                  aria-invalid={!!pwError}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
                {pwError && <p className="text-sm text-red-500 mt-1">{pwError}</p>}
              </div>

              {formError && <p className="text-sm text-red-500">{formError}</p>}

              <button
                className="mt-2 w-full rounded-lg bg-emerald-600 py-2.5 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? (mode === "login" ? "Logging in..." : "Signing up...") : mode === "login" ? "Log in" : "Sign up"}
              </button>
            </form>

            <div className="mt-3 flex items-center justify-between text-sm">
              <button
                className="text-emerald-700 hover:underline"
                onClick={() => {
                  setForgotPw(true);
                  setForgotEmail(email); // prefill with whatever they typed
                  setForgotError("");
                  setForgotStatus(null);
                }}
              >
                Forgot password?
              </button>
              <button onClick={onClose} className="text-gray-500 hover:underline">
                Close
              </button>
            </div>
          </>
        ) : (
          // Forgot Password View
          <>
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Reset your password</h2>
              <p className="text-sm text-gray-600">
                Enter your email and we’ll send you a link to reset your password.
              </p>
            </div>

            <form
              className="space-y-3"
              onSubmit={
                forgotStatus === "verified"
                  ? handleSaveNewPassword
                  : forgotStatus === "sent"
                  ? handleVerifyCode
                  : handleForgotSubmit
              }
              noValidate
            >
              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input
                  value={forgotEmail}
                  onChange={(e) => {
                    setForgotEmail(e.target.value);
                    if (forgotError) setForgotError("");
                  }}
                  type="email"
                  placeholder="you@example.com"
                  className={`${baseInput} ${forgotError && forgotStatus !== "sent" ? errClass : okClass}`}
                  aria-invalid={!!forgotError && forgotStatus !== "sent"}
                  autoComplete="email"
                  disabled={forgotStatus === "sent"} // lock after sending
                />
                {forgotError && forgotStatus !== "sent" && (
                  <p className="text-sm text-red-500 mt-1">{forgotError}</p>
                )}

                {forgotStatus === "sent" && (
                    <>
                      <p className="text-sm text-emerald-600 mt-2">
                        If an account exists for this email, a reset code has been sent.
                      </p>

                      <label className="mt-3 mb-1 block text-sm font-medium">Reset Code</label>
                      <input
                        value={resetCode}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                          setResetCode(v);
                          if (forgotError) setForgotError("");
                        }}
                        inputMode="numeric"
                        pattern="\d{6}"
                        maxLength={6}
                        placeholder="6-digit code"
                        className={`${baseInput} ${forgotError ? errClass : okClass}`}
                        aria-invalid={!!forgotError}
                      />
                      {forgotError && <p className="text-sm text-red-500 mt-1">{forgotError}</p>}
                    </>
                  )}

                  {forgotStatus === "verified" && (
                    <>
                      <div>
                        <label className="mb-1 block text-sm font-medium">New Password</label>
                        <input
                          type="password"
                          className={`${baseInput} ${newPwError ? errClass : okClass}`}
                          value={newPassword}
                          onChange={(e) => onNewPwChange(e.target.value)}
                          placeholder="••••••••"
                          autoComplete="new-password"
                        />
                        {newPwError && <p className="text-sm text-red-500 mt-1">{newPwError}</p>}
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium">Confirm New Password</label>
                        <input
                          type="password"
                          className={`${baseInput} ${confirmPwError ? errClass : okClass}`}
                          value={confirmPassword}
                          onChange={(e) => onConfirmPwChange(e.target.value)}
                          placeholder="••••••••"
                          autoComplete="new-password"
                        />
                        {confirmPwError && <p className="text-sm text-red-500 mt-1">{confirmPwError}</p>}
                      </div>
                      {forgotError && <p className="text-sm text-red-500">{forgotError}</p>}
                    </>
                  )}

                  <button
                    className="mt-2 w-full rounded-lg bg-emerald-600 py-2.5 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
                    disabled={forgotLoading}
                  >
                    {forgotLoading
                      ? forgotStatus === "verified"
                        ? "Saving..."
                        : forgotStatus === "sent"
                        ? "Verifying..."
                        : "Sending..."
                      : forgotStatus === "verified"
                      ? "Save new password"
                      : forgotStatus === "sent"
                      ? "Verify code"
                      : "Send code"}
                  </button>
                  </div>
                </form>

            <div className="mt-3 flex items-center justify-between text-sm">
              <button
                className="text-gray-600 hover:underline"
                onClick={() => {
                  setForgotPw(false);
                  setForgotEmail("");
                  setForgotError("");
                  setForgotStatus(null);
                }}
              >
                ← Back to log in
              </button>
              <button onClick={onClose} className="text-gray-500 hover:underline">
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}