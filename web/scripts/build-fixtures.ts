/**
 * Builds the deterministic replay fixtures from raw public data committed in ../data-raw:
 *  - NOAA NHC HURDAT2 best track for Beryl (AL022024)
 *  - Iowa Environmental Mesonet ASOS archive (routine + special METARs) for Texas stations
 *  - IEM station metadata
 * and generates the clearly-synthetic business portfolio.
 *
 * Run: npm run fixtures
 */
import fs from "node:fs";
import path from "node:path";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { flagNeighborOutliers, normalizeIemRow, toIcao } from "../src/lib/observations";
import { haversineKm } from "../src/lib/geo";
import { usdToUnits } from "../src/lib/config";
import type { Business, Industry, Observation, Station, TrackPoint } from "../src/lib/types";

const ROOT = path.resolve(__dirname, "..", "..");
const RAW = path.join(ROOT, "data-raw");
const OUT = path.join(ROOT, "web", "src", "data");
fs.mkdirSync(OUT, { recursive: true });

// ------------------------------------------------------------------ track
function parseLatLon(s: string): number {
  const v = parseFloat(s);
  return /[SW]$/.test(s.trim()) ? -v : v;
}
const hurdat = fs.readFileSync(path.join(RAW, "hurdat2-AL022024-beryl.txt"), "utf8").trim().split("\n").slice(1);
const track: TrackPoint[] = hurdat
  .map((line) => line.split(",").map((x) => x.trim()))
  .map((c) => {
    const iso = `${c[0].slice(0, 4)}-${c[0].slice(4, 6)}-${c[0].slice(6, 8)}T${c[1].slice(0, 2)}:${c[1].slice(2, 4)}:00Z`;
    const n = (i: number) => Number(c[i]);
    const rmw = n(20);
    return {
      time: iso,
      t: Date.parse(iso) / 1000,
      lat: parseLatLon(c[4]),
      lon: parseLatLon(c[5]),
      status: c[3],
      maxWindKt: n(6),
      minPressureMb: n(7),
      rmwNm: rmw > 0 ? rmw : null,
      landfall: c[2] === "L",
      r34Nm: [n(8), n(9), n(10), n(11)] as [number, number, number, number],
      r64Nm: [n(16), n(17), n(18), n(19)] as [number, number, number, number],
    };
  })
  // Gulf of Mexico approach through inland decay
  .filter((p) => p.t >= Date.parse("2024-07-06T00:00:00Z") / 1000 && p.t <= Date.parse("2024-07-09T12:00:00Z") / 1000);

// ------------------------------------------------------------------ stations
const stationMeta = JSON.parse(fs.readFileSync(path.join(RAW, "iem-tx-asos-stations.json"), "utf8")) as Record<
  string,
  { name: string; lat: number; lon: number; elevation: number | null }
>;
const stations: Station[] = Object.entries(stationMeta)
  .map(([sid, m]) => ({ id: toIcao(sid), sid, name: titleCase(m.name), lat: m.lat, lon: m.lon, elevationM: m.elevation }))
  .sort((a, b) => a.id.localeCompare(b.id));

function titleCase(s: string) {
  return s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\bIntl\b/i, "Intl");
}

// ------------------------------------------------------------------ observations
function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n");
  const header = lines[0].split(",");
  return lines.slice(1).map((line) => {
    // metar is the last column and contains no commas in IEM onlycomma output
    const parts = line.split(",");
    const row: Record<string, string> = {};
    header.forEach((h, i) => (row[h] = i === header.length - 1 ? parts.slice(i).join(",") : parts[i]));
    return row;
  });
}
const rows = parseCsv(fs.readFileSync(path.join(RAW, "asos-beryl-2024-07-07_08.csv"), "utf8"));
let observations: Observation[] = rows.map(normalizeIemRow).filter((o): o is Observation => o !== null);
const rejectedRows = rows.length - observations.length;

// neighbours: stations within 80 km
const neighbors: Record<string, string[]> = {};
for (const a of stations) {
  neighbors[a.id] = stations.filter((b) => b.id !== a.id && haversineKm(a.lat, a.lon, b.lat, b.lon) <= 80).map((b) => b.id);
}
observations = flagNeighborOutliers(observations, neighbors).sort((a, b) => a.t - b.t || a.stationId.localeCompare(b.stationId));

// ------------------------------------------------------------------ businesses (SYNTHETIC)
// Approximate town centres; elevation and coast distance are coarse town-level proxies, not survey data.
const TOWNS = [
  { town: "Palacios", lat: 28.708, lon: -96.217, elev: 3, coast: 1, n: 6 },
  { town: "Bay City", lat: 28.983, lon: -95.969, elev: 16, coast: 25, n: 6 },
  { town: "Matagorda", lat: 28.691, lon: -95.967, elev: 2, coast: 1, n: 3 },
  { town: "Freeport", lat: 28.954, lon: -95.36, elev: 2, coast: 3, n: 5 },
  { town: "Lake Jackson", lat: 29.034, lon: -95.434, elev: 5, coast: 12, n: 4 },
  { town: "Angleton", lat: 29.169, lon: -95.432, elev: 9, coast: 25, n: 5 },
  { town: "Galveston", lat: 29.301, lon: -94.797, elev: 2, coast: 1, n: 7 },
  { town: "Texas City", lat: 29.383, lon: -94.903, elev: 4, coast: 3, n: 4 },
  { town: "League City", lat: 29.507, lon: -95.095, elev: 6, coast: 12, n: 4 },
  { town: "Pasadena", lat: 29.691, lon: -95.209, elev: 9, coast: 20, n: 5 },
  { town: "Houston (Hobby)", lat: 29.66, lon: -95.28, elev: 13, coast: 35, n: 5 },
  { town: "Houston (Downtown)", lat: 29.76, lon: -95.369, elev: 15, coast: 50, n: 6 },
  { town: "Sugar Land", lat: 29.62, lon: -95.635, elev: 25, coast: 60, n: 4 },
  { town: "Humble", lat: 29.999, lon: -95.262, elev: 30, coast: 75, n: 4 },
  { town: "Pearland", lat: 29.564, lon: -95.286, elev: 15, coast: 30, n: 4 },
  { town: "El Campo", lat: 29.197, lon: -96.27, elev: 34, coast: 55, n: 3 },
  { town: "Port Lavaca", lat: 28.615, lon: -96.626, elev: 6, coast: 1, n: 3 },
  { town: "Conroe", lat: 30.312, lon: -95.456, elev: 65, coast: 120, n: 2 },
];

const INDUSTRIES: Industry[] = [
  "Hardware & Supply", "Restaurant", "Grocery", "Marine Services", "Auto Repair", "Medical Clinic",
  "Retail", "Hospitality", "Construction", "Logistics", "Pharmacy", "Childcare",
];
const PREFIX = [
  "Gulf Coast", "Bayou", "Brazos", "Coastal", "Lone Star", "Harbor", "Tidewater", "Seawall", "Pelican",
  "Magnolia", "Prairie", "Live Oak", "Saltgrass", "Driftwood", "Bluewater", "Sandbar", "Cypress", "Redfish",
  "Laguna", "Sea Breeze", "Anchor", "Heron", "Starboard", "Shoreline",
];
const NOUN: Record<Industry, string[]> = {
  "Hardware & Supply": ["Hardware", "Supply Co.", "Building Supply"],
  Restaurant: ["Kitchen", "Seafood House", "Taqueria", "Grill"],
  Grocery: ["Market", "Grocery", "Foods"],
  "Marine Services": ["Marine", "Boat Works", "Bait & Tackle"],
  "Auto Repair": ["Auto Care", "Garage", "Tire & Lube"],
  "Medical Clinic": ["Family Clinic", "Urgent Care", "Dental"],
  Retail: ["Outfitters", "Boutique", "Goods"],
  Hospitality: ["Inn", "Motel", "Suites"],
  Construction: ["Builders", "Roofing", "Contracting"],
  Logistics: ["Freight", "Couriers", "Haulers"],
  Pharmacy: ["Pharmacy", "Drug Store"],
  Childcare: ["Learning Center", "Kids Academy"],
};

// Deterministic PRNG (mulberry32)
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = rng(20240708);
const pick = <T,>(xs: T[]) => xs[Math.floor(rand() * xs.length)];

// Stations considered for policies: those that actually reported during the event window.
const reporting = new Set(observations.filter((o) => o.verifiable).map((o) => o.stationId));
const policyStations = stations.filter((s) => reporting.has(s.id) && s.id !== "6R3");

// Wallets: generated once, keys kept in the gitignored wallets.json at the repo root.
const walletFile = path.join(ROOT, "wallets.json");
const wallets: Record<string, string> = fs.existsSync(walletFile) ? JSON.parse(fs.readFileSync(walletFile, "utf8")) : {};

const usedNames = new Set<string>();
const businesses: Business[] = [];
let idx = 0;
for (const town of TOWNS) {
  for (let k = 0; k < town.n; k++) {
    idx++;
    const id = `RSL-${String(idx).padStart(4, "0")}`;
    let industry = pick(INDUSTRIES);
    let name = "";
    if (idx === 1) {
      industry = "Hardware & Supply";
      name = "Gulf Coast Hardware";
    } else {
      do name = `${pick(PREFIX)} ${pick(NOUN[industry])}`; while (usedNames.has(name));
    }
    usedNames.add(name);
    const jitterKm = 0.5 + rand() * 4.5;
    const brg = rand() * 2 * Math.PI;
    const lat = idx === 1 ? 28.7089 : town.lat + (jitterKm / 111) * Math.cos(brg);
    const lon = idx === 1 ? -96.2189 : town.lon + (jitterKm / (111 * Math.cos((town.lat * Math.PI) / 180))) * Math.sin(brg);
    const employees = idx === 1 ? 14 : 3 + Math.floor(rand() * 38);
    const monthlyRevenueUsd = Math.round((employees * (4000 + rand() * 4000)) / 100) * 100;
    const coverageUsd = idx === 1 ? 5000 : Math.min(25000, Math.max(2500, Math.round((monthlyRevenueUsd * 0.1) / 500) * 500));
    const thresholdKt = idx === 1 ? 45 : pick([40, 45, 45, 50, 55]);
    const near = policyStations
      .map((s) => ({ s, d: haversineKm(lat, lon, s.lat, s.lon) }))
      .sort((a, b) => a.d - b.d);
    const approved = near.filter((x) => x.d <= 35).slice(0, 2).map((x) => x.s.id);
    if (approved.length === 0) approved.push(near[0].s.id);
    if (!wallets[id]) wallets[id] = generatePrivateKey();
    businesses.push({
      id,
      name,
      industry,
      town: town.town,
      lat: +lat.toFixed(5),
      lon: +lon.toFixed(5),
      employees,
      monthlyRevenueUsd,
      elevationM: Math.max(1, Math.round(town.elev + (rand() - 0.5) * 4)),
      coastDistanceKm: Math.max(0.5, +(town.coast + (rand() - 0.5) * 4).toFixed(1)),
      wallet: privateKeyToAccount(wallets[id] as `0x${string}`).address,
      policy: {
        policyNumber: `RSL-P-${String(idx).padStart(4, "0")}`,
        coverageUsd,
        payoutUnits: usdToUnits(coverageUsd).toString(),
        thresholdKt,
        stations: approved,
        coverageStart: "2024-06-01T00:00:00Z",
        coverageEnd: "2024-11-30T23:59:59Z",
      },
    });
  }
}
fs.writeFileSync(walletFile, JSON.stringify(wallets, null, 1), { mode: 0o600 });

// ------------------------------------------------------------------ write
const meta = {
  generatedAt: new Date().toISOString(),
  sources: {
    track: "NOAA NHC HURDAT2 (hurdat2-1851-2025-092326.txt), storm AL022024 — https://www.nhc.noaa.gov/data/hurdat/",
    observations:
      "Iowa Environmental Mesonet ASOS archive, routine + special METAR, 2024-07-07 12Z – 2024-07-09 00Z — https://mesonet.agron.iastate.edu/request/download.phtml",
    stations: "Iowa Environmental Mesonet TX_ASOS network metadata",
    businesses: "SYNTHETIC — fictional businesses generated deterministically (seed 20240708). Not real customers.",
  },
  counts: {
    trackPoints: track.length,
    stations: stations.length,
    observations: observations.length,
    verifiable: observations.filter((o) => o.verifiable).length,
    rowsRejectedBySchema: rejectedRows,
    businesses: businesses.length,
  },
};
fs.writeFileSync(path.join(OUT, "track.json"), JSON.stringify(track));
fs.writeFileSync(path.join(OUT, "stations.json"), JSON.stringify(stations));
fs.writeFileSync(path.join(OUT, "observations.json"), JSON.stringify(observations));
fs.writeFileSync(path.join(OUT, "businesses.json"), JSON.stringify(businesses, null, 1));
fs.writeFileSync(path.join(OUT, "meta.json"), JSON.stringify(meta, null, 2));
console.log(JSON.stringify(meta.counts));
const issues = observations.filter((o) => !o.verifiable);
console.log("unverifiable:", issues.length, [...new Set(issues.flatMap((o) => o.issues))]);
