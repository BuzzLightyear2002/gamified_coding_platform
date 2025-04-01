"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

const SignInForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const { login, user, logout } = useAuth();

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMessage("");

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/signin`,
        data
      );

      if (res.status === 200) {
        const { token } = res.data;
        login(token); // using Auth context to update the navbar.
        router.push("/");
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Sign-in failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Sign In
        </h2>

        {errorMessage && (
          <p className="text-red-500 text-center mt-2">{errorMessage}</p>
        )}

        <form className="mt-4 text-gray-700" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-gray-700">Email</label>
            <input
              {...register("email", { required: "Email is required" })}
              className="w-full px-3 py-2 border rounded-lg"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          <div className="mt-4">
            <label className="block text-gray-700">Password</label>
            <input
              {...register("password", { required: "Password is required" })}
              type="password"
              className="w-full px-3 py-2 border rounded-lg"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-500 transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Processing..." : "Sign In"}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-700">
          Don't have an account?{" "}
          <Link href="/signup" className="text-blue-500 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default function Page() {
  return <SignInForm />;
}
