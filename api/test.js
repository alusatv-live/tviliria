
export default async function handler(req, res) {
const source = "https://ssh101.com/live/albanianusa/";

try {
const target = req.query.url
? decodeURIComponent(req.query.url)
: source;

const url = new URL(target);

if (url.hostname !== "ssh101.com") {
return res.status(403).send("Forbidden");
}

const response = await fetch(url.toString());

if (!response.ok) {
return res.status(response.status).send("Stream error");
}

const contentType = response.headers.get("content-type") || "";

res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
res.setHeader("Access-Control-Allow-Headers", "*");
res.setHeader("Cache-Control", "no-cache");

if (
contentType.includes("mpegurl") ||
contentType.includes("m3u8") ||
url.pathname.endsWith(".m3u8")
) {
let playlist = await response.text();

playlist = playlist
.split("\n")
.map((line) => {
const trimmed = line.trim();

if (!trimmed) return line;

// Rewrite segment and playlist URLs
if (!trimmed.startsWith("#")) {
const absolute = new URL(trimmed, url).toString();
return "/api/test?url=" + encodeURIComponent(absolute);
}

// Rewrite URI inside EXT-X-KEY / EXT-X-MAP
return line.replace(/URI="([^"]+)"/g, (match, uri) => {
const absolute = new URL(uri, url).toString();
return 'URI="/api/test?url=' + encodeURIComponent(absolute) + '"';
});
})
.join("\n");

res.setHeader(
"Content-Type",
"application/vnd.apple.mpegurl"
);

return res.status(200).send(playlist);
