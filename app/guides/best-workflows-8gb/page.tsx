export default function Guide() {
  return (
    <div className="p-10">
      <h1 className="text-3xl mb-4">
        Best AI Workflows for 8GB VRAM
      </h1>

      <p className="mb-6">
        If you're running 8GB VRAM, you need optimized workflows to avoid crashes.
      </p>

      <ul className="list-disc ml-6">
        <li>Use SDXL-Lightning</li>
        <li>Lower resolution (768x768)</li>
        <li>Use memory-efficient nodes</li>
      </ul>

      <button className="mt-6 bg-white text-black px-4 py-2 rounded">
        Download Workflow
      </button>
    </div>
  );
}