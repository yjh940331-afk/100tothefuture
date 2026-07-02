import { getProImagesBucket, isSafeMediaKey } from "@/lib/r2";

type MediaRouteContext = {
  params: Promise<{ path: string[] }>;
};

async function readObject(req: Request, { params }: MediaRouteContext, headOnly = false) {
  const { path } = await params;
  const key = path.join("/");
  if (!isSafeMediaKey(key)) {
    return new Response("Invalid media path", { status: 400 });
  }

  const bucket = getProImagesBucket();
  if (!bucket) {
    return new Response("Media storage is not configured", { status: 500 });
  }

  const ifNoneMatch = req.headers.get("if-none-match")?.replace(/"/g, "");
  const object = await bucket.get(key, ifNoneMatch ? { onlyIf: { etagDoesNotMatch: ifNoneMatch } } : undefined);
  if (!object) {
    return new Response("Not found", { status: 404 });
  }
  if (!object.body) {
    return new Response(null, { status: 304, headers: { etag: object.httpEtag } });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", headers.get("cache-control") || "public, max-age=31536000, immutable");
  headers.set("x-content-type-options", "nosniff");

  return new Response(headOnly ? null : object.body, { headers });
}

export async function GET(req: Request, context: MediaRouteContext) {
  return readObject(req, context);
}

export async function HEAD(req: Request, context: MediaRouteContext) {
  return readObject(req, context, true);
}
