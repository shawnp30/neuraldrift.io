/**
 * Beautifies a model ID (e.g., 'author/model-name') into a professional title
 */
export const cleanModelDisplay = (modelId: string) => {
  if (!modelId) return "Unknown Model";

  // 1. Split 'author/model-name' and take the second part
  const parts = modelId.split("/");
  let rawName = parts.length > 1 ? parts[1] : parts[0];

  // 2. Replace underscores and dashes with spaces
  let cleanName = rawName.replace(/[-_]/g, " ");

  // 3. Capitalize the first letter of each word
  cleanName = cleanName
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  // 4. Special handling for common AI terms (keep them uppercase)
  const acronyms = ["Flux", "Sdxl", "Sd", "Llm", "Lora", "Gpt"];
  acronyms.forEach((term) => {
    const regex = new RegExp(`\\b${term}\\b`, "gi");
    cleanName = cleanName.replace(regex, term.toUpperCase());
  });

  return cleanName;
};
