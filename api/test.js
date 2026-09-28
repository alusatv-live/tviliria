
export const runtime = "nodejs";

export default async function handler(req, res) {
const originalStream =
"https://lbgo.bozztv.com/ssh101/ssh101/albanianusa/chunks.m3u8?lb_backend_hint=7";

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

if (target.hostname !== "lbgo.bozztv.com") {
return res.status(403).send("Forbidden");
}

const response = await fetch(target.toString());

if (!response.ok) {
return res.status(response.status).send("Stream error");
}

const contentType =
response.headers.get("content-type") || "";

res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
res.setHeader("Access-Control-Allow-Headers", "*");
res.setHeader("Cache-Control", "no-cache");

const buffer = Buffer.from(await response.arrayBuffer());
