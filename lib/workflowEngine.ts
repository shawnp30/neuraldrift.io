export function generateWorkflow(input: {
  vram: number;
  goal: string;
}) {
  let model = "SDXL";

  if (input.vram <= 8) model = "SDXL-Lightning";
  if (input.vram >= 12) model = "FLUX";

  return {
    model,
    steps: input.vram <= 8 ? 20 : 30,
    cfg: 6.5,
    estimatedVRAM: `${input.vram - 1}GB`,
  };
}