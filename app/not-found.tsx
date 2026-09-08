import Link from 'next/link';
export default function NotFound() { return <div className="nd-site"><div className="nd-shell nd-page nd-empty"><h1>Page not found</h1><p>This address is not in the NeuralDrift catalog.</p><Link className="nd-button" href="/workflows">Browse workflows</Link></div></div>; }
