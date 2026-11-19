"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { GeoJSONSource, Map as MlMap } from "maplibre-gl";
import { BUSINESSES, STATIONS, TRACK } from "@/lib/data";
import { circlePolygon, KM_PER_NM, stormAt } from "@/lib/geo";
import { useApp } from "./state";
import { STATUS_STYLE, scoreColor } from "./ui";

const STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

function radiiAt(t: number) {
  // nearest best-track fix at or before t (radii are only defined at fixes)
  let fix = TRACK[0];
  for (const p of TRACK) if (p.t <= t) fix = p;
  const mean = (r: number[]) => r.reduce((a, b) => a + b, 0) / r.length;
  return { r34: mean(fix.r34Nm), r64: mean(fix.r64Nm) };
}

export function MapView() {
  const { t, exposures, bizStatus, select, selected, visibleObs } = useApp();
  const ref = useRef<HTMLDivElement>(null);
  const map = useRef<MlMap | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let disposed = false;
    (async () => {
      const maplibregl = (await import("maplibre-gl")).default;
      if (disposed || !ref.current) return;
      const m = new maplibregl.Map({
        container: ref.current,
        style: STYLE,
        bounds: [[-97.4, 26.9], [-94.5, 30.4]],
        fitBoundsOptions: { padding: 30 },
        attributionControl: { compact: true },
      });
      map.current = m;
      m.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
      m.on("error", (e) => {
        if (!m.isStyleLoaded()) console.warn("map error", e.error?.message);
      });
      const timeout = setTimeout(() => !m.isStyleLoaded() && setFailed(true), 12000);
      m.on("load", () => {
        clearTimeout(timeout);
        const empty = { type: "FeatureCollection", features: [] } as GeoJSON.FeatureCollection;
        for (const id of ["track", "track-past", "fixes", "radii", "storm", "stations", "biz"]) m.addSource(id, { type: "geojson", data: empty });
        m.addLayer({ id: "radii-fill", type: "fill", source: "radii", paint: { "fill-color": ["match", ["get", "kind"], "r64", "#ff5a64", "#f5b13d"], "fill-opacity": ["match", ["get", "kind"], "r64", 0.14, 0.06] } });
        m.addLayer({ id: "radii-line", type: "line", source: "radii", paint: { "line-color": ["match", ["get", "kind"], "r64", "#ff5a64", "#f5b13d"], "line-opacity": 0.6, "line-width": 1, "line-dasharray": [2, 2] } });
        m.addLayer({ id: "track", type: "line", source: "track", paint: { "line-color": "#8494b4", "line-width": 1.5, "line-dasharray": [1, 2], "line-opacity": 0.6 } });
        m.addLayer({ id: "track-past", type: "line", source: "track-past", paint: { "line-color": "#38d6f5", "line-width": 2.5 } });
        m.addLayer({ id: "fixes", type: "circle", source: "fixes", paint: { "circle-radius": 3, "circle-color": "#070b14", "circle-stroke-color": "#8494b4", "circle-stroke-width": 1.2 } });
        m.addLayer({ id: "fix-labels", type: "symbol", source: "fixes", layout: { "text-field": ["get", "label"], "text-size": 10, "text-offset": [0.8, 0], "text-anchor": "left", "text-font": ["Montserrat Medium"] }, paint: { "text-color": "#8494b4", "text-halo-color": "#070b14", "text-halo-width": 1 } });
        m.addLayer({ id: "stations", type: "circle", source: "stations", paint: { "circle-radius": ["interpolate", ["linear"], ["get", "kt"], 0, 5, 50, 11], "circle-color": ["case", ["get", "silent"], "#26365a", ["interpolate", ["linear"], ["get", "kt"], 0, "#1c2840", 20, "#4f8cff", 34, "#f5b13d", 45, "#ff5a64"]], "circle-opacity": 0.85, "circle-stroke-color": "#e6ecf7", "circle-stroke-width": 0.8 } });
        m.addLayer({ id: "station-labels", type: "symbol", source: "stations", layout: { "text-field": ["concat", ["get", "id"], " ", ["get", "label"]], "text-size": 10, "text-offset": [0, 1.4], "text-font": ["Montserrat Medium"], "text-allow-overlap": false }, paint: { "text-color": "#e6ecf7", "text-halo-color": "#070b14", "text-halo-width": 1.2 } });
        m.addLayer({ id: "biz-halo", type: "circle", source: "biz", filter: ["==", ["get", "selected"], true], paint: { "circle-radius": 11, "circle-color": "transparent", "circle-stroke-color": "#38d6f5", "circle-stroke-width": 2 } });
        m.addLayer({ id: "biz", type: "circle", source: "biz", paint: { "circle-radius": ["case", ["==", ["get", "status"], "covered"], 4.5, 6], "circle-color": ["get", "color"], "circle-stroke-color": ["get", "ring"], "circle-stroke-width": 1.5 } });
        m.addLayer({ id: "storm-core", type: "circle", source: "storm", paint: { "circle-radius": 9, "circle-color": "#ff5a64", "circle-stroke-color": "#fff", "circle-stroke-width": 2 } });
        m.addLayer({ id: "storm-label", type: "symbol", source: "storm", layout: { "text-field": ["get", "label"], "text-size": 11, "text-offset": [0, 1.6], "text-font": ["Montserrat SemiBold"] }, paint: { "text-color": "#ffd3d6", "text-halo-color": "#070b14", "text-halo-width": 1.5 } });

        const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 10 });
        m.on("mouseenter", "biz", (e) => {
          m.getCanvas().style.cursor = "pointer";
          const p = e.features?.[0]?.properties as Record<string, string>;
          popup.setLngLat(e.lngLat).setHTML(`<b>${p.name}</b><br/><span style="color:#8494b4">${p.industry} · ${p.town}</span><br/>Exposure <b>${p.score}</b>/100 · ${p.statusLabel}<br/><span style="color:#f5b13d;font-size:10px">SYNTHETIC BUSINESS</span>`).addTo(m);
        });
        m.on("mouseleave", "biz", () => {
          m.getCanvas().style.cursor = "";
          popup.remove();
        });
        m.on("click", "biz", (e) => select((e.features?.[0]?.properties as { id: string }).id));
        m.on("mouseenter", "stations", (e) => {
          const p = e.features?.[0]?.properties as Record<string, string>;
          popup.setLngLat(e.lngLat).setHTML(`<b>${p.id}</b> ${p.name}<br/>${p.silent === "true" ? '<span style="color:#ff5a64">No report for 90+ min</span>' : `Sustained <b>${p.kt}</b> kt${p.gust !== "null" ? ` · gust ${p.gust} kt` : ""}`}<br/><span style="color:#8494b4">${p.when}</span><br/><span style="color:#38d6f5;font-size:10px">OBSERVED · NOAA ASOS via IEM</span>`).addTo(m);
        });
        m.on("mouseleave", "stations", () => popup.remove());
        setReady(true);
      });
    })();
    return () => {
      disposed = true;
      map.current?.remove();
      map.current = null;
    };
  }, [select]);

  // Static: full track
  useEffect(() => {
    const m = map.current;
    if (!ready || !m) return;
    (m.getSource("track") as GeoJSONSource).setData({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: TRACK.map((p) => [p.lon, p.lat]) } });
    (m.getSource("fixes") as GeoJSONSource).setData({
      type: "FeatureCollection",
      features: TRACK.map((p) => ({ type: "Feature", properties: { label: `${p.time.slice(8, 10)}/${p.time.slice(11, 13)}Z ${p.maxWindKt}kt${p.landfall ? " · LANDFALL" : ""}` }, geometry: { type: "Point", coordinates: [p.lon, p.lat] } })),
    });
  }, [ready]);

  const latestByStation = useMemo(() => {
    const m = new Map<string, (typeof visibleObs)[number]>();
    for (const o of visibleObs) if (o.sustainedKt !== null) m.set(o.stationId, o);
    return m;
  }, [visibleObs]);

  // Dynamic: storm, stations, businesses
  useEffect(() => {
    const m = map.current;
    if (!ready || !m) return;
    const s = stormAt(TRACK, t);
    if (s) {
      const past = TRACK.filter((p) => p.t <= t).map((p) => [p.lon, p.lat]);
      past.push([s.lon, s.lat]);
      (m.getSource("track-past") as GeoJSONSource).setData({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: past } });
      (m.getSource("storm") as GeoJSONSource).setData({ type: "Feature", properties: { label: `BERYL ${Math.round(s.maxWindKt)} kt ${s.status}${s.isFix ? "" : " (interp.)"}` }, geometry: { type: "Point", coordinates: [s.lon, s.lat] } });
      const { r34, r64 } = radiiAt(t);
      const feats: GeoJSON.Feature[] = [];
      if (r34 > 0) feats.push({ type: "Feature", properties: { kind: "r34" }, geometry: { type: "Polygon", coordinates: [circlePolygon(s.lat, s.lon, r34 * KM_PER_NM)] } });
      if (r64 > 0) feats.push({ type: "Feature", properties: { kind: "r64" }, geometry: { type: "Polygon", coordinates: [circlePolygon(s.lat, s.lon, r64 * KM_PER_NM)] } });
      (m.getSource("radii") as GeoJSONSource).setData({ type: "FeatureCollection", features: feats });
    }
    (m.getSource("stations") as GeoJSONSource).setData({
      type: "FeatureCollection",
      features: STATIONS.filter((st) => st.id !== "6R3").map((st) => {
        const o = latestByStation.get(st.id);
        const silent = !!o && t - o.t > 90 * 60;
        return {
          type: "Feature",
          properties: { id: st.id, name: st.name, kt: o?.sustainedKt ?? 0, gust: o?.gustKt ?? null, silent, label: o ? (silent ? "silent" : `${o.sustainedKt}kt`) : "", when: o ? `${o.time.slice(11, 16)} UTC` : "no report yet" },
          geometry: { type: "Point", coordinates: [st.lon, st.lat] },
        };
      }),
    });
    (m.getSource("biz") as GeoJSONSource).setData({
      type: "FeatureCollection",
      features: BUSINESSES.map((b) => {
        const st = bizStatus(b);
        const e = exposures.get(b.id)!;
        const color = st.status === "covered" ? scoreColor(e.score) : STATUS_STYLE[st.status].dot;
        return {
          type: "Feature",
          properties: { id: b.id, name: b.name, industry: b.industry, town: b.town, score: e.score, status: st.status, statusLabel: STATUS_STYLE[st.status].label, color, ring: st.status === "paid" ? "#d1fae5" : "#070b14", selected: b.id === selected },
          geometry: { type: "Point", coordinates: [b.lon, b.lat] },
        };
      }),
    });
  }, [ready, t, exposures, bizStatus, selected, latestByStation]);

  return (
    <div className="relative h-full w-full">
      <div ref={ref} style={{ position: "absolute", inset: 0 }} />
      {!ready && !failed && <div className="absolute inset-0 grid place-items-center text-sm text-muted">Loading map…</div>}
      {failed && <div className="absolute inset-0 grid place-items-center text-sm text-red">Basemap failed to load (network). Data panels still work.</div>}
      <div className="pointer-events-none absolute left-3 bottom-3 rounded-lg border border-line bg-bg/85 px-3 py-2 text-[10px] text-muted space-y-1">
        <div className="flex items-center gap-2"><span className="h-0.5 w-5 bg-cyan" /> Best track to replay time <span className="text-dim">(NHC, hindsight)</span></div>
        <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-amber/40 border border-amber" /> 34 kt / <span className="h-2.5 w-2.5 rounded-full bg-red/40 border border-red" /> 64 kt wind radii (mean of quadrants)</div>
        <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-red border border-white" /> ASOS station, sized by observed sustained wind</div>
        <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-green" /> Paid · <span className="h-2.5 w-2.5 rounded-full bg-amber" /> Trigger met · <span className="h-2.5 w-2.5 rounded-full bg-[#4f8cff]" /> Exposure score</div>
      </div>
    </div>
  );
}
