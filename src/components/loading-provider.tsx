"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import logoWhite from "@/app/logo/logo-jannahflow-white.png";

// ─── Context ──────────────────────────────────────────────────────────────────
type LoadingContextType = {
  showLoading: () => void;
  hideLoading: () => void;
};

const LoadingContext = createContext<LoadingContextType>({
  showLoading: () => {},
  hideLoading: () => {},
});

export function useLoading() {
  return useContext(LoadingContext);
}

// ─── Overlay UI ───────────────────────────────────────────────────────────────
function Overlay({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-[1px] transition-opacity duration-200"
      aria-label="Memproses..."
      role="status"
    >
      {/* Spinner container */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16 animate-pulse">
          <Image src={logoWhite} alt="Loading..." className="w-full h-full object-contain drop-shadow-lg" />
        </div>
      </div>
    </div>
  );
}

// ─── Navigation watcher ───────────────────────────────────────────────────────
function NavigationWatcher({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (prevPath.current !== pathname) {
      // Short delay to let the overlay show, then hide after render
      prevPath.current = pathname;
      const t = setTimeout(onNavigate, 400);
      return () => clearTimeout(t);
    }
  }, [pathname, onNavigate]);

  return null;
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showLoading = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setVisible(true);
  }, []);

  const hideLoading = useCallback(() => {
    // Small grace period so it doesn't flash if action is very fast
    timer.current = setTimeout(() => setVisible(false), 300);
  }, []);

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading }}>
      <NavigationWatcher onNavigate={hideLoading} />
      <Overlay visible={visible} />
      {children}
    </LoadingContext.Provider>
  );
}
