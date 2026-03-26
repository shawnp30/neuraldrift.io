'use client';

import { useEffect, useState } from 'react';

async function fetchAINews() {
  try {
    const res = await fetch(
      'https://gnews.io/api/v4/search?q=AI OR "machine learning" OR "neural network" OR "stable diffusion" OR "comfyui" OR "hugging face"&lang=en&country=us&max=10&apikey=demo'
    );
    const data = await res.json();

    if (!data.articles) return [];

    return data.articles.map((a: any) => a.title);
  } catch {
    return [];
  }
}

export default function AutoTicker() {
  const [tickerA, setTickerA] = useState<string[]>([]);
  const [tickerB, setTickerB] = useState<string[]>([]);

  // fetch on load + auto refresh every 45s
  useEffect(() => {
    const load = async () => {
      const items = await fetchAINews();

      // split into two tickers
      setTickerA(items.slice(0, 5));
      setTickerB(items.slice(5, 10));
    };

    load();

    const interval = setInterval(load, 45_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">

      {/* Ticker A */}
      <div className="ticker ticker-a">
        <div className="ticker-content">
          {tickerA.map((text, i) => (
            <span key={i}>{text}</span>
          ))}
        </div>
      </div>

      {/* Ticker B */}
      <div className="ticker ticker-b">
        <div className="ticker-content">
          {tickerB.map((text, i) => (
            <span key={i}>{text}</span>
          ))}
        </div>
      </div>

    </div>
  );
}