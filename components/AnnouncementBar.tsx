"use client";

import { useEffect, useState } from "react";

const announcements = [
  "💳 We accept GCash • Maya • Visa • Mastercard • COD",
  "🔥 New Collection Available Now",
  "✨ Premium Streetwear Since 2026",
];

export default function AnnouncementBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % announcements.length);
    }, 3500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed top-0 left-0 z-[60] w-full bg-red-600 text-white">
      <div className="mx-auto max-w-7xl px-6 py-2 text-center">

        <p
          key={index}
          className="animate-pulse text-xs font-bold uppercase tracking-[0.25em] md:text-sm"
        >
          {announcements[index]}
        </p>

      </div>
    </div>
  );
}