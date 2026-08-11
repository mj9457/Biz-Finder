"use client";

import { useEffect, useRef, useState } from "react";

import type { Company } from "../types";

type KakaoLatLng = {
  getLat: () => number;
  getLng: () => number;
};

type KakaoMapInstance = {
  setCenter: (latLng: KakaoLatLng) => void;
  setLevel: (level: number) => void;
  relayout: () => void;
};

type KakaoMarkerInstance = {
  setMap: (map: KakaoMapInstance | null) => void;
};

type KakaoGeocoderInstance = {
  addressSearch: (
    address: string,
    callback: (result: Array<{ x: string; y: string }>, status: string) => void,
  ) => void;
};

type KakaoMapsInstance = {
  load: (callback: () => void) => void;
  Map: new (
    container: HTMLElement,
    options: { center: KakaoLatLng; level: number },
  ) => KakaoMapInstance;
  LatLng: new (lat: number, lng: number) => KakaoLatLng;
  Marker: new (options: { position: KakaoLatLng; title?: string }) => KakaoMarkerInstance;
  services: {
    Geocoder: new () => KakaoGeocoderInstance;
    Status: { OK: string };
  };
};

type KakaoWindow = Window & {
  kakao?: { maps: KakaoMapsInstance };
  __bfKakaoMapScriptPromise?: Promise<void>;
};

const DEFAULT_CENTER = { lat: 37.6906, lng: 127.2817 };
const KAKAO_MAP_APP_KEY =
  process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY ??
  "6e24b4d7f1dc9780c59cdbda55beb25a";

function loadKakaoMapSdk(appKey: string) {
  const win = window as KakaoWindow;

  if (win.kakao?.maps) {
    return Promise.resolve();
  }

  if (win.__bfKakaoMapScriptPromise) {
    return win.__bfKakaoMapScriptPromise;
  }

  win.__bfKakaoMapScriptPromise = new Promise<void>((resolve, reject) => {
    const onLoaded = () => {
      if (!win.kakao?.maps?.load) {
        reject(new Error("카카오맵을 초기화하지 못했습니다."));
        return;
      }

      win.kakao.maps.load(() => resolve());
    };

    const existingScript = document.querySelector(
      'script[data-bf-kakao-map-sdk="true"]',
    ) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener("load", onLoaded, { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("카카오맵 SDK를 불러오지 못했습니다.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(
      appKey,
    )}&autoload=false&libraries=services`;
    script.async = true;
    script.defer = true;
    script.dataset.bfKakaoMapSdk = "true";
    script.addEventListener("load", onLoaded, { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error("카카오맵 SDK를 불러오지 못했습니다.")),
      { once: true },
    );
    document.head.append(script);
  });

  return win.__bfKakaoMapScriptPromise;
}

function getCompanyCoordinate(company: Company) {
  if (
    typeof company.latitude === "number" &&
    Number.isFinite(company.latitude) &&
    typeof company.longitude === "number" &&
    Number.isFinite(company.longitude)
  ) {
    return { lat: company.latitude, lng: company.longitude };
  }

  return null;
}

export function CompanyLocationMap({ company }: { company: Company }) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<KakaoMapInstance | null>(null);
  const markerRef = useRef<KakaoMarkerInstance | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function initializeMap() {
      try {
        await loadKakaoMapSdk(KAKAO_MAP_APP_KEY);

        if (isCancelled || !mapElementRef.current) {
          return;
        }

        const kakaoMaps = (window as KakaoWindow).kakao?.maps;

        if (!kakaoMaps) {
          throw new Error("카카오맵 객체를 찾을 수 없습니다.");
        }

        const coordinate = getCompanyCoordinate(company);
        const map = new kakaoMaps.Map(mapElementRef.current, {
          center: new kakaoMaps.LatLng(
            coordinate ? coordinate.lat : DEFAULT_CENTER.lat,
            coordinate ? coordinate.lng : DEFAULT_CENTER.lng,
          ),
          level: coordinate ? 4 : 9,
        });
        mapRef.current = map;

        const placeMarker = (lat: number, lng: number) => {
          if (isCancelled) {
            return;
          }

          const position = new kakaoMaps.LatLng(lat, lng);
          map.setCenter(position);
          map.setLevel(4);
          markerRef.current?.setMap(null);
          markerRef.current = new kakaoMaps.Marker({
            position,
            title: company.name,
          });
          markerRef.current.setMap(map);
          map.relayout();
        };

        if (coordinate) {
          placeMarker(coordinate.lat, coordinate.lng);
          return;
        }

        const geocoder = new kakaoMaps.services.Geocoder();
        geocoder.addressSearch(company.address, (result, status) => {
          if (status === kakaoMaps.services.Status.OK && result[0]) {
            placeMarker(Number(result[0].y), Number(result[0].x));
            return;
          }

          setMapError("주소를 지도에서 찾지 못했습니다.");
        });
      } catch (error) {
        if (!isCancelled) {
          setMapError(
            error instanceof Error
              ? error.message
              : "카카오맵을 불러오지 못했습니다.",
          );
        }
      }
    }

    initializeMap();

    return () => {
      isCancelled = true;
      markerRef.current?.setMap(null);
      markerRef.current = null;
      mapRef.current = null;
    };
  }, [company]);

  return (
    <div className="relative h-full min-h-40 overflow-hidden rounded-xl bg-slate-100">
      <div ref={mapElementRef} className="h-full w-full" />
      {mapError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100/90 px-4 text-center text-xs text-slate-500">
          {mapError}
        </div>
      ) : null}
      {!mapError ? (
        <div className="pointer-events-none absolute left-3 top-3 rounded-md bg-white/90 px-2 py-1 text-[11px] font-semibold text-slate-600 shadow-sm">
          {company.address}
        </div>
      ) : null}
    </div>
  );
}
