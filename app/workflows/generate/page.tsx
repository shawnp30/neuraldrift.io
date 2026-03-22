const handleGenerate = async () => {
  const res = await fetch("/api/workflow/generate", {
    method: "POST",
    body: JSON.stringify({
      vram: 12,
      goal: "image",
    }),
  });

  const data = await res.json();
  setResult(data);
};