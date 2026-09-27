export const runtime = "nodejs";

export default async function handler(req, res) {
const originalStream = "https://ssh101.com/live/albanianusa/";

try {
if (req.method === "OPTIONS") {
res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
res.setHeader("Access-Control-Allow-Headers", "*");
return res.status(204).end();
}

const requestedUrl = req.query.url
? decodeURIComponent(req.query.url)
: originalStream;

const target = new URL(requestedUrl);

if (target.hostname !== "ssh101.com") {
return res.status(403).send("Forbidden");
}

const response = await fetch(target.toString());

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
contentType.includes("m3u8")
) {
let playlist = await response.text();

playlist = playlist
.split("\n")
.map((line) => {
const trimmed = line.trim();

if (!trimmed) return line;

if (!trimmed.startsWith("#")) {
const absoluteUrl = new URL(
trimmed,
target.toString()
).toString();

return "/api/test?url=" +
encodeURIComponent(absoluteUrl);
}

return line.replace(/URI="([^"]+)"/g, (match, uri) => {
const absoluteUrl = new URL(
uri,
target.toString()
).toString();

return 'URI="/api/test?url=' +
encodeURIComponent(absoluteUrl) +
'"';
});
})
.join("\n");

res.setHeader(
"Content-Type",
"application/vnd.apple.mpegurl"
);

return res.status(200).send(playlist);
}

const buffer = Buffer.from(
await response.arrayBuffer()
);

res.setHeader(
"Content-Type",
contentType || "application/octet-stream"
);

return res.status(200).send(buffer);

} catch (error) {
return res.status(500).send(
"Proxy error: " + error.message
);
}
}
