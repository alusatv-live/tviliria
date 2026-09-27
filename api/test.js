
export default async function handler(req, res) {
const streamUrl = "https://ssh101.com/live/albanianusa/";

try {
const response = await fetch(streamUrl);

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
streamUrl.includes(".m3u8")
) {
let playlist = await response.text();

playlist = playlist
.split("\n")
.map((line) => {
const trimmed = line.trim();

if (!trimmed) return line;

if (!trimmed.startsWith("#")) {
const absoluteUrl = new URL(trimmed, streamUrl).toString();

return (
"/api/test?url=" +
encodeURIComponent(absoluteUrl)
);
}

return line.replace(/URI="([^"]+)"/g, (match, uri) => {
const absoluteUrl = new URL(uri, streamUrl).toString();

return (
'URI="/api/test?url=' +
encodeURIComponent(absoluteUrl) +
'"'
);
