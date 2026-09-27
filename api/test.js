export default async function handler(req, res) {
const streamUrl = "https://ssh101.com/live/albanianusa/";

try {
const response = await fetch(streamUrl);

if (!response.ok) {
return res.status(response.status).send("Stream error");
}

const contentType = response.headers.get("content-type") || "";

res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Cache-Control", "no-cache");

const text = await response.text();

res.setHeader(
"Content-Type",
contentType || "application/vnd.apple.mpegurl"
);

res.status(200).send(text);
} catch (error) {
