// Stores learning progress per sync code so phone and PC share one state.
import { getStore } from "@netlify/blobs";

export default async (req) => {
  const code = new URL(req.url).searchParams.get("code") || "";
  if (!/^[a-z0-9]{8}$/.test(code)) return new Response("bad code", { status: 400 });
  const store = getStore("progress");

  if (req.method === "GET") {
    const data = await store.get(code);
    return new Response(data ?? "null", { headers: { "content-type": "application/json" } });
  }
  if (req.method === "PUT") {
    const body = await req.text();
    if (body.length > 200000) return new Response("too large", { status: 413 });
    try { JSON.parse(body); } catch { return new Response("bad json", { status: 400 }); }
    await store.set(code, body);
    return new Response("ok");
  }
  return new Response("method not allowed", { status: 405 });
};

export const config = { path: "/api/sync" };
