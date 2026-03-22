"use client";

import { useState } from "react";

export default function GeneratePage() {
  const [result, setResult] = useState(null);

  const handleGenerate = async () => {
    const res = await fetch("/api/workflow/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vram: 12,
        goal: "image",
      }),
    });

    const data = await res.json();
    setResult(data);
  };

  return (
    <div>
      <button onClick={handleGenerate}>Generate</button>
      <pre>{result ? JSON.stringify(result, null, 2) : null}</pre>
    </div>
  );
}
