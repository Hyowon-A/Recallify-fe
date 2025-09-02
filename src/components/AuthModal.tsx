import { useEffect, useState } from "react";

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

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

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

    if (!valid) return; // ⛔️ don't submit if invalid

    const endpoint = mode === "login" ? "/api/user/login" : "/api/user/register";
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
      if (data?.token) {
        localStorage.setItem("token", data.token);
      }
      if (data?.email) localStorage.setItem("email", data.email);
      if (data?.name) localStorage.setItem("name", data.name);

      onSuccess({ email: data.email, name: data.name });
    } catch (err) {
      console.error("Request failed", err);
      setFormError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
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
          <button className="text-emerald-700 hover:underline">Forgot password?</button>
          <button onClick={onClose} className="text-gray-500 hover:underline">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}