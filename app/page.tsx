export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center px-6 py-16 text-center">
      
      {/* HERO */}
      <h1 className="text-4xl font-bold mb-4">
        Get the Exact AI Workflow for YOUR PC
      </h1>

      <p className="text-lg text-gray-400 mb-8">
        No guesswork. No wasted VRAM. Fully optimized workflows in seconds.
      </p>

      {/* INPUTS */}
      <div className="flex gap-4 mb-6">
        <select className="p-3 rounded bg-black border">
          <option>Select GPU</option>
          <option>8GB</option>
          <option>12GB</option>
          <option>16GB</option>
          <option>24GB</option>
        </select>

        <select className="p-3 rounded bg-black border">
          <option>What do you want to create?</option>
          <option>Images</option>
          <option>Video</option>
          <option>LoRA</option>
        </select>
      </div>

      <button className="bg-white text-black px-6 py-3 rounded font-semibold">
        Generate My Workflow
      </button>

      {/* TRUST */}
      <div className="mt-10 text-sm text-gray-500">
        ✔ Optimized for all GPUs • ✔ Copy & Run • ✔ Tested Workflows
      </div>

    </main>
  );
}