"use client";

import React from "react";

export default function ResetPasswordPage() {
  return (
    <div className="nh-section flex min-h-screen flex-col items-center justify-center">
      <div className="nh-newsletter-box w-full max-w-md !p-12">
        <h1 className="mb-2 text-2xl font-bold text-white">Reset Password</h1>
        <p className="mb-8 text-sm text-zinc-400">
          Enter your email to receive a reset link.
        </p>

        <form className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email Address"
            className="nh-nl-input !w-full"
            required
          />
          <button type="submit" className="nh-nl-btn mt-2 !w-full">
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
}
