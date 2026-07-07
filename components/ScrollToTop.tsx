"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    requestAnimationFrame(() => {
      window.scrollTo(0, 0);

      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
    });
  }, [pathname]);

  return null;
}