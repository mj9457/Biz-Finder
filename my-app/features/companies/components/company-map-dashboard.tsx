"use client";

import Link from "next/link";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  List,
  LocateFixed,
  Menu,
  MapPin,
  RefreshCw,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  LayerGroup,
  Map as LeafletMap,
  MarkerClusterGroup,
} from "leaflet";
import type { GeoJsonObject } from "geojson";

import { formatNumber } from "@/lib/format";
import { REGION_BOUNDARIES } from "../data/map-region-boundaries";
import type { CompanyMapPoint, CompanyMapStats } from "../types";

type CompanyMapDashboardProps = {
  points: CompanyMapPoint[];
  stats: CompanyMapStats;
};

type LeafletNamespace = typeof import("leaflet");

const MAP_CENTER: [number, number] = [37.6906, 127.2817];
const DEFAULT_ZOOM = 10;

const REGION_OUTLINE_COLORS: Record<string, string> = {
  남양주: "#0ea5e9",
  구리: "#22c55e",
  가평: "#f59e0b",
};

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

function buildMarkerHtml(point: CompanyMapPoint, isSelected = false) {
  const color = isSelected
    ? "#ef4444"
    : getCategoryColor(point.primaryCategory);
  const ringColor = isSelected
    ? "#f59e0b"
    : point.isIndustrialArea
      ? "#0f172a"
      : color;
  const classes = [
    "bf-map-marker",
    point.isManufacturing ? "bf-map-marker--manufacturing" : "",
    point.isIndustrialArea ? "bf-map-marker--industrial" : "",
    isSelected ? "bf-map-marker--active" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return `<span class="${classes}" style="--bf-marker:${color};--bf-marker-ring:${ringColor};"><span class="bf-map-marker__core"></span></span>`;
}

function buildTooltipHtml(point: CompanyMapPoint) {
  const industry =
    point.industryChamber ||
    point.industry ||
    point.categories.join(", ") ||
    point.primaryCategory ||
    "업종 미등록";

  return [
    '<div class="bf-map-tooltip">',
    `<strong>${escapeHtml(point.name || "기업명 미등록")}</strong>`,
    `<span>${escapeHtml(industry)}</span>`,
    "</div>",
  ].join("");
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

function buildPopupHtml(point: CompanyMapPoint) {
  const category = point.primaryCategory || "기타";
  const address = point.address || "주소 미등록";
  const product = point.mainProduct || point.industry || "주요 품목 미등록";

  return [
    '<article class="bf-map-popup">',
    `<strong>${escapeHtml(point.name || "기업명 미등록")}</strong>`,
    `<span>${escapeHtml(category)}</span>`,
    `<p>${escapeHtml(product)}</p>`,
    `<small>${escapeHtml(address)}</small>`,
    `<a href="/companies/${encodeURIComponent(point.id)}">상세 보기</a>`,
    "</article>",
  ].join("");
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

function fitMapToPoints(
  L: LeafletNamespace,
  map: LeafletMap,
  points: CompanyMapPoint[],
) {
  if (points.length === 0) {
    map.setView(MAP_CENTER, DEFAULT_ZOOM, { animate: false });
    return;
  }

  const bounds = L.latLngBounds(
    points.map((point) => [point.lat, point.lng] as [number, number]),
  );

  if (bounds.isValid()) {
    map.fitBounds(bounds.pad(0.16), {
      animate: false,
      maxZoom: 13,
    });
  }
}

export function CompanyMapDashboard({
  points,
  stats,
}: CompanyMapDashboardProps) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const clusterLayerRef = useRef<MarkerClusterGroup | null>(null);
  const regionOutlineLayerRef = useRef<LayerGroup | null>(null);
  const leafletRef = useRef<LeafletNamespace | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [activeRegion, setActiveRegion] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mapRenderNonce, setMapRenderNonce] = useState(0);
  const [isCompanyListOpen, setIsCompanyListOpen] = useState(false);

  const normalizedQuery = normalizeSearchText(query);
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
  const mapPoints = useMemo(() => {
    if (!activeCompanyId) {
      return filteredPoints;
    }

    const selected = filteredPoints.find(
      (point) => point.id === activeCompanyId,
    );
    return selected ? [selected] : filteredPoints;
  }, [activeCompanyId, filteredPoints]);
  const activeCompany = useMemo(
    () =>
      activeCompanyId
        ? (filteredPoints.find((point) => point.id === activeCompanyId) ?? null)
        : null,
    [activeCompanyId, filteredPoints],
  );
  const visibleCompanyList = useMemo(
    () =>
      filteredPoints.toSorted(
        (a, b) =>
          Number(b.isManufacturing) - Number(a.isManufacturing) ||
          a.name.localeCompare(b.name, "ko-KR"),
      ),
    [filteredPoints],
  );
  const hasActiveFilters = Boolean(activeRegion || activeCategory || query);

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
    let isCancelled = false;

    async function initializeMap() {
      const leafletModule = (await import("leaflet")) as LeafletNamespace & {
        default?: LeafletNamespace;
      };
      const L = leafletModule.default ?? leafletModule;

      (window as Window & { L?: LeafletNamespace }).L = L;
      await import("leaflet.markercluster");

      if (isCancelled || !mapElementRef.current || mapRef.current) {
        return;
      }

      leafletRef.current = L;
      const map = L.map(mapElementRef.current, {
        center: MAP_CENTER,
        zoom: DEFAULT_ZOOM,
        minZoom: 8,
        maxZoom: 18,
        preferCanvas: true,
        zoomControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
      setIsMapReady(true);
    }

    void initializeMap();

    return () => {
      isCancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      leafletRef.current = null;
      clusterLayerRef.current = null;
      regionOutlineLayerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;

    if (!isMapReady || !L || !map) {
      return;
    }

    if (clusterLayerRef.current) {
      map.removeLayer(clusterLayerRef.current);
      clusterLayerRef.current = null;
    }

    if (regionOutlineLayerRef.current) {
      map.removeLayer(regionOutlineLayerRef.current);
      regionOutlineLayerRef.current = null;
    }

    const regionOutlineLayer = L.layerGroup();

    for (const region of REGION_BOUNDARIES) {
      const isActiveRegion = activeRegion === region.region;
      const color = REGION_OUTLINE_COLORS[region.region] ?? "#0f766e";
      const geoJsonLayer = L.geoJSON(region.geometry as GeoJsonObject, {
        style: {
          color,
          weight: isActiveRegion ? 4 : 3,
          opacity: isActiveRegion ? 0.95 : 0.75,
          fillColor: color,
          fillOpacity: isActiveRegion ? 0.08 : 0.03,
          dashArray: isActiveRegion ? undefined : "10 8",
          className: "bf-region-outline",
        },
        interactive: false,
        bubblingMouseEvents: false,
      });

      geoJsonLayer.addTo(regionOutlineLayer);
    }

    map.addLayer(regionOutlineLayer);
    regionOutlineLayerRef.current = regionOutlineLayer;

    if (mapPoints.length === 0) {
      return;
    }

    const clusterLayer = L.markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      maxClusterRadius: 52,
      iconCreateFunction(cluster) {
        const count = cluster.getChildCount();
        const sizeClass =
          count >= 100 ? "large" : count >= 30 ? "medium" : "small";

        return L.divIcon({
          html: `<span>${formatNumber(count)}</span>`,
          className: `bf-map-cluster bf-map-cluster--${sizeClass}`,
          iconSize: L.point(46, 46, true),
        });
      },
    });

    for (const point of mapPoints) {
      const selected = activeCompanyId === point.id;
      const iconSize = selected
        ? point.isManufacturing
          ? 42
          : 38
        : point.isManufacturing
          ? 34
          : 28;
      const marker = L.marker([point.lat, point.lng], {
        title: point.name,
        icon: L.divIcon({
          html: buildMarkerHtml(point, selected),
          className: "bf-map-marker-icon",
          iconSize: L.point(iconSize, iconSize, true),
          iconAnchor: L.point(iconSize / 2, iconSize, true),
        }),
        keyboard: true,
        zIndexOffset: selected ? 1000 : 0,
      });

      marker.bindTooltip(buildTooltipHtml(point), {
        direction: "top",
        offset: L.point(0, -14),
        opacity: 1,
        sticky: true,
      });
      marker.bindPopup(buildPopupHtml(point), {
        closeButton: true,
        minWidth: 220,
      });
      marker.on("focus click popupopen", () => setActiveCompanyId(point.id));
      clusterLayer.addLayer(marker);
    }

    map.addLayer(clusterLayer);
    clusterLayerRef.current = clusterLayer;

    fitMapToPoints(L, map, mapPoints);
  }, [activeCompanyId, activeRegion, isMapReady, mapPoints, mapRenderNonce]);

  function resetFilters() {
    setActiveRegion(null);
    setActiveCategory(null);
    setQuery("");
    setActiveCompanyId(null);
  }

  function resetMapRender() {
    const L = leafletRef.current;
    const map = mapRef.current;

    setMapRenderNonce((current) => current + 1);

    if (!L || !map) {
      return;
    }

    map.invalidateSize({ animate: false });
    fitMapToPoints(L, map, mapPoints);

    window.setTimeout(() => {
      map.invalidateSize({ animate: false });
      fitMapToPoints(L, map, mapPoints);
    }, 120);
  }

  function focusCompanyOnMap(company: CompanyMapPoint) {
    const map = mapRef.current;

    setActiveCompanyId(company.id);

    if (!map) {
      return;
    }

    map.setView([company.lat, company.lng], Math.max(map.getZoom(), 14), {
      animate: true,
    });
  }

  return (
    <section className="grid min-h-[calc(100vh-150px)] gap-4 xl:grid-cols-[380px_minmax(0,1fr)]">
      <div className="min-w-0 overflow-hidden bg-white shadow-sm md:rounded-lg md:border md:border-slate-200 xl:order-2">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 xl:hidden">
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold text-slate-950">
              회원사 지도
            </h1>
            <p className="text-xs text-slate-500">필터 메뉴로 빠르게 검색</p>
          </div>
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <Menu className="size-4" aria-hidden="true" />
            메뉴
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
        <div className="relative h-[62vh] min-h-[380px] sm:h-[68vh] xl:h-[calc(100vh-230px)]">
          <div ref={mapElementRef} className="h-full w-full" />
          {!isMapReady ? (
            <div className="absolute inset-0 z-[500] grid place-items-center bg-white/80 text-sm font-semibold text-slate-700">
              지도 불러오는 중
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
                현재 우리 지역 회원사
              </p>
              <strong className="mt-1 block text-2xl font-semibold text-slate-950 sm:text-3xl">
                {createStatLabel(filteredPoints.length)}
              </strong>
              <span className="mt-1 block text-sm text-slate-600">
                필터 적용 결과
              </span>
            </div>
          </div>
          <div
            className={[
              "pointer-events-none absolute bottom-4 left-4 z-[500] max-w-sm rounded-md border border-slate-200 bg-white/95 px-3 py-2 text-xs text-slate-600 shadow-lg backdrop-blur",
              activeCompany ? "hidden" : "hidden md:block",
            ].join(" ")}
          >
            DB 좌표 {createStatLabel(stats.exactCoordinateCompanies)} · 주소
            기반 보정 {createStatLabel(stats.estimatedCoordinateCompanies)}
          </div>
          {activeCompany ? (
            <div className="absolute bottom-4 left-4 z-[600] hidden max-h-[min(62vh,430px)] w-[380px] overflow-y-auto overscroll-contain rounded-lg border border-slate-200 bg-white/95 p-4 shadow-2xl backdrop-blur md:block">
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
                  onClick={() => setActiveCompanyId(null)}
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
                      {[activeCompany.region, activeCompany.address]
                        .filter(Boolean)
                        .join(" · ") || "-"}
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
          <div className="absolute inset-x-0 bottom-0 z-[650] px-3 pb-3 md:hidden">
            <div
              className={[
                "overflow-hidden rounded-t-2xl rounded-b-xl border border-slate-200 bg-white/95 shadow-2xl backdrop-blur transition-[height] duration-200",
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
                  aria-label={isCompanyListOpen ? "기업 목록 접기" : "기업 목록 펼치기"}
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
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setActiveCompanyId(null);
                  }}
                  placeholder="기업명, 주소, 주요품목"
                  className="h-11 min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
                {query ? (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="검색어 지우기"
                    className="inline-flex size-7 items-center justify-center rounded text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                ) : null}
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
                    setActiveCompanyId(null);
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
                        setActiveCompanyId(null);
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
                    setActiveCompanyId(null);
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
                        setActiveCompanyId(null);
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
