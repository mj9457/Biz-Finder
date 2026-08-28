"use client";

import { Download, Share, Smartphone, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

function isIosDevice() {
  if (typeof navigator === "undefined") {
    return false;
  }

  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function isMobileDevice() {
  if (typeof navigator === "undefined") {
    return false;
  }

  return isIosDevice() || /Android|Mobile/i.test(navigator.userAgent);
}

function isStandaloneMode() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

export function PwaInstallPrompt() {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true);
  const [isIos, setIsIos] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setIsIos(isIosDevice());
      setIsMobile(isMobileDevice());
      setIsStandalone(isStandaloneMode());
    });

    const handleBeforeInstallPrompt = (event: Event) => {
      // Keep the native desktop flow intact. On mobile, defer the prompt to
      // the explicit install button so prompt() runs from a user gesture.
      if (!isMobileDevice()) {
        return;
      }

      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      setIsMobile(true);
    };

    const handleAppInstalled = () => {
      setInstallEvent(null);
      setIsStandalone(true);
      setDismissed(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    if ("serviceWorker" in navigator && process.env.NODE_ENV !== "production") {
      // Turbopack replaces JavaScript chunks continuously in development.
      // A service worker can therefore serve a chunk from a different build,
      // producing hydration errors and a mismatched page shell.
      void navigator.serviceWorker.getRegistrations().then(async (registrations) => {
        await Promise.all(registrations.map((registration) => registration.unregister()));
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
      });
    } else if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        })
        .catch((error) => {
          console.error("Failed to register service worker", error);
        });
    }

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const shouldShow = useMemo(() => {
    if (dismissed || isStandalone) {
      return false;
    }

    if (!isMobile) {
      return false;
    }

    return Boolean(installEvent) || isIos;
  }, [dismissed, installEvent, isIos, isMobile, isStandalone]);

  async function handleInstall() {
    const deferredPrompt = installEvent;

    if (!deferredPrompt || isInstalling) {
      return;
    }

    setIsInstalling(true);

    try {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice.catch(() => null);
      setInstallEvent(null);
    } catch (error) {
      console.error("Failed to show the PWA install prompt", error);
    } finally {
      setIsInstalling(false);
    }
  }

  if (!shouldShow) {
    return null;
  }

  return (
    <div className="fixed inset-x-4 bottom-4 z-[3000] mx-auto w-auto max-w-md sm:inset-x-auto sm:right-4 sm:w-[24rem]">
      <section className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur">
        <div className="flex items-start gap-3">
          <div className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Smartphone className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold text-slate-950">
              앱으로 설치
            </h2>
            {installEvent ? (
              <p className="mt-1 text-sm leading-5 text-slate-600">
                홈 화면에 추가하면 앱처럼 바로 실행할 수 있습니다.
              </p>
            ) : (
              <p className="mt-1 text-sm leading-5 text-slate-600">
                iPhone에서는 Safari 공유 메뉴에서{" "}
                <span className="font-semibold text-slate-900">
                  홈 화면에 추가
                </span>
                를 선택해 설치해 주세요.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="설치 안내 닫기"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {installEvent ? (
            <button
              type="button"
              onClick={() => {
                void handleInstall();
              }}
              disabled={isInstalling}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <Download className="size-4" aria-hidden="true" />
              설치하기
            </button>
          ) : (
            <div className="inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm text-slate-700">
              <Share className="size-4 text-slate-500" aria-hidden="true" />
              <span>공유 버튼을 눌러 홈 화면에 추가</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
