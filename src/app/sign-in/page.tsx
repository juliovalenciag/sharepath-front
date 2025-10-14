"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function SignInUI() {
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/">
            <img
              src="/kelasvg.svg"
              alt="Kela Logo"
              className="hidden lg:block h-12 w-auto ml-2"
            />
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-gray-800 dark:text-gray-100">
            Welcome to SharePath
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
            Access your account securely and easily
          </p>
        </div>

        <Card className="shadow-md rounded-2xl overflow-hidden">
          <CardContent className="p-6 space-y-6">
            {/* Form — UI only */}
            <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="dalio@mail.com"
                  className="border-b-2 border-gray-300 bg-transparent focus:ring-0 focus:border-accent"
                />
                {/* Inline helper / error placeholder */}
                <p
                  className="text-xs text-muted-foreground h-4"
                  aria-live="polite"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="border-b-2 border-gray-300 bg-transparent pr-10 focus:ring-0 focus:border-accent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {/* Inline helper / error placeholder */}
                <p
                  className="text-xs text-muted-foreground h-4"
                  aria-live="polite"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot your password?
                </button>
              </div>

              {/* Submit — visual only */}
              <Button
                type="submit"
                className="w-full py-3 bg-primary text-white font-semibold rounded-xl shadow hover:shadow-lg"
              >
                <Link href="/dashboard">Sign In</Link>
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center justify-center space-x-2">
              <span className="h-px w-10 bg-gray-300 dark:bg-gray-700" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                or continue with
              </span>
              <span className="h-px w-10 bg-gray-300 dark:bg-gray-700" />
            </div>

            {/* Google button — visual only */}
            <Button variant="outline" className="w-full rounded-xl">
              Continue with Google
            </Button>
          </CardContent>

          <CardFooter className="flex flex-col items-center p-4 bg-gray-100 dark:bg-gray-800">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Don’t have an account?{" "}
              <Link
                href="/sign-up"
                className="text-primary font-medium hover:underline"
              >
                Sign up
              </Link>
            </span>
          </CardFooter>
        </Card>

        {/* Forgot Password Dialog (UI only) */}
        <p>Olvide contraseña</p>
      </div>
    </div>
  );
}
