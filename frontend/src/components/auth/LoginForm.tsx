import { useState } from "react";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";
import { Link } from "react-router-dom";
import { apiUrl } from "../../config/api";
import { setUserData } from "../../utils/auth";
import { usePreloader } from "../../context/PreloaderContext";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setShowPreloader } = usePreloader();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };
    try {
      console.log("Sending login request with data:", { email: data.email });
      const res = await fetch(apiUrl("/api/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      // Get response text first
      const responseText = await res.text();
      console.log("Server response:", responseText);

      if (!res.ok) {
        let errorMessage;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || "Login failed";
        } catch {
          errorMessage = `Server error: ${responseText || res.statusText}`;
        }
        setError(errorMessage);
      } else {
        try {
          const user = JSON.parse(responseText);
          console.log("Login successful, user data:", user);

          if (!user.role) {
            throw new Error("User role not found in response");
          }

          // Simpan user data ke localStorage
          setUserData({
            id: user.id,
            role: user.role,
            email: user.email,
          });

          // Show preloader for 3 seconds
          setShowPreloader(true);
          setTimeout(() => {
            // user.role: 'admin' | 'officer' | 'user'
            if (user.role === "admin") {
              window.location.href = "/admin/datainput";
            } else if (user.role === "officer") {
              window.location.href = "/officer/dashboard";
            } else {
              window.location.href = "/user/reportdata";
            }
          }, 3000);
        } catch (e) {
          console.error("Error parsing user data:", e);
          setError("Invalid response from server");
        }
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Login
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your email and password to login!
            </p>
          </div>
          <div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5"></div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="login-email">
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="info@gmail.com"
                  />
                </div>
                <div>
                  <Label htmlFor="login-password">
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>
                {/* Keep me logged in removed for lint clean */}
                <div>
                  <Button className="w-full" size="sm" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                  </Button>
                  {error && (
                    <div className="mt-2 text-sm text-red-600 dark:text-red-400 text-center">
                      {error}
                    </div>
                  )}
                </div>
              </div>
            </form>

            <div className="mt-5">
              <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
                Don&apos;t have an account? {""}
                <Link
                  to="/register"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  Register
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
