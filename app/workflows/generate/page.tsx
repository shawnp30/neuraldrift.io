"use client";

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
    <button onClick={handleGenerate}>Generate</button>
    // render result...
  );
}
