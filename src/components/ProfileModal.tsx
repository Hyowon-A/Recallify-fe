import { useState, useEffect } from "react";
import { fetchWithAuth } from "../auth";
import { API_BASE_URL } from "../config";
import { useTranslation } from "react-i18next";

export default function ProfileModal({
  open,
  onClose,
  user,
  onLogout,
  setUser,
}: {
  open: boolean;
  onClose: () => void;
  user: { name: string; email: string };
  onLogout: () => void;
  setUser: (u: { name: string; email: string }) => void;
}) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [editable, setEditable] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [currentPwError, setCurrentPwError] = useState("");
  const [newPwError, setNewPwError] = useState("");
  const [confirmPwError, setConfirmPwError] = useState("");
  const [nameError, setNameError] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

  const { t } = useTranslation();

  // Clear field-specific errors as user types
  const onNameChange = (v: string) => {
    setName(v);
    if (nameError) setNameError("");
  }
  const onEmailChange = (v: string) => {
    setEmail(v);
    if (emailError) setEmailError("");
  };
  const onCurrentPwChange = (v: string) => {
    setCurrentPassword(v);
    if (currentPwError) setCurrentPwError("");
  };
  const onNewPwChange = (v: string) => {
    setNewPassword(v);
    if (newPwError) setNewPwError("");
  };
  const onConfirmPwChange = (v: string) => {
    setConfirmPassword(v);
    if (confirmPwError) setConfirmPwError("");
  };

  useEffect(() => {
    setName(user.name);
    setEmail(user.email);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setEditable(false);
  }, [user]);

  if (!open) return null;


  async function handleSubmit() {
    let valid = true;

    const body: any = { };
  
    if (name.trim() === "") {
      setNameError("Please enter your name.");
      valid = false;
    }
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email.");
      valid = false;
    }
    if (newPassword.trim()) {
      // validate new password only if provided
      if (!passwordRegex.test(newPassword)) {
        setNewPwError("Password must be 8+ characters with letters & numbers.");
        valid = false;
      }
      if (newPassword !== confirmPassword) {
        setConfirmPwError("New passwords do not match.");
        valid = false;
      }
      if (!currentPassword.trim()) {
        setCurrentPwError("Please enter your current password.");
        valid = false;
      }
    }
    if (!valid) return; // X call API if there is an error

    if (name.trim() !== user.name) {
      body.name = name;
    }
    if (email !== user.email) {
      body.email = email;
    }
    if (newPassword.trim()) {
      body.currentPassword = currentPassword;
      body.newPassword = newPassword;
    }
    
    // X call API if there is no change
    if (Object.keys(body).length === 0) {
      onClose();
      setEditable(false);
      return;
    }    
  
    const res = await fetchWithAuth(`${API_BASE_URL}/user/edit`, {
      method: "PUT",
      body: JSON.stringify(body),        
    });

    // Catch email duplicate and wrong password
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (data?.error) {
        if (data.error.includes("Email")) {
          setEmailError(data.error);
        } else if (data.error.includes("password")) {
          setCurrentPwError(data.error);
        } else {
          alert(data.error);
        }
      } else {
        alert("Something went wrong. Please try again.");
      }
      return;
    }    

    if (data?.name) setName(data.name);
    if (data?.email) setEmail(data.email);
    localStorage.setItem("name", data.name);
    localStorage.setItem("email", data.email);
    if (data?.token) localStorage.setItem("token", data.token);

    setUser({ name: data.name, email: data.email });

    setEditable(false);
    // Clear password fields
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    // Clear all error messages
    setNameError("");
    setEmailError("");
    setCurrentPwError("");
    setNewPwError("");
    setConfirmPwError("");

    onClose();

    alert("Profile updated");
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-bold mb-4">{(t("profile.profile"))}</h2>

        <div className="flex items-center justify-center mb-4">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-600 text-white text-2xl font-bold">
            {name?.[0]?.toUpperCase() ?? "U"}
          </div>
        </div>

        {/* --- Name --- */}
        <div>
          <label className="mb-1 block text-sm font-medium">{(t("profile.name"))}</label>
          <input
            disabled={!editable}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
          />
          {nameError && <p className="text-sm text-red-500 mt-1">{nameError}</p>}
        </div>

        {/* --- Email --- */}
        <div>
          <label className="mb-1 mt-4 block text-sm font-medium">{(t("profile.email"))}</label>
          <input
            disabled={!editable}
            type="email"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
          />
          {emailError && <p className="text-sm text-red-500 mt-1">{emailError}</p>}
        </div>

        {/* --- Password section --- */}
        {editable && (
          <div className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium">{(t("profile.currentPw"))}</label>
              <input
                type="password"
                className="w-full rounded-lg border border-gray-200 px-3 py-2"
                value={currentPassword}
                onChange={(e) => onCurrentPwChange(e.target.value)}
              />
              {currentPwError && <p className="text-sm text-red-500 mt-1">{currentPwError}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{(t("profile.newPw"))}</label>
              <input
                type="password"
                className="w-full rounded-lg border border-gray-200 px-3 py-2"
                value={newPassword}
                onChange={(e) => onNewPwChange(e.target.value)}
              />
              {newPwError && <p className="text-sm text-red-500 mt-1">{newPwError}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{(t("profile.confirmNewPw"))}</label>
              <input
                type="password"
                className="w-full rounded-lg border border-gray-200 px-3 py-2"
                value={confirmPassword}
                onChange={(e) => onConfirmPwChange(e.target.value)}
              />
              {confirmPwError && <p className="text-sm text-red-500 mt-1">{confirmPwError}</p>}
            </div>
          </div>
        )}

        {/* --- Footer Buttons --- */}
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={onLogout}
            className="text-emerald-700 hover:underline"
          >
            {(t("profile.logout"))}
          </button>

          <div className="space-x-2">
            <button
              type="button"
              onClick={() => {
                // Clear password fields
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");

                // Revert fields to original user values
                setName(user.name);
                setEmail(user.email);

                // Clear all error messages
                setNameError("");
                setEmailError("");
                setCurrentPwError("");
                setNewPwError("");
                setConfirmPwError("");

                setEditable(false);

                onClose();
              }}
              className="rounded-lg border px-4 py-2 hover:bg-gray-50"
            >
              {(t("profile.cancel"))}
            </button>

            {editable ? (
              <button
                type="button"
                onClick={handleSubmit}
                className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
              >
                {(t("profile.save"))}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setEditable(true)}
                className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
              >
                {(t("profile.edit"))}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
