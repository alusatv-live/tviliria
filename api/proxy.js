export default async function handler(req, res) {
const originalStream = "https://ssh101.com/live/albanianusa/";
const requestedUrl = req.query.url
? decodeURIComponent(req.query.url)
: originalStream;

try {
const url = new URL(requestedUrl);

// Lejojmë vetëm SSH101
if (url.hostname !== "ssh101.com") {
return res.status(403).send("Forbidden");
}

const response = await fetch(url.toString());

if (!response.ok) {
return res.status(response.status).send("Stream error");
}

const contentType =
response.headers.get("content-type") || "";

res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
res.setHeader("Access-Control-Allow-Headers", "*");
res.setHeader("Cache-Control", "no-cache");

// HLS playlist
if (
contentType.includes("mpegurl") ||
contentType.includes("m3u8") ||
url.pathname.endsWith(".m3u8")
) {
const text = await response.text();

const rewritten = text
.split("\n")
.map((line) => {
const trimmed = line.trim();

if (!trimmed || trimmed.startsWith("#")) {
return line;
}

const absoluteUrl = new URL(trimmed, response.url).toString();

return "/api/proxy?url=" +
encodeURIComponent(absoluteUrl);
})
.join("\n");

res.setHeader(
"Content-Type",
"application/vnd.apple.mpegurl"
);

return res.status(200).send(rewritten);
}

// Video/audio segments
const buffer = Buffer.from(await response.arrayBuffer());

res.setHeader("Content-Type", contentType || "application/octet-stream");

return res.status(200).send(buffer);

} catch (error) {
return res.status(500).send("Proxy error: " + error.message);
}
}

