import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 text-center">
      <p className="mb-4 font-mono text-xs uppercase tracking-widest text-accent">
        404
      </p>
      <h1 className="mb-4 font-syne text-5xl font-black text-white">
        Page not found
      </h1>
      <p className="mb-8 max-w-md text-muted">
        This node doesn't exist in the graph. Try navigating back to the hub.
      </p>
      <Link
        href="/"
        className="rounded bg-accent px-6 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-85"
      >
        Back to neuraldrift →
      </Link>
    </div>
  );
}
