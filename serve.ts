// Servidor de diego.lienox.com: sirve la página y atiende la agenda de citas y la medición de visitas.
import { Database } from "bun:sqlite";
import { mkdirSync, appendFileSync } from "node:fs";
import { resolve, join, normalize } from "node:path";
import { homedir } from "node:os";

const root = resolve(import.meta.dir);
const port = Number(process.env.PORT) || 10141;
const dataDir = process.env.DATA_DIR || join(homedir(), ".local/share/diego-portfolio");
mkdirSync(dataDir, { recursive: true });

const TZ = "America/Los_Angeles";
const SLOT_MIN = 30;
const FIRST_MIN = 9 * 60; // 9:00
const LAST_START_MIN = 18 * 60; // última cita 18:00–18:30
const DAYS_AHEAD = 45;
const MIN_NOTICE_MS = 2 * 60 * 60 * 1000;

const db = new Database(join(dataDir, "agenda.db"), { create: true });
db.exec(`create table if not exists bookings (
  id text primary key,
  start text not null unique,
  end text not null,
  name text not null,
  email text not null,
  note text not null default '',
  tz text not null default '',
  lang text not null default '',
  created_at text not null default (datetime('now'))
)`);

const hidden = /(^|\/)(\.|node_modules|migrations|serve\.ts|lienox-app\.json|package\.json|.*\.md$|build_cv\.py)/;
const allowedOrigins = new Set(["https://diego.lienox.com", "https://diegogaxi.github.io"]);

// Diferencia (minutos) entre la hora del Pacífico y UTC en un instante dado.
function tzOffsetMin(at: Date): number {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: TZ, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit",
    }).formatToParts(at).map((x) => [x.type, x.value]),
  );
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute);
  return Math.round((asUtc - at.getTime()) / 60000);
}

// Instante UTC de una hora local del Pacífico.
function ptToDate(y: number, m: number, d: number, minutes: number): Date {
  const guess = Date.UTC(y, m - 1, d, 0, minutes);
  const off = tzOffsetMin(new Date(guess));
  const first = guess - off * 60000;
  return new Date(guess - tzOffsetMin(new Date(first)) * 60000);
}

function ptDateParts(at: Date) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", weekday: "short" })
      .formatToParts(at).map((x) => [x.type, x.value]),
  );
  return { y: +p.year, m: +p.month, d: +p.day, weekday: p.weekday };
}

function allSlots(now = new Date()) {
  const taken = new Set((db.query("select start from bookings").all() as { start: string }[]).map((r) => r.start));
  const days: { date: string; slots: string[] }[] = [];
  for (let i = 0; i <= DAYS_AHEAD; i++) {
    const { y, m, d, weekday } = ptDateParts(new Date(now.getTime() + i * 86400000));
    if (weekday === "Sat" || weekday === "Sun") continue;
    const slots: string[] = [];
    for (let min = FIRST_MIN; min <= LAST_START_MIN; min += SLOT_MIN) {
      const start = ptToDate(y, m, d, min);
      if (start.getTime() - now.getTime() < MIN_NOTICE_MS) continue;
      const iso = start.toISOString();
      if (!taken.has(iso)) slots.push(iso);
    }
    const date = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    if (slots.length && !days.some((x) => x.date === date)) days.push({ date, slots });
  }
  return days;
}

function isValidSlot(start: string): boolean {
  return allSlots().some((d) => d.slots.includes(start));
}

// Límite simple de intentos por visitante.
const hits = new Map<string, number[]>();
function rateLimited(key: string, max = 5, windowMs = 10 * 60 * 1000): boolean {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  list.push(now);
  hits.set(key, list);
  return list.length > max;
}

function clientKey(req: Request, server: any): string {
  const addr = server.requestIP(req)?.address ?? "";
  const viaTunnel = addr === "127.0.0.1" || addr === "::1" || addr === "::ffff:127.0.0.1";
  return (viaTunnel && req.headers.get("cf-connecting-ip")) || addr || "desconocido";
}

function notifyDiego(b: { start: string; name: string; email: string; note: string; tz: string }) {
  const when = new Date(b.start).toLocaleString("es-MX", { timeZone: TZ, dateStyle: "full", timeStyle: "short" });
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const msg = `📅 <b>Nueva cita en tu portafolio</b>\n${esc(when)} (hora del Pacífico)\n<b>${esc(b.name)}</b> · ${esc(b.email)}` +
    (b.note ? `\n${esc(b.note)}` : "") + (b.tz ? `\nSu zona: ${esc(b.tz)}` : "");
  try {
    const cli = Bun.which("lienox")
      ? ["lienox"]
      : process.env.LIENOX_CLI ? [process.execPath, process.env.LIENOX_CLI] : ["lienox"];
    const proc = Bun.spawn([...cli, "telegram", msg], { stdout: "ignore", stderr: "pipe" });
    proc.exited.then(async (code) => {
      if (code !== 0) console.error("aviso de Telegram falló:", code, await new Response(proc.stderr).text());
    });
  } catch (e) {
    console.error("no se pudo avisar por Telegram", e);
  }
}

function cors(req: Request, res: Response): Response {
  const origin = req.headers.get("origin");
  if (origin && allowedOrigins.has(origin)) {
    res.headers.set("access-control-allow-origin", origin);
    res.headers.set("vary", "origin");
    res.headers.set("access-control-allow-methods", "GET, POST, OPTIONS");
    res.headers.set("access-control-allow-headers", "content-type");
  }
  return res;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

async function api(req: Request, url: URL, server: any): Promise<Response> {
  if (url.pathname === "/api/booking/slots" && req.method === "GET") {
    return json({ tz: TZ, slotMinutes: SLOT_MIN, days: allSlots() });
  }

  if (url.pathname === "/api/booking" && req.method === "POST") {
    if (rateLimited("b:" + clientKey(req, server))) return json({ error: "rate_limited" }, 429);
    let body: any;
    try { body = await req.json(); } catch { return json({ error: "invalid_json" }, 400); }
    const name = String(body?.name ?? "").trim().slice(0, 120);
    const email = String(body?.email ?? "").trim().slice(0, 200);
    const note = String(body?.note ?? "").trim().slice(0, 2000);
    const start = String(body?.start ?? "");
    const tz = String(body?.tz ?? "").slice(0, 64);
    const lang = String(body?.lang ?? "").slice(0, 5);
    const end = new Date(new Date(start).getTime() + SLOT_MIN * 60000);
    // Trampa para robots: el campo oculto «website» solo lo llenan ellos.
    if (String(body?.website ?? "").trim()) {
      return json({ id: crypto.randomUUID(), start, end: isNaN(end.getTime()) ? start : end.toISOString() }, 201);
    }
    if (name.length < 2) return json({ error: "invalid_field", field: "name" }, 400);
    if (!emailRe.test(email)) return json({ error: "invalid_field", field: "email" }, 400);
    if (isNaN(end.getTime()) || new Date(start).toISOString() !== start) return json({ error: "invalid_field", field: "start" }, 400);
    if (db.query("select 1 from bookings where start = ?").get(start)) return json({ error: "taken" }, 409);
    if (!isValidSlot(start)) return json({ error: "invalid_field", field: "start" }, 400);
    const id = crypto.randomUUID();
    try {
      db.query("insert into bookings (id, start, end, name, email, note, tz, lang) values (?, ?, ?, ?, ?, ?, ?, ?)")
        .run(id, start, end.toISOString(), name, email, note, tz, lang);
    } catch {
      return json({ error: "taken" }, 409);
    }
    notifyDiego({ start, name, email, note, tz });
    return json({ id, start, end: end.toISOString() }, 201);
  }

  if (url.pathname === "/api/t" && req.method === "POST") {
    if (rateLimited("t:" + clientKey(req, server), 120, 60000)) return new Response(null, { status: 204 });
    const text = (await req.text()).slice(0, 64000);
    try {
      JSON.parse(text);
      appendFileSync(join(dataDir, "visitas.jsonl"), JSON.stringify({ at: new Date().toISOString(), data: JSON.parse(text) }) + "\n");
    } catch { /* lote inválido: se ignora */ }
    return new Response(null, { status: 204 });
  }

  return json({ error: "not_found" }, 404);
}

Bun.serve({
  hostname: process.env.HOST || "127.0.0.1",
  port,
  async fetch(req, server) {
    const url = new URL(req.url);
    if (url.pathname === "/salud") return new Response("ok");
    if (url.pathname.startsWith("/api/")) {
      if (req.method === "OPTIONS") return cors(req, new Response(null, { status: 204 }));
      try {
        return cors(req, await api(req, url, server));
      } catch (e) {
        console.error(e);
        return cors(req, json({ error: "server_error" }, 500));
      }
    }
    let path = decodeURIComponent(url.pathname);
    if (path.endsWith("/")) path += "index.html";
    const rel = normalize(path).replace(/^\/+/, "");
    if (rel.startsWith("..") || hidden.test(rel)) return new Response("No encontrado", { status: 404 });
    const file = Bun.file(join(root, rel));
    if (await file.exists()) {
      // Archivos con huella en el nombre: caché larga. El resto, revalidar siempre (Cloudflare incluido).
      const hashed = /-[A-Za-z0-9_-]{8}\.(js|css)$/.test(rel);
      return new Response(file, { headers: { "cache-control": hashed ? "public, max-age=31536000, immutable" : "no-cache" } });
    }
    return new Response("No encontrado", { status: 404 });
  },
});
console.log(`portafolio en http://127.0.0.1:${port}`);
