import React from "react";

export default function AuthCallbackPage() {
  return (
    <div className="nh-section flex min-h-screen flex-col items-center justify-center">
      <div className="nh-container text-center">
        <div className="nh-status-dot mx-auto mb-6"></div>
        <h1 className="nh-h2 mb-4 text-3xl">Authenticating...</h1>
        <p className="font-mono text-sm text-zinc-400">
          Please wait while we verify your session.
        </p>
      </div>
    </div>
  );
}
