"use client";

import { useEffect, useState } from "react";

/** Wall-clock that ticks once per interval, for elapsed-time displays. Starts at 0 on the server. */
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(0);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const id = setInterval(tick, intervalMs);
    const frame = requestAnimationFrame(tick);
    return () => {
      clearInterval(id);
      cancelAnimationFrame(frame);
    };
  }, [intervalMs]);
  return now;
}
