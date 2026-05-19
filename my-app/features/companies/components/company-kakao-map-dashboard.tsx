"use client";

import Link from "next/link";
import {
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Factory,
  List,
  Leaf,
  Landmark,
  LocateFixed,
  Funnel,
  Hammer,
  MapPin,
  RefreshCw,
  RotateCcw,
  Search,
  Store,
  Truck,
  X,
  Zap,
} from "lucide-react";
import {
  startTransition,
  type SetStateAction,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { formatNumber } from "@/lib/format";
import type { CompanyMapPoint, CompanyMapStats } from "../types";

type CompanyKakaoMapDashboardProps = {
  points: CompanyMapPoint[];
  stats: CompanyMapStats;
};

type KakaoLatLng = {
  getLat: () => number;
  getLng: () => number;
};

type KakaoLatLngBounds = {
  extend: (latLng: KakaoLatLng) => void;
  getSouthWest: () => KakaoLatLng;
  getNorthEast: () => KakaoLatLng;
};

type KakaoMapInstance = {
  getBounds: () => KakaoLatLngBounds;
  setCenter: (latLng: KakaoLatLng) => void;
  setLevel: (level: number) => void;
  getLevel: () => number;
  setBounds: (bounds: KakaoLatLngBounds) => void;
  relayout: () => void;
};

type KakaoMarkerInstance = {
  setMap: (map: KakaoMapInstance | null) => void;
  setImage: (image: unknown) => void;
};

type KakaoCustomOverlayInstance = {
  setMap: (map: KakaoMapInstance | null) => void;
};

type KakaoMarkerClustererInstance = {
  addMarkers: (markers: KakaoMarkerInstance[]) => void;
  clear?: () => void;
  setMap?: (map: KakaoMapInstance | null) => void;
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
  LatLngBounds: new () => KakaoLatLngBounds;
  Point: new (x: number, y: number) => unknown;
  Size: new (width: number, height: number) => unknown;
  MarkerImage: new (
    src: string,
    size: unknown,
    options?: { offset?: unknown },
  ) => unknown;
  Marker: new (options: {
    position: KakaoLatLng;
    title?: string;
    image?: unknown;
  }) => KakaoMarkerInstance;
  CustomOverlay: new (options: {
    content: string | HTMLElement;
    position: KakaoLatLng;
    yAnchor?: number;
    zIndex?: number;
  }) => KakaoCustomOverlayInstance;
  MarkerClusterer: new (
    options: Record<string, unknown>,
  ) => KakaoMarkerClustererInstance;
  services: {
    Geocoder: new () => KakaoGeocoderInstance;
    Status: { OK: string };
  };
  event: {
    addListener: (target: object, type: string, handler: () => void) => void;
  };
};

type KakaoWindow = Window & {
  kakao?: { maps: KakaoMapsInstance };
  __bfKakaoMapScriptPromise?: Promise<void>;
};

type MapBounds = {
  south: number;
  west: number;
  north: number;
  east: number;
};

type KakaoMarkerEntry = {
  marker: KakaoMarkerInstance;
  overlay: KakaoCustomOverlayInstance;
  point: CompanyMapPoint;
};

type LucideIconNode = Array<[string, Record<string, string>]>;
type LucideLikeIcon = {
  render?: (
    props: Record<string, unknown>,
    ref: unknown,
  ) => { props?: { iconNode?: LucideIconNode } };
};

type WindowWithIdleCallback = Window & {
  requestIdleCallback?: (
    callback: () => void,
    options?: { timeout: number },
  ) => number;
  cancelIdleCallback?: (handle: number) => void;
};

const MAP_CENTER = { lat: 37.6906, lng: 127.2817 };
const DEFAULT_LEVEL = 9;
const KAKAO_MAP_APP_KEY =
  process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY ??
  "6e24b4d7f1dc9780c59cdbda55beb25a";

function getCategoryColor(category: string) {
  if (category.includes("제조")) return "#f97316";
  if (category.includes("유통")) return "#10b981";
  if (category.includes("서비스")) return "#8b5cf6";
  if (category.includes("운수")) return "#0ea5e9";
  if (category.includes("건설")) return "#78716c";
  if (category.includes("환경")) return "#22c55e";
  if (category.includes("금융")) return "#2563eb";
  if (category.includes("전기")) return "#eab308";

  return "#475569";
}

function getCategoryTone(category: string) {
  if (category.includes("제조")) {
    return "border-orange-300 bg-orange-50 text-orange-900";
  }
  if (category.includes("유통")) {
    return "border-emerald-300 bg-emerald-50 text-emerald-900";
  }
  if (category.includes("서비스")) {
    return "border-violet-300 bg-violet-50 text-violet-900";
  }
  if (category.includes("운수")) {
    return "border-sky-300 bg-sky-50 text-sky-900";
  }
  if (category.includes("건설")) {
    return "border-stone-300 bg-stone-100 text-stone-900";
  }
  if (category.includes("환경")) {
    return "border-green-300 bg-green-50 text-green-900";
  }

  return "border-slate-300 bg-slate-100 text-slate-900";
}

function getReadableTextColor(hexColor: string) {
  const normalized = hexColor.replace("#", "");
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((character) => `${character}${character}`)
          .join("")
      : normalized;

  const red = Number.parseInt(expanded.slice(0, 2), 16);
  const green = Number.parseInt(expanded.slice(2, 4), 16);
  const blue = Number.parseInt(expanded.slice(4, 6), 16);
  const luminance = (red * 299 + green * 587 + blue * 114) / 1000;

  return luminance >= 150 ? "#0f172a" : "#ffffff";
}

function getLucideIconNode(icon: unknown): LucideIconNode {
  const rendered = (icon as LucideLikeIcon).render?.({}, null);
  return rendered?.props?.iconNode ?? [];
}

function getCategoryIconNode(category: string): LucideIconNode {
  if (category.includes("제조")) return getLucideIconNode(Factory);
  if (category.includes("유통")) return getLucideIconNode(Store);
  if (category.includes("서비스")) return getLucideIconNode(BriefcaseBusiness);
  if (category.includes("운수")) return getLucideIconNode(Truck);
  if (category.includes("건설")) return getLucideIconNode(Hammer);
  if (category.includes("환경")) return getLucideIconNode(Leaf);
  if (category.includes("금융")) return getLucideIconNode(Landmark);
  if (category.includes("전기")) return getLucideIconNode(Zap);

  return getLucideIconNode(Building2);
}

function serializeSvgAttributes(attributes: Record<string, string>) {
  return Object.entries(attributes)
    .filter(([key]) => key !== "key")
    .map(([key, value]) => `${key}="${escapeHtml(String(value))}"`)
    .join(" ");
}

function buildMarkerSvg(point: CompanyMapPoint, selected = false) {
  const categoryColor = getCategoryColor(point.primaryCategory);
  const markerColor = selected ? "#ef4444" : categoryColor;
  const markerRingColor = selected
    ? "#f59e0b"
    : point.isIndustrialArea
      ? "#0f172a"
      : markerColor;
  const iconNode = getCategoryIconNode(point.primaryCategory);
  const iconMarkup = iconNode
    .map(
      ([tagName, attrs]) => `<${tagName} ${serializeSvgAttributes(attrs)} />`,
    )
    .join("");

  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="46" height="62" viewBox="0 0 46 62">',
    `<path d=\"M23 1C12.507 1 4 9.507 4 20c0 13.832 16.613 32.2 18.078 33.787a1.3 1.3 0 0 0 1.844 0C25.387 52.2 42 33.832 42 20 42 9.507 33.493 1 23 1Z\" fill=\"${markerColor}\" stroke=\"${markerRingColor}\" stroke-width=\"3\"/>`,
    '<circle cx="23" cy="20" r="11" fill="rgba(255,255,255,0.18)" />',
    '<g transform="translate(11 8)" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
    iconMarkup,
    "</g>",
    "</svg>",
  ].join("");
}

function createCategoryMarkerImage(
  kakaoMaps: KakaoMapsInstance,
  point: CompanyMapPoint,
  selected = false,
) {
  const imageSrc = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
    buildMarkerSvg(point, selected),
  )}`;
  // const imageSize = new kakaoMaps.Size(46, 62);
  const imageSize = new kakaoMaps.Size(36, 42);
  const imageOption = {
    offset: new kakaoMaps.Point(23, 61),
  };

  return new kakaoMaps.MarkerImage(imageSrc, imageSize, imageOption);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return character;
    }
  });
}

function buildMarkerOverlayElement(point: CompanyMapPoint) {
  const categoryColor = getCategoryColor(point.primaryCategory);
  const badgeTextColor = getReadableTextColor(categoryColor);
  const root = document.createElement("div");
  root.className = "bf-kakao-overlay";
  root.innerHTML = [
    '<div class="bf-kakao-overlay__card">',
    '<div class="bf-kakao-overlay__head">',
    `<strong class="bf-kakao-overlay__title">${escapeHtml(point.name || "기업명 미등록")}</strong>`,
    "</div>",
    `<span class="bf-kakao-overlay__badge" style="background:${categoryColor};color:${badgeTextColor};border-color:${categoryColor};">${escapeHtml(point.primaryCategory || "기타")}</span>`,
    "</div>",
  ].join("");
  root.addEventListener("click", (event) => event.stopPropagation());

  return root;
}

function getCompanyIndustryLabel(point: CompanyMapPoint) {
  return (
    point.industryChamber ||
    point.industry ||
    point.categories.join(", ") ||
    point.primaryCategory ||
    "-"
  );
}

function normalizeSearchText(value: string) {
  return value.trim().toLocaleLowerCase("ko-KR");
}

function matchesSearch(point: CompanyMapPoint, query: string) {
  if (!query) {
    return true;
  }

  return [
    point.name,
    point.region,
    point.district,
    point.industry,
    point.industryChamber ?? "",
    point.mainProduct,
    point.address,
    point.phone,
    ...point.categories,
  ]
    .join(" ")
    .toLocaleLowerCase("ko-KR")
    .includes(query);
}

function createStatLabel(value: number, suffix = "개") {
  return `${formatNumber(value)}${suffix}`;
}

function isPointInBounds(point: CompanyMapPoint, bounds: MapBounds) {
  return (
    point.lat >= bounds.south &&
    point.lat <= bounds.north &&
    point.lng >= bounds.west &&
    point.lng <= bounds.east
  );
}

function isSameBounds(a: MapBounds | null, b: MapBounds | null) {
  if (a === b) {
    return true;
  }

  if (!a || !b) {
    return false;
  }

  const tolerance = 0.00002;

  return (
    Math.abs(a.south - b.south) < tolerance &&
    Math.abs(a.west - b.west) < tolerance &&
    Math.abs(a.north - b.north) < tolerance &&
    Math.abs(a.east - b.east) < tolerance
  );
}

function getMapBounds(map: KakaoMapInstance): MapBounds | null {
  const bounds = map.getBounds();
  const southWest = bounds?.getSouthWest?.();
  const northEast = bounds?.getNorthEast?.();

  if (!southWest || !northEast) {
    return null;
  }

  return {
    south: southWest.getLat(),
    west: southWest.getLng(),
    north: northEast.getLat(),
    east: northEast.getLng(),
  };
}

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
        reject(new Error("Kakao Maps SDK를 초기화하지 못했습니다."));
        return;
      }

      win.kakao.maps.load(() => resolve());
    };

    const existingScript = document.querySelector(
      'script[data-bf-kakao-map-sdk="true"]',
    ) as HTMLScriptElement | null;

    if (existingScript) {
      if (win.kakao?.maps?.load) {
        onLoaded();
        return;
      }

      existingScript.addEventListener("load", onLoaded, { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Kakao Maps SDK 스크립트 로드에 실패했습니다.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(
      appKey,
    )}&autoload=false&libraries=services,clusterer`;
    script.async = true;
    script.defer = true;
    script.dataset.bfKakaoMapSdk = "true";
    script.addEventListener("load", onLoaded, { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error("Kakao Maps SDK 스크립트 로드에 실패했습니다.")),
      { once: true },
    );
    document.head.append(script);
  });

  return win.__bfKakaoMapScriptPromise;
}

function fitMapToPoints(
  kakaoMaps: KakaoMapsInstance,
  map: KakaoMapInstance,
  points: CompanyMapPoint[],
) {
  if (points.length === 0) {
    map.setCenter(new kakaoMaps.LatLng(MAP_CENTER.lat, MAP_CENTER.lng));
    map.setLevel(DEFAULT_LEVEL);
    return;
  }

  const bounds = new kakaoMaps.LatLngBounds();

  for (const point of points) {
    bounds.extend(new kakaoMaps.LatLng(point.lat, point.lng));
  }

  map.setBounds(bounds);
}

export function CompanyKakaoMapDashboard({
  points,
  stats,
}: CompanyKakaoMapDashboardProps) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<KakaoMapInstance | null>(null);
  const kakaoMapsRef = useRef<KakaoMapsInstance | null>(null);
  const geocoderRef = useRef<KakaoGeocoderInstance | null>(null);
  const clustererRef = useRef<KakaoMarkerClustererInstance | null>(null);
  const markerRegistryRef = useRef<Map<string, KakaoMarkerEntry>>(new Map());
  const selectedMarkerIdRef = useRef<string | null>(null);
  const mapIdleTimerRef = useRef<number | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [addressQuery, setAddressQuery] = useState("");
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [queryInput, setQueryInput] = useState("");
  const [query, setQuery] = useState("");
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mapRenderNonce, setMapRenderNonce] = useState(0);
  const [isCompanyListOpen, setIsCompanyListOpen] = useState(false);

  const normalizedQuery = normalizeSearchText(query);
  const deferredMapBounds = useDeferredValue(mapBounds);
  const filteredPoints = useMemo(
    () =>
      points.filter((point) => {
        if (activeRegion && point.region !== activeRegion) {
          return false;
        }

        if (activeCategory && point.primaryCategory !== activeCategory) {
          return false;
        }

        return matchesSearch(point, normalizedQuery);
      }),
    [activeCategory, activeRegion, normalizedQuery, points],
  );
  const categoryCountBasePoints = useMemo(
    () =>
      points.filter((point) => {
        if (activeRegion && point.region !== activeRegion) {
          return false;
        }

        return matchesSearch(point, normalizedQuery);
      }),
    [activeRegion, normalizedQuery, points],
  );
  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();

    for (const point of categoryCountBasePoints) {
      counts.set(
        point.primaryCategory,
        (counts.get(point.primaryCategory) ?? 0) + 1,
      );
    }

    return stats.categoryCounts.map((category) => ({
      value: category.value,
      count: counts.get(category.value) ?? 0,
    }));
  }, [categoryCountBasePoints, stats.categoryCounts]);
  const mapPoints = useMemo(() => filteredPoints, [filteredPoints]);
  const visibleMapPoints = useMemo(
    () =>
      deferredMapBounds
        ? filteredPoints.filter((point) =>
            isPointInBounds(point, deferredMapBounds),
          )
        : filteredPoints,
    [deferredMapBounds, filteredPoints],
  );
  const activeCompany = useMemo(
    () =>
      activeCompanyId
        ? (filteredPoints.find((point) => point.id === activeCompanyId) ?? null)
        : null,
    [activeCompanyId, filteredPoints],
  );
  const visibleCompanyList = useMemo(
    () =>
      visibleMapPoints.toSorted(
        (a, b) =>
          Number(b.isManufacturing) - Number(a.isManufacturing) ||
          a.name.localeCompare(b.name, "ko-KR"),
      ),
    [visibleMapPoints],
  );
  const hasActiveFilters = Boolean(activeRegion || activeCategory || query);

  const updateActiveCompanyId = useCallback(
    (next: SetStateAction<string | null>) => {
      startTransition(() => {
        setActiveCompanyId(next);
      });
    },
    [],
  );

  const syncMapBounds = useCallback((map: KakaoMapInstance) => {
    const nextBounds = getMapBounds(map);
    startTransition(() => {
      setMapBounds((currentBounds) =>
        isSameBounds(currentBounds, nextBounds) ? currentBounds : nextBounds,
      );
    });
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const syncCompanyListVisibility = () => {
      setIsCompanyListOpen(mediaQuery.matches);
    };

    syncCompanyListVisibility();
    mediaQuery.addEventListener("change", syncCompanyListVisibility);

    return () => {
      mediaQuery.removeEventListener("change", syncCompanyListVisibility);
    };
  }, []);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1280px)");
    const closeSidebarOnDesktop = () => {
      if (desktopQuery.matches) {
        setIsSidebarOpen(false);
      }
    };

    closeSidebarOnDesktop();
    desktopQuery.addEventListener("change", closeSidebarOnDesktop);

    return () => {
      desktopQuery.removeEventListener("change", closeSidebarOnDesktop);
    };
  }, []);

  useEffect(() => {
    if (!isSidebarOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    const idleWindow = window as WindowWithIdleCallback;
    let isCancelled = false;
    let idleHandle: number | null = null;
    let fallbackHandle: number | null = null;

    async function initializeMap() {
      if (!KAKAO_MAP_APP_KEY) {
        setMapError("Kakao JavaScript 키가 설정되지 않았습니다.");
        return;
      }

      try {
        await loadKakaoMapSdk(KAKAO_MAP_APP_KEY);

        if (isCancelled || !mapElementRef.current || mapRef.current) {
          return;
        }

        const kakaoMaps = (window as KakaoWindow).kakao?.maps;

        if (!kakaoMaps) {
          setMapError("Kakao Maps 객체를 찾을 수 없습니다.");
          return;
        }

        const map = new kakaoMaps.Map(mapElementRef.current, {
          center: new kakaoMaps.LatLng(MAP_CENTER.lat, MAP_CENTER.lng),
          level: DEFAULT_LEVEL,
        });
        const geocoder = new kakaoMaps.services.Geocoder();
        const clusterer = new kakaoMaps.MarkerClusterer({
          map,
          averageCenter: true,
          minLevel: 8,
          disableClickZoom: false,
          calculator: [10, 30, 100],
          texts: (size: number) => formatNumber(size),
          styles: [
            {
              width: "40px",
              height: "40px",
              background: "#0f172a",
              color: "#ffffff",
              borderRadius: "999px",
              fontWeight: "800",
              lineHeight: "40px",
              textAlign: "center",
              border: "3px solid #ffffff",
            },
            {
              width: "46px",
              height: "46px",
              background: "#ea580c",
              color: "#ffffff",
              borderRadius: "999px",
              fontWeight: "800",
              lineHeight: "46px",
              textAlign: "center",
              border: "3px solid #ffffff",
            },
            {
              width: "54px",
              height: "54px",
              background: "#dc2626",
              color: "#ffffff",
              borderRadius: "999px",
              fontWeight: "800",
              lineHeight: "54px",
              textAlign: "center",
              border: "3px solid #ffffff",
            },
            {
              width: "60px",
              height: "60px",
              background: "#7c2d12",
              color: "#ffffff",
              borderRadius: "999px",
              fontWeight: "800",
              lineHeight: "60px",
              textAlign: "center",
              border: "3px solid #ffffff",
            },
          ],
        });

        kakaoMaps.event.addListener(map, "idle", () => {
          if (mapIdleTimerRef.current !== null) {
            window.clearTimeout(mapIdleTimerRef.current);
          }

          mapIdleTimerRef.current = window.setTimeout(() => {
            syncMapBounds(map);
            mapIdleTimerRef.current = null;
          }, 220);
        });
        kakaoMaps.event.addListener(map, "click", () => {
          updateActiveCompanyId(null);
        });

        kakaoMapsRef.current = kakaoMaps;
        geocoderRef.current = geocoder;
        clustererRef.current = clusterer;
        mapRef.current = map;
        setMapError(null);
        setIsMapReady(true);

        window.setTimeout(() => {
          map.relayout();
          syncMapBounds(map);
        }, 120);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "카카오 지도를 불러오는 중 오류가 발생했습니다.";
        setMapError(message);
      }
    }

    if (idleWindow.requestIdleCallback) {
      idleHandle = idleWindow.requestIdleCallback(
        () => {
          void initializeMap();
        },
        { timeout: 1200 },
      );
    } else {
      fallbackHandle = window.setTimeout(() => {
        void initializeMap();
      }, 50);
    }
    const markerRegistry = markerRegistryRef.current;

    return () => {
      isCancelled = true;
      if (idleHandle !== null && idleWindow.cancelIdleCallback) {
        idleWindow.cancelIdleCallback(idleHandle);
      }
      if (fallbackHandle !== null) {
        window.clearTimeout(fallbackHandle);
      }
      if (mapIdleTimerRef.current !== null) {
        window.clearTimeout(mapIdleTimerRef.current);
        mapIdleTimerRef.current = null;
      }
      if (clustererRef.current) {
        clustererRef.current.clear?.();
        clustererRef.current.setMap?.(null);
      }

      for (const entry of markerRegistry.values()) {
        entry.overlay.setMap(null);
        entry.marker.setMap(null);
      }

      markerRegistry.clear();
      mapRef.current = null;
      kakaoMapsRef.current = null;
      geocoderRef.current = null;
      clustererRef.current = null;
      selectedMarkerIdRef.current = null;
    };
  }, [syncMapBounds, updateActiveCompanyId]);

  useEffect(() => {
    const kakaoMaps = kakaoMapsRef.current;
    const map = mapRef.current;
    const clusterer = clustererRef.current;

    if (!isMapReady || !kakaoMaps || !map || !clusterer) {
      return;
    }

    for (const entry of markerRegistryRef.current.values()) {
      entry.overlay.setMap(null);
      entry.marker.setMap(null);
    }

    markerRegistryRef.current.clear();
    clusterer.clear?.();
    selectedMarkerIdRef.current = null;

    const markers: KakaoMarkerInstance[] = [];

    for (const point of mapPoints) {
      const position = new kakaoMaps.LatLng(point.lat, point.lng);
      const marker = new kakaoMaps.Marker({
        position,
        title: point.name || "기업명 미등록",
        image: createCategoryMarkerImage(kakaoMaps, point, false),
      });
      const overlayContent = buildMarkerOverlayElement(point);
      const overlay = new kakaoMaps.CustomOverlay({
        content: overlayContent,
        position,
        yAnchor: 1.26,
        zIndex: 8,
      });

      kakaoMaps.event.addListener(marker, "click", () => {
        updateActiveCompanyId((current) =>
          current === point.id ? null : point.id,
        );
      });

      markerRegistryRef.current.set(point.id, {
        marker,
        overlay,
        point,
      });
      markers.push(marker);
    }

    if (markers.length > 0) {
      clusterer.addMarkers(markers);
    }
  }, [
    isMapReady,
    mapPoints,
    mapRenderNonce,
    syncMapBounds,
    updateActiveCompanyId,
  ]);

  useEffect(() => {
    const kakaoMaps = kakaoMapsRef.current;
    const map = mapRef.current;

    if (!isMapReady || !kakaoMaps || !map) {
      return;
    }

    const previousId = selectedMarkerIdRef.current;
    const previousEntry = previousId
      ? markerRegistryRef.current.get(previousId)
      : null;

    if (previousEntry) {
      previousEntry.marker.setImage(
        createCategoryMarkerImage(kakaoMaps, previousEntry.point, false),
      );
      previousEntry.overlay.setMap(null);
    }

    const currentEntry = activeCompanyId
      ? markerRegistryRef.current.get(activeCompanyId)
      : null;

    if (currentEntry) {
      currentEntry.marker.setImage(
        createCategoryMarkerImage(kakaoMaps, currentEntry.point, true),
      );
      currentEntry.overlay.setMap(map);
      selectedMarkerIdRef.current = activeCompanyId;
      return;
    }

    selectedMarkerIdRef.current = null;
  }, [activeCompanyId, isMapReady, mapPoints]);

  useEffect(() => {
    const kakaoMaps = kakaoMapsRef.current;
    const map = mapRef.current;

    if (!isMapReady || !kakaoMaps || !map) {
      return;
    }

    fitMapToPoints(kakaoMaps, map, mapPoints);
    syncMapBounds(map);
  }, [isMapReady, mapPoints, mapRenderNonce, syncMapBounds]);

  function resetFilters() {
    setActiveRegion(null);
    setActiveCategory(null);
    setQueryInput("");
    setQuery("");
    updateActiveCompanyId(null);
  }

  function applyKeywordSearch() {
    setQuery(queryInput);
    updateActiveCompanyId(null);
  }

  function resetMapRender() {
    const kakaoMaps = kakaoMapsRef.current;
    const map = mapRef.current;

    setMapRenderNonce((current) => current + 1);

    if (!kakaoMaps || !map) {
      return;
    }

    map.relayout();
    fitMapToPoints(kakaoMaps, map, mapPoints);
    syncMapBounds(map);

    window.setTimeout(() => {
      map.relayout();
      syncMapBounds(map);
    }, 120);
  }

  function focusCompanyOnMap(company: CompanyMapPoint) {
    const kakaoMaps = kakaoMapsRef.current;
    const map = mapRef.current;

    updateActiveCompanyId(company.id);

    if (!kakaoMaps || !map) {
      return;
    }

    const position = new kakaoMaps.LatLng(company.lat, company.lng);
    map.setCenter(position);

    if (map.getLevel() > 4) {
      map.setLevel(4);
    }

    const markerEntry = markerRegistryRef.current.get(company.id);

    if (markerEntry) {
      markerEntry.overlay.setMap(map);
    }

    syncMapBounds(map);
  }

  function searchByAddress() {
    const kakaoMaps = kakaoMapsRef.current;
    const map = mapRef.current;
    const geocoder = geocoderRef.current;
    const normalizedAddress = addressQuery.trim();

    if (!kakaoMaps || !map || !geocoder || !normalizedAddress) {
      return;
    }

    setSearchError(null);

    geocoder.addressSearch(
      normalizedAddress,
      (result: Array<{ x: string; y: string }>, status: string) => {
        if (status !== kakaoMaps.services.Status.OK || result.length === 0) {
          setSearchError("주소 검색 결과가 없습니다.");
          return;
        }

        const coordinate = result[0];
        const target = new kakaoMaps.LatLng(
          Number(coordinate.y),
          Number(coordinate.x),
        );

        map.setCenter(target);

        if (map.getLevel() > 4) {
          map.setLevel(4);
        }

        setSearchError(null);
        syncMapBounds(map);
      },
    );
  }

  return (
    <section className="grid min-h-[calc(100vh-150px)] gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
      <div className="min-w-0 overflow-hidden bg-white shadow-sm md:rounded-lg md:border md:border-slate-200 xl:order-2">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 xl:hidden">
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold text-slate-950">
              회원사 지도
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <Funnel className="size-4" aria-hidden="true" />
            필터
          </button>
        </div>
        <div className="hidden min-w-0 items-center justify-between gap-4 border-b border-slate-200 px-4 py-3 xl:flex">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-slate-950">
              회원사 지도
            </h1>
            <p className="text-sm text-slate-600">
              지역·업종 필터로 회원사 위치를 확인합니다.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={resetMapRender}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              지도 초기화
            </button>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <RotateCcw className="size-4" aria-hidden="true" />
                필터 초기화
              </button>
            ) : null}
          </div>
        </div>
        <div className="relative h-[72svh] min-h-[420px] sm:h-[68svh] xl:h-[calc(100svh-230px)]">
          <div
            ref={mapElementRef}
            className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,#dbeafe,transparent_35%),radial-gradient(circle_at_80%_15%,#bbf7d0,transparent_32%),#e2e8f0]"
          />
          {mapError ? (
            <div className="absolute inset-0 z-[500] grid place-items-center bg-white/90 px-6 text-center text-sm font-semibold text-red-700">
              {mapError}
            </div>
          ) : !isMapReady ? (
            <div className="absolute inset-0 z-[500] grid place-items-center bg-white/80 text-sm font-semibold text-slate-700">
              지도 불러오는 중
            </div>
          ) : null}
          {searchError ? (
            <div className="absolute left-4 top-4 z-[560] max-w-[calc(100%-32px)] rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 shadow">
              {searchError}
            </div>
          ) : null}
          <div
            className={[
              "absolute z-[550] hidden md:block transition-all duration-200",
              isCompanyListOpen
                ? "inset-x-4 bottom-4 top-3 sm:inset-x-auto sm:right-4 sm:top-4 sm:w-80"
                : "right-4 top-3 sm:top-4",
            ].join(" ")}
          >
            {isCompanyListOpen ? (
              <div className="flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white/95 shadow-2xl backdrop-blur">
                <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-3 py-3">
                  <div className="min-w-0">
                    <h2 className="inline-flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-950">
                      <List
                        className="size-4 shrink-0 text-slate-500"
                        aria-hidden="true"
                      />
                      <span className="min-w-0 truncate">업종별 기업 목록</span>
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      {activeCategory ?? "전체 업종"} ·{" "}
                      {formatNumber(visibleCompanyList.length)}개
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCompanyListOpen(false)}
                    aria-label="기업 목록 접기"
                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <ChevronRight className="size-4" aria-hidden="true" />
                  </button>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto p-2">
                  {visibleCompanyList.length > 0 ? (
                    <ul className="grid gap-2">
                      {visibleCompanyList.map((company) => {
                        const selected = activeCompanyId === company.id;

                        return (
                          <li key={company.id}>
                            <button
                              type="button"
                              onClick={() => focusCompanyOnMap(company)}
                              className={[
                                "grid w-full gap-1 rounded-md border px-3 py-2 text-left transition focus:outline-none focus:ring-2 focus:ring-primary/20",
                                selected
                                  ? "border-primary bg-primary/10"
                                  : "border-slate-200 bg-white hover:border-primary/40 hover:bg-slate-50",
                              ].join(" ")}
                            >
                              <span className="line-clamp-1 text-sm font-semibold text-slate-950">
                                {company.name || "기업명 미등록"}
                              </span>
                              <span className="line-clamp-1 text-xs text-slate-600">
                                {company.mainProduct ||
                                  getCompanyIndustryLabel(company)}
                              </span>
                              <span className="line-clamp-1 text-xs text-slate-400">
                                {company.region || "-"} ·{" "}
                                {getCompanyIndustryLabel(company)}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div className="grid h-full place-items-center px-4 text-center text-sm text-slate-500">
                      선택한 조건에 해당하는 기업이 없습니다.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsCompanyListOpen(true)}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white/95 px-3 text-sm font-semibold text-slate-700 shadow-lg backdrop-blur transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
                기업 목록
              </button>
            )}
          </div>
          <div className="pointer-events-none absolute left-4 top-4 z-[500] hidden max-w-[calc(100%-32px)] gap-2 md:grid md:max-w-sm">
            <div className="rounded-lg border border-white/70 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                현재 지도에 보이는 회원사
              </p>
              <strong className="mt-1 block text-2xl font-semibold text-slate-950 sm:text-3xl">
                {createStatLabel(visibleMapPoints.length)}
              </strong>
              <span className="mt-1 block text-sm text-slate-600">
                필터 + 지도 영역 기준
              </span>
            </div>
          </div>
          {activeCompany ? (
            <div className="absolute bottom-10 left-4 z-[600] hidden max-h-[min(62vh,430px)] w-[380px] overflow-y-auto overscroll-contain rounded-lg border border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur md:block">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="inline-flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-900">
                  <LocateFixed
                    className="size-4 shrink-0 text-slate-500"
                    aria-hidden="true"
                  />
                  <span className="min-w-0 truncate">선택 기업</span>
                </div>
                <button
                  type="button"
                  onClick={() => updateActiveCompanyId(null)}
                  aria-label="선택 기업 닫기"
                  className="inline-flex size-8 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
              <div className="grid gap-3">
                <strong className="break-words text-base font-semibold text-slate-950">
                  {activeCompany.name || "기업명 미등록"}
                </strong>
                <dl className="grid gap-2 text-sm">
                  <div className="grid gap-1">
                    <dt className="text-xs font-semibold text-slate-500">
                      업종
                    </dt>
                    <dd className="text-slate-800">
                      {getCompanyIndustryLabel(activeCompany)}
                    </dd>
                  </div>
                  <div className="grid gap-1">
                    <dt className="text-xs font-semibold text-slate-500">
                      주요품목
                    </dt>
                    <dd className="text-slate-800">
                      {activeCompany.mainProduct || "-"}
                    </dd>
                  </div>
                  <div className="grid gap-1">
                    <dt className="text-xs font-semibold text-slate-500">
                      주소
                    </dt>
                    <dd className="text-slate-600">
                      {activeCompany.address || "-"}
                    </dd>
                  </div>
                  <div className="grid gap-1">
                    <dt className="text-xs font-semibold text-slate-500">
                      연락처
                    </dt>
                    <dd className="text-slate-600">
                      {activeCompany.phone || "-"}
                    </dd>
                  </div>
                </dl>
                <Link
                  href={`/companies/${activeCompany.id}`}
                  className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  상세 보기
                </Link>
              </div>
            </div>
          ) : null}
          <div className="fixed inset-x-0 bottom-0 z-[650] md:hidden">
            <div
              className={[
                "overflow-hidden rounded-t-2xl border border-slate-200 bg-white/95 shadow-2xl backdrop-blur transition-[height] duration-200",
                isCompanyListOpen
                  ? "h-[56vh]"
                  : activeCompany
                    ? "h-24"
                    : "h-16",
              ].join(" ")}
            >
              <div className="flex h-full flex-col">
                <button
                  type="button"
                  onClick={() => setIsCompanyListOpen((current) => !current)}
                  aria-expanded={isCompanyListOpen}
                  aria-label={
                    isCompanyListOpen ? "기업 목록 접기" : "기업 목록 펼치기"
                  }
                  className="grid gap-1 border-b border-slate-200 px-3 py-2 text-left transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <span className="mx-auto h-1.5 w-10 rounded-full bg-slate-300" />
                  <span className="inline-flex items-center justify-between gap-3">
                    <span className="inline-flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-950">
                      <List
                        className="size-4 shrink-0 text-slate-500"
                        aria-hidden="true"
                      />
                      <span className="min-w-0 truncate">업종별 기업 목록</span>
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <span className="shrink-0 text-xs text-slate-500">
                        {activeCategory ?? "전체 업종"} ·{" "}
                        {formatNumber(visibleCompanyList.length)}개
                      </span>
                      {isCompanyListOpen ? (
                        <ChevronDown
                          className="size-4 shrink-0 text-slate-500"
                          aria-hidden="true"
                        />
                      ) : (
                        <ChevronUp
                          className="size-4 shrink-0 text-slate-500"
                          aria-hidden="true"
                        />
                      )}
                    </span>
                  </span>
                </button>
                {activeCompany ? (
                  <div className="border-b border-slate-200 px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="line-clamp-1 text-xs font-semibold text-slate-900">
                        {activeCompany.name || "기업명 미등록"}
                      </span>
                      <Link
                        href={`/companies/${activeCompany.id}`}
                        className="shrink-0 rounded border border-slate-300 px-2 py-0.5 text-[11px] font-semibold text-slate-700"
                      >
                        상세
                      </Link>
                    </div>
                    <p className="mt-1 line-clamp-1 text-[11px] text-slate-500">
                      {activeCompany.mainProduct ||
                        getCompanyIndustryLabel(activeCompany)}
                    </p>
                  </div>
                ) : null}
                {isCompanyListOpen ? (
                  <div className="min-h-0 flex-1 overflow-y-auto p-2">
                    {visibleCompanyList.length > 0 ? (
                      <ul className="grid gap-2">
                        {visibleCompanyList.map((company) => {
                          const selected = activeCompanyId === company.id;

                          return (
                            <li key={company.id}>
                              <button
                                type="button"
                                onClick={() => {
                                  focusCompanyOnMap(company);
                                  setIsCompanyListOpen(false);
                                }}
                                className={[
                                  "grid w-full gap-1 rounded-md border px-3 py-2 text-left transition focus:outline-none focus:ring-2 focus:ring-primary/20",
                                  selected
                                    ? "border-primary bg-primary/10"
                                    : "border-slate-200 bg-white hover:border-primary/40 hover:bg-slate-50",
                                ].join(" ")}
                              >
                                <span className="line-clamp-1 text-sm font-semibold text-slate-950">
                                  {company.name || "기업명 미등록"}
                                </span>
                                <span className="line-clamp-1 text-xs text-slate-600">
                                  {company.mainProduct ||
                                    getCompanyIndustryLabel(company)}
                                </span>
                                <span className="line-clamp-1 text-xs text-slate-400">
                                  {company.region || "-"} ·{" "}
                                  {getCompanyIndustryLabel(company)}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <div className="grid h-full place-items-center px-4 text-center text-sm text-slate-500">
                        선택한 조건에 해당하는 기업이 없습니다.
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <aside
        className={[
          "fixed inset-0 z-[2000] xl:static xl:z-auto",
          isSidebarOpen
            ? "pointer-events-auto"
            : "pointer-events-none xl:pointer-events-auto",
        ].join(" ")}
      >
        <button
          type="button"
          aria-label="필터 메뉴 닫기"
          onClick={() => setIsSidebarOpen(false)}
          className={[
            "absolute inset-0 bg-slate-900/35 transition-opacity xl:hidden",
            isSidebarOpen ? "opacity-100" : "opacity-0",
          ].join(" ")}
        />
        <div
          className={[
            "absolute inset-y-0 right-0 z-[2010] w-[min(92vw,380px)] overflow-y-auto bg-slate-50 p-4 shadow-2xl transition-transform duration-200 xl:static xl:w-auto xl:translate-x-0 xl:overflow-visible xl:bg-transparent xl:p-0 xl:shadow-none",
            isSidebarOpen
              ? "translate-x-0"
              : "translate-x-full xl:translate-x-0",
          ].join(" ")}
        >
          <div className="mb-3 flex items-center justify-between xl:hidden">
            <h2 className="text-sm font-semibold text-slate-900">필터 메뉴</h2>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="inline-flex size-8 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label="필터 메뉴 닫기"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
          <div className="grid content-start gap-4 xl:gap-3">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm xl:p-3">
              <label
                htmlFor="company-map-search"
                className="text-sm font-semibold text-slate-800"
              >
                기업명·품목 검색
              </label>
              <div className="mt-2 flex min-w-0 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                <Search
                  className="size-4 shrink-0 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id="company-map-search"
                  value={queryInput}
                  onChange={(event) => {
                    setQueryInput(event.target.value);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                    }
                  }}
                  placeholder="기업명, 주소, 주요품목"
                  className="h-11 min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
                {queryInput ? (
                  <button
                    type="button"
                    onClick={() => setQueryInput("")}
                    aria-label="검색어 지우기"
                    className="inline-flex size-7 items-center justify-center rounded text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={applyKeywordSearch}
                  className="inline-flex h-8 items-center justify-center rounded-md border border-slate-300 px-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  검색
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm xl:p-3">
              <label
                htmlFor="company-map-address-search"
                className="text-sm font-semibold text-slate-800"
              >
                주소 검색
              </label>
              <div className="mt-2 flex min-w-0 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                <MapPin className="size-4 shrink-0 text-slate-400" />
                <input
                  id="company-map-address-search"
                  value={addressQuery}
                  onChange={(event) => setAddressQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      searchByAddress();
                    }
                  }}
                  placeholder="예: 경기 남양주시 다산동"
                  className="h-11 min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={searchByAddress}
                  className="inline-flex h-8 items-center justify-center rounded-md border border-slate-300 px-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  이동
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm xl:p-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <MapPin
                    className="size-4 text-slate-500"
                    aria-hidden="true"
                  />
                  지역
                </h2>
                <span className="text-xs text-slate-500">
                  {activeRegion ?? "전체"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveRegion(null);
                    updateActiveCompanyId(null);
                  }}
                  aria-pressed={!activeRegion}
                  className={[
                    "h-10 rounded-md border px-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary/20",
                    !activeRegion
                      ? "border-primary bg-primary text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:border-primary hover:text-primary",
                  ].join(" ")}
                >
                  전체
                </button>
                {stats.regionCounts.map((region) => {
                  const selected = activeRegion === region.value;

                  return (
                    <button
                      key={region.value}
                      type="button"
                      onClick={() => {
                        setActiveRegion(selected ? null : region.value);
                        updateActiveCompanyId(null);
                      }}
                      aria-pressed={selected}
                      className={[
                        "flex h-10 items-center justify-between gap-2 rounded-md border px-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary/20",
                        selected
                          ? "border-primary bg-primary text-white"
                          : "border-slate-300 bg-white text-slate-700 hover:border-primary hover:text-primary",
                      ].join(" ")}
                    >
                      <span>{region.value}</span>
                      <span>{formatNumber(region.count)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm xl:p-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <List className="size-4 text-slate-500" aria-hidden="true" />
                  업종별 필터
                </h2>
                <span className="text-xs text-slate-500">
                  {activeCategory ?? "전체"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveCategory(null);
                    updateActiveCompanyId(null);
                  }}
                  aria-pressed={!activeCategory}
                  className={[
                    "flex min-h-10 items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary/20 xl:min-h-9 xl:px-2 xl:py-1.5 xl:text-xs",
                    !activeCategory
                      ? "border-primary bg-primary text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:border-primary hover:text-primary",
                  ].join(" ")}
                >
                  <span>전체 업종</span>
                  <span>{formatNumber(categoryCountBasePoints.length)}</span>
                </button>
                {categoryCounts.map((category) => {
                  const selected = activeCategory === category.value;
                  const swatch = getCategoryColor(category.value);

                  return (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => {
                        setActiveCategory(selected ? null : category.value);
                        updateActiveCompanyId(null);
                      }}
                      aria-pressed={selected}
                      className={[
                        "flex min-h-10 items-center justify-between gap-2 rounded-md border px-3 py-2 text-left text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary/20 xl:min-h-9 xl:px-2 xl:py-1.5 xl:text-xs",
                        selected
                          ? getCategoryTone(category.value)
                          : "border-slate-300 bg-white text-slate-700 hover:border-slate-400",
                      ].join(" ")}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span
                          className="size-3 shrink-0 rounded-sm"
                          style={{ backgroundColor: swatch }}
                          aria-hidden="true"
                        />
                        <span className="min-w-0 truncate">
                          {category.value}
                        </span>
                      </span>
                      <span className="shrink-0">
                        {formatNumber(category.count)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </section>
  );
}
