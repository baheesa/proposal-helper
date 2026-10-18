// On-device audit. CapacitorHttp makes requests native, so any site can be read
// without CORS limits and without a server.

const CAPX = window.Capacitor;
const NativeHttp = CAPX && CAPX.Plugins && CAPX.Plugins.CapacitorHttp;
const UA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36";
const STOP = new Set("a about above after again all am an and any are as at be because been before being below between both but by can did do does doing down during each few for from further had has have having he her here hers him his how i if in into is it its just me more most my no nor not now of off on once only or other our out over own same she should so some such than that the their them then there these they this those through to too under until up us very was we were what when where which while who why will with you your".split(" "));

async function http(url, ms = 15000) {
  const start = Date.now();
  try {
    if (NativeHttp) {
      const r = await NativeHttp.get({
        url, responseType: "text", connectTimeout: ms, readTimeout: ms,
        headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml,application/xml,text/plain;q=0.9,*/*;q=0.8", "Accept-Language": "en-US,en;q=0.9" },
      });
      const text = typeof r.data === "string" ? r.data : r.data == null ? "" : JSON.stringify(r.data);
      const headers = {};
      Object.entries(r.headers || {}).forEach(([k, v]) => (headers[k.toLowerCase()] = v));
      return { ok: r.status >= 200 && r.status < 300, status: r.status, url: r.url || url, ms: Date.now() - start, text, headers };
    }
    // Browser fallback: route through local dev proxy to avoid CORS
    const proxyUrl = "/proxy?url=" + encodeURIComponent(url);
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), ms);
    try {
      const res = await fetch(proxyUrl, { signal: ctrl.signal });
      const text = await res.text();
      const finalUrl = res.headers.get("x-final-url") || url;
      const headers = {}; res.headers.forEach((v, k) => (headers[k.toLowerCase()] = v));
      return { ok: res.ok, status: res.status, url: finalUrl, ms: Date.now() - start, text, headers };
    } finally { clearTimeout(t); }
  } catch (e) {
    return { ok: false, status: 0, url, ms: Date.now() - start, text: "", headers: {}, error: String(e && e.message || e) };
  }
}

const clean = (s) => (s || "").replace(/\s+/g, " ").trim();

function keywordsFrom(text, boost) {
  const words = (text.toLowerCase().match(/[a-zÀ-ɏ]{3,}/g) || []).filter((w) => !STOP.has(w));
  const one = {}, two = {};
  words.forEach((w, i) => {
    one[w] = (one[w] || 0) + 1;
    if (words[i + 1]) { const p = w + " " + words[i + 1]; two[p] = (two[p] || 0) + 1; }
  });
  const bw = new Set((boost.toLowerCase().match(/[a-zÀ-ɏ]{3,}/g) || []).filter((w) => !STOP.has(w)));
  const rank = (map) => Object.entries(map)
    .map(([k, n]) => [k, n, n + (k.split(" ").some((w) => bw.has(w)) ? 3 : 0)])
    .sort((a, b) => b[2] - a[2]).slice(0, 8).map(([term, count]) => ({ term, count }));
  return { total: words.length, single: rank(one), phrases: rank(Object.fromEntries(Object.entries(two).filter(([, n]) => n > 1))) };
}

const SOCIAL = [
  ["Facebook", /facebook\.com|fb\.com/i], ["Instagram", /instagram\.com/i], ["LinkedIn", /linkedin\.com/i],
  ["YouTube", /youtube\.com|youtu\.be/i], ["X / Twitter", /(^|\.)x\.com|twitter\.com/i], ["TikTok", /tiktok\.com/i],
  ["Pinterest", /pinterest\./i], ["Yelp", /yelp\./i], ["TripAdvisor", /tripadvisor\./i],
];

function analyze(html, finalUrl) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const meta = (attr, val) => { const m = doc.querySelector(`meta[${attr}="${val}" i]`); return m ? clean(m.getAttribute("content")) : null; };
  const title = clean(doc.querySelector("title") && doc.querySelector("title").textContent);
  const description = meta("name", "description");
  const canEl = doc.querySelector('link[rel="canonical" i]');
  const canonical = (canEl && canEl.getAttribute("href")) || "";
  const og = {}; ["og:title", "og:description", "og:image", "og:type"].forEach((k) => (og[k] = meta("property", k)));

  const headings = {}, list = [];
  [1, 2, 3, 4].forEach((l) => {
    const els = [...doc.querySelectorAll("h" + l)].map((h) => clean(h.textContent)).filter(Boolean);
    headings["h" + l] = els.length;
    if (l <= 3) els.slice(0, l === 3 ? 6 : 10).forEach((t) => list.push({ level: l, text: t.slice(0, 90) }));
  });
  const h1s = [...doc.querySelectorAll("h1")].map((h) => clean(h.textContent)).filter(Boolean);

  const imgs = [...doc.querySelectorAll("img")];
  let host = ""; try { host = new URL(finalUrl).hostname.replace(/^www\./, ""); } catch {}
  const links = { internal: 0, external: 0, tel: 0, mail: 0 };
  const socialMap = new Map(); // name -> first url found
  doc.querySelectorAll("a[href]").forEach((a) => {
    const h = a.getAttribute("href") || "";
    if (!h || h.startsWith("#") || /^(javascript:|sms:)/i.test(h)) return;
    if (h.startsWith("tel:")) links.tel++;
    else if (h.startsWith("mailto:")) links.mail++;
    else if (/^https?:\/\//i.test(h)) {
      let hn = ""; try { hn = new URL(h).hostname.replace(/^www\./, ""); } catch {}
      if (hn === host) links.internal++; else {
        links.external++;
        SOCIAL.forEach(([n, re]) => { if (re.test(hn) && !socialMap.has(n)) socialMap.set(n, h); });
      }
    } else links.internal++;
  });

  // Schema (read from raw html, scripts are removed from the DOM below)
  const nodes = [], sameAs = [];
  let blocks = 0, invalid = 0;
  for (const m of html.matchAll(/<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    blocks++;
    try {
      const j = JSON.parse(m[1].trim());
      [].concat(j).forEach((root) => { if (root && root["@graph"]) [].concat(root["@graph"]).forEach((n) => nodes.push(n)); else nodes.push(root); });
    } catch { invalid++; }
  }
  const items = [];
  nodes.forEach((n) => {
    if (!n || typeof n !== "object" || !n["@type"]) return;
    [].concat(n.sameAs || []).forEach((s) => typeof s === "string" && sameAs.push(s));
    if (items.length < 6) items.push({
      type: [].concat(n["@type"]).join(", "),
      fields: { name: !!n.name, url: !!n.url, phone: !!n.telephone, address: !!n.address, hours: !!(n.openingHours || n.openingHoursSpecification), geo: !!n.geo, sameAs: !!n.sameAs, rating: !!n.aggregateRating, image: !!(n.image || n.logo), price: !!n.priceRange },
    });
  });
  const types = [...new Set(items.flatMap((i) => i.type.split(", ")))];
  sameAs.forEach((s) => { try { const hn = new URL(s).hostname; SOCIAL.forEach(([n, re]) => { if (re.test(hn) && !socialMap.has(n)) socialMap.set(n, s); }); } catch {} });

  const mapsLink = /(https?:)?\/\/(www\.)?(google\.[a-z.]+\/maps|maps\.google\.[a-z.]+|maps\.app\.goo\.gl|g\.page|goo\.gl\/maps)/i.test(html);
  const mapsEmbed = /<iframe[^>]+(google\.[a-z.]+\/maps|maps\.google)/i.test(html);

  doc.querySelectorAll("script,style,noscript").forEach((n) => n.remove());
  const text = clean(doc.body && doc.body.textContent);
  const kw = keywordsFrom(text, title + " " + h1s.join(" "));

  return {
    title, titleLen: title.length, description, descriptionLen: (description || "").length,
    keywordsMeta: meta("name", "keywords"), robotsMeta: meta("name", "robots"), viewport: meta("name", "viewport"),
    canonical, lang: doc.documentElement.getAttribute("lang") || "", og, twitterCard: meta("name", "twitter:card"),
    favicon: !!doc.querySelector('link[rel*="icon" i]'),
    headings, h1s, headingList: list,
    images: { total: imgs.length, missingAlt: imgs.filter((i) => !clean(i.getAttribute("alt"))).length, lazy: imgs.filter((i) => i.getAttribute("loading") === "lazy").length },
    links, words: text.split(/\s+/).filter(Boolean).length, keywords: kw,
    schema: { blocks, invalid, types, items, microdata: /itemtype\s*=\s*["']https?:\/\/schema\.org\//i.test(html) },
    social: [...socialMap.entries()].map(([name, url]) => ({ name, url })), sameAsCount: sameAs.length, mapsLink, mapsEmbed,
    nap: { phone: /(\+?\d[\d\s().-]{8,}\d)/.test(text) || links.tel > 0, address: /\b(street|st\.|road|rd\.|avenue|ave\.|lane|suite|floor|block|sector|plaza)\b/i.test(text) },
  };
}

function robotsInfo(txt) {
  const lines = txt.split(/\r?\n/).map((l) => l.trim());
  let agent = "", disallowAll = false, disallows = 0;
  const sitemaps = [];
  for (const l of lines) {
    if (/^user-agent:/i.test(l)) agent = l.split(":")[1].trim();
    else if (/^disallow:\s*\S+/i.test(l)) { disallows++; if (/^disallow:\s*\/\s*$/i.test(l) && agent === "*") disallowAll = true; }
    else if (/^sitemap:/i.test(l)) sitemaps.push(l.replace(/^sitemap:\s*/i, "").trim());
  }
  return { sitemaps, disallowAll, disallows, preview: lines.filter(Boolean).slice(0, 16) };
}

async function findSitemap(origin, fromRobots) {
  const cands = [...fromRobots, origin + "/sitemap.xml", origin + "/sitemap_index.xml", origin + "/wp-sitemap.xml"];
  const seen = new Set(); let lastStatus = 0;
  for (const c of cands) {
    if (seen.has(c) || seen.size >= 4) continue;
    seen.add(c);
    const r = await http(c, 12000);
    lastStatus = r.status;
    if (r.ok && /<(urlset|sitemapindex)|<loc>/i.test(r.text)) {
      return { found: true, url: c, urls: (r.text.match(/<loc>/gi) || []).length, index: /<sitemapindex/i.test(r.text), status: r.status };
    }
  }
  return { found: false, url: origin + "/sitemap.xml", urls: 0, status: lastStatus };
}

async function auditSite(input) {
  let s = String(input || "").trim();
  if (!s) throw new Error("Enter a website address.");
  if (!/^https?:\/\//i.test(s)) s = "https://" + s;
  let u; try { u = new URL(s); } catch { throw new Error("That address is not valid."); }
  const page = await http(u.href, 20000);
  if (!page.text) throw new Error(page.error ? "Could not load the site: " + page.error : "Site answered with status " + page.status + ".");
  let final; try { final = new URL(page.url); } catch { final = u; }
  const origin = final.origin;
  const [robots, httpTry] = await Promise.all([
    http(origin + "/robots.txt", 12000),
    final.protocol === "https:" ? http("http://" + final.host + "/", 10000) : Promise.resolve(null),
  ]);
  const robotsOk = robots.ok && /user-agent|disallow|allow:|sitemap:/i.test(robots.text) && !/<html/i.test(robots.text.slice(0, 300));
  const rob = robotsOk ? robotsInfo(robots.text) : { sitemaps: [] };
  const sitemap = await findSitemap(origin, rob.sitemaps || []);
  return {
    finalUrl: page.url, status: page.status, https: final.protocol === "https:",
    httpRedirectsToHttps: httpTry && httpTry.status ? /^https:/i.test(httpTry.url) : null,
    server: { responseMs: page.ms, htmlKb: Math.round(new Blob([page.text]).size / 1024), compressed: !!page.headers["content-encoding"], lastModified: page.headers["last-modified"] || null },
    page: analyze(page.text, page.url),
    robots: { found: robotsOk, status: robots.status, ...rob },
    sitemap,
  };
}

function nameFromUrl(u) {
  let d = u; try { d = decodeURIComponent(u); } catch {}
  const maps = d.match(/\/maps\/place\/([^/@?]+)/);
  if (maps) return maps[1].replace(/\+/g, " ").trim();
  // share.google redirects to a Google Search URL with q=Business Name&kgmid=...
  try {
    const pu = new URL(u);
    const q = pu.searchParams.get("q");
    if (q && (pu.searchParams.has("kgmid") || pu.searchParams.has("kgs"))) return q.trim();
  } catch {}
  return "";
}

async function auditGbp(input) {
  let raw = String(input || "").trim();
  if (!/^https?:\/\//i.test(raw)) raw = "https://" + raw;
  let u; try { u = new URL(raw); } catch { throw new Error("That link is not valid."); }
  if (!/(^|\.)(google\.[a-z.]+|goo\.gl|g\.page|g\.co)$/i.test(u.hostname) && u.hostname !== "share.google") throw new Error("That does not look like a Google Maps or Business Profile link.");
  const r = await http(raw, 15000);
  let finalUrl = r.url || raw;
  let name = nameFromUrl(finalUrl);
  if (!name) { const c = new URL(finalUrl).searchParams.get("continue"); if (c) { finalUrl = c; name = nameFromUrl(c); } }
  if (!name) name = nameFromUrl(raw);
  const ogT = (r.text.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)/i) || [])[1] || "";
  const pageT = clean((r.text.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "");
  if (!name) name = clean(ogT || pageT).replace(/\s*[-–·]\s*Google Maps.*$/i, "").replace(/^Google Maps$/i, "");
  if (/^(before you continue|google)/i.test(name)) name = "";
  const co = (finalUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) || []).slice(1, 3);
  return { name, finalUrl, raw, coords: co, cid: (finalUrl.match(/[?&]cid=(\d+)/) || [])[1] || "" };
}
