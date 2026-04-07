"use client";

import React from "react";

export default function SignupPage() {
  return (
    <div className="nh-section flex min-h-screen flex-col items-center justify-center">
      <div className="nh-newsletter-box w-full max-w-md !p-12">
        <h1 className="mb-2 text-2xl font-bold text-white">Join NeuralDrift</h1>
        <p className="mb-8 text-sm text-zinc-400">
          Create an account to save workflows and interact with templates.
        </p>

        <form className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email Address"
            className="nh-nl-input !w-full"
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="nh-nl-input !w-full"
            required
          />
          <button type="submit" className="nh-nl-btn mt-2 !w-full">
            Sign Up
          </button>
        </form>

        <p className="mt-6 mt-8 text-center text-xs text-zinc-500">
          Already have an account?{" "}
          <a href="#" className="text-accent hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
