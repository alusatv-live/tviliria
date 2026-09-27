
export const runtime = "nodejs";

export default async function handler(req, res) {
try {
res.status(200).send("TVILIRIA FUNCTION WORKS");
} catch (error) {
res.status(500).send(error.message);
}
}
