import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
  onSuccess: (user: { email: string, name: string}) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const navigate = useNavigate();

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

        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const endpoint = mode === "login" ? "/api/user/login" : "/api/user/register";

            const payload = mode === "login"
              ? { email, password: pw }
              : { name, email, password: pw };     
            console.log(payload);
            try {
              const res = await fetch(endpoint, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
                credentials: "include", // required if you're using cookies for session auth
              });

              if (!res.ok) {
                const errorData = await res.json();
                alert("Auth failed: " + errorData.message);
                return;
              }

              const data = await res.json();
              console.log("Auth success:", data);

              localStorage.setItem("token", data.token);
              localStorage.setItem("email", data.email);
              localStorage.setItem("name", data.name);

              onSuccess({ email: data.email, name: data.name });

              navigate("/dashboard");


            } catch (err) {
              console.error("Request failed", err);
              alert("Something went wrong!");
            }
          }}
        >
          {mode === "signup" && (
            <div>
              <label className="mb-1 block text-sm font-medium">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              type="password"
              placeholder="••••••••"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

        <button className="mt-2 w-full rounded-lg bg-emerald-600 py-2.5 font-semibold text-white hover:bg-emerald-700">
            {mode === "login" ? "Log in" : "Sign up"}
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