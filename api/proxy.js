export default async function handler(req, res) {
const target = "https://ssh101.com/live/albanianusa/";

try {
const response = await fetch(target);

if (!response.ok) {
return res.status(response.status).send("Stream error");
}

const contentType = response.headers.get("content-type") || "";

res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Content-Type", contentType);

const body = await response.arrayBuffer();
res.status(200).send(Buffer.from(body));
} catch (error) {
res.status(500).send("Proxy error");
}
}
