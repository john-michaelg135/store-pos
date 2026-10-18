import { useEffect, useState } from "react";
import { registerSW } from "virtual:pwa-register";
import { RefreshCw, X, WifiOff, Wifi } from "lucide-react";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { syncOutbox } from "../services/offlineSync";

export default function UpdatePrompt() {
  const isOnline = useOnlineStatus();
  const [needRefresh, setNeedRefresh] = useState(false);
  const [updateSW, setUpdateSW] = useState<((reloadPage?: boolean) => Promise<void>) | null>(null);
  const [showOfflineToast, setShowOfflineToast] = useState(false);
  const [showOnlineToast, setShowOnlineToast] = useState(false);

  useEffect(() => {
    const update = registerSW({
      immediate: true,
      onNeedRefresh() {
        setNeedRefresh(true);
      },
      onOfflineReady() {
        console.log("Tindahan POS is ready to work offline");
      },
    });
    setUpdateSW(() => update);
  }, []);

  // Show temporary toast when network changes
  useEffect(() => {
    let timer: any = null;
    if (!isOnline) {
      setShowOfflineToast(true);
      setShowOnlineToast(false);
      timer = setTimeout(() => setShowOfflineToast(false), 3500);
    } else {
      setShowOfflineToast(false);
      setShowOnlineToast(true);
      syncOutbox();
      timer = setTimeout(() => setShowOnlineToast(false), 3500);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isOnline]);

  return (
    <>
      {/* 1. Temporary Offline Toast */}
      {showOfflineToast && !isOnline && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed top-16 left-1/2 -translate-x-1/2 z-[450] flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] text-xs font-medium shadow-xl border border-amber-500/30 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <WifiOff className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600 shrink-0" />
          <span>Offline Mode &bull; Sales &amp; products save locally</span>
        </aside>
      )}

      {/* 2. Temporary Re-Connected Online Toast */}
      {showOnlineToast && isOnline && (
        <aside
          role="status"
          aria-live="polite"
          className="fixed top-16 left-1/2 -translate-x-1/2 z-[450] flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-medium shadow-xl animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <Wifi className="w-3.5 h-3.5 shrink-0" />
          <span>Back Online &bull; Local changes synchronized</span>
        </aside>
      )}

      {/* 3. Update Available Banner */}
      {needRefresh && (
        <aside
          role="alert"
          aria-live="assertive"
          className="fixed bottom-20 left-1/2 z-[80] w-full max-w-[420px] -translate-x-1/2 px-4 animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <div className="flex items-center gap-3 rounded-[4px] border border-[#808080]/20 bg-white dark:bg-[#1a1a1a] dark:border-[#333] py-3 pl-4 pr-3 shadow-xl">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[2px] bg-[#B38B6D]/15 text-[#B38B6D]">
              <RefreshCw className="w-4 h-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-[#1a1a1a] dark:text-white leading-tight">Update available</p>
              <p className="text-[11px] text-[#666] dark:text-[#aaa]">A new version of Tindahan POS is ready.</p>
            </div>
            <button
              type="button"
              onClick={() => updateSW?.(true)}
              className="flex shrink-0 items-center gap-1 rounded-[2px] bg-[#000] dark:bg-white px-3 py-1.5 text-xs font-bold text-white dark:text-[#000] transition-all hover:bg-[#1a1a1a] dark:hover:bg-[#e5e5e5] active:scale-95"
            >
              Reload
            </button>
            <button
              type="button"
              onClick={() => setNeedRefresh(false)}
              className="grid h-7 w-7 shrink-0 place-items-center text-[#808080] hover:text-[#000] dark:hover:text-white"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
