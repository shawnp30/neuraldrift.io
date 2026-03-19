import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center text-center px-4">
      <p className="font-mono text-xs text-accent tracking-widest uppercase mb-4">404</p>
      <h1 className="font-syne text-5xl font-black text-white mb-4">Page not found</h1>
      <p className="text-muted mb-8 max-w-md">
        This node doesn't exist in the graph. Try navigating back to the hub.
      </p>
      <Link
        href="/"
        className="bg-accent text-black px-6 py-3 rounded font-semibold text-sm hover:opacity-85 transition-opacity"
      >
        Back to NeuralHub →
      </Link>
    </div>
  );
}
