'use client';

import { useEffect, useState } from "react";
import styles from "./LiveNewsTicker.module.css";

export default function LiveNewsTicker() {
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch("/api/ai-news");
        const data = await res.json();
        if (data?.headlines) setItems(data.headlines);
      } catch (err) {
        console.error(err);
      }
    }

    fetchNews();

    // Refresh news every 5 minutes
    const interval = setInterval(fetchNews, 300000);
    return () => clearInterval(interval);
  }, []);

  if (items.length === 0) return null;

  return (
    <div className={`${styles.siteTicker} ${styles.fixedBottom}`}>
      <div className={styles.tickerTrack}>
        {[...items, ...items].map((item, i) => (
          <span key={i}>{item}</span>
        ))}
      </div>
    </div>
  );
}