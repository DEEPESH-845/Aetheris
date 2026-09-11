"use client";

import { useSyncExternalStore } from "react";

const KEY = "aetheris.sidebar";
const listeners = new Set<() => void>();

function read() {
  try {
    return localStorage.getItem(KEY) === "collapsed";
  } catch {
    return false;
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

export function useSidebarCollapsed() {
  return useSyncExternalStore(subscribe, read, () => false);
}

export function setSidebarCollapsed(collapsed: boolean) {
  try {
    localStorage.setItem(KEY, collapsed ? "collapsed" : "expanded");
  } catch {}
  listeners.forEach((cb) => cb());
}
