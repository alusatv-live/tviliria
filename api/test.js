
export const runtime = "nodejs";

const ALLOWED_HOSTS = [
"lbgo.bozztv.com",
"bozztv.com",
"www.bozztv.com",
"160bozztv.com",
];

const DEFAULT_STREAM =
"https://lbgo.bozztv.com/ssh101/ssh101/albanianusa/chunks.m3u8?lb_backend_hint=7";

export default async function handler(req, res) {
try {
if (req.method === "OPTIONS") {
res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
res.setHeader("Access-Control-Allow-Headers", "*");
return res.status(204).end();
}

const requestedUrl = req.query.url
? decodeURIComponent(req.query.url)
: DEFAULT_STREAM;

const target = new URL(requestedUrl);

if (!ALLOWED_HOSTS.includes(target.hostname)) {
return res.status(403).send("Forbidden");
}

const response = await fetch(target.toString(), {
headers: {
"User-Agent":
"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/141 Safari/537.36",
"Referer": "https://ssh101.com/",
},
redirect: "follow",
});

if (!response.ok) {
return res
.status(response.status)
.send("Stream error: " + response.status);
}

const contentType =
response.headers.get("content-type") || "";

const buffer = Buffer.from(await response.arrayBuffer());

const preview = buffer
.subarray(0, 1000)
.toString("utf8")
.trim();

const isPlaylist =
contentType.includes("mpegurl") ||
contentType.includes("m3u8") ||
preview.startsWith("#EXTM3U");

res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
res.setHeader("Access-Control-Allow-Headers", "*");
res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
res.setHeader("Access-Control-Expose-Headers", "*");

if (isPlaylist) {
let playlist = buffer.toString("utf8");

playlist = playlist
.split(/\r?\n/)
.map((line) => {
const trimmed = line.trim();

if (!trimmed) return line;

// Keep HLS comments/tags unchanged
if (trimmed.startsWith("#")) {
return line.replace(
/URI="([^"]+)"/g,
(match, uri) => {
try {
const absoluteUrl = new URL(
uri,
target.toString()
).toString();

return (
'URI="/api/test?url=' +
encodeURIComponent(absoluteUrl) +
'"'
);
} catch {
return match;
}
}
);
}

// Rewrite segment or child-playlist URL
try {
const absoluteUrl = new URL(
trimmed,
target.toString()
).toString();

return (
"/api/test?url=" +
encodeURIComponent(absoluteUrl)
);
} catch {
return line;
}
})
.join("\n");

res.setHeader(
"Content-Type",
"application/vnd.apple.mpegurl"
);

return res.status(200).send(playlist);
}

// MPEG-TS / video segments
res.setHeader(
"Content-Type",
contentType || "video/mp2t"
);

res.setHeader("Content-Length", buffer.length.toString());
