import { getCloudflareContext } from "@opennextjs/cloudflare";

export const R2_MEDIA_PREFIX = "/media/";
export const PRO_IMAGES_BINDING = "PRO_IMAGES";

export type ProImagesObject = {
  body?: ReadableStream | null;
  httpEtag: string;
  writeHttpMetadata: (headers: Headers) => void;
};

export type ProImagesBucket = {
  get: (
    key: string,
    options?: { onlyIf?: { etagDoesNotMatch?: string } },
  ) => Promise<ProImagesObject | null>;
  put: (
    key: string,
    value: Blob | ArrayBuffer | ReadableStream | string,
    options?: {
      httpMetadata?: {
        contentType?: string;
        cacheControl?: string;
      };
      customMetadata?: Record<string, string>;
    },
  ) => Promise<unknown>;
};

export function getProImagesBucket(): ProImagesBucket | null {
  try {
    const env = getCloudflareContext().env as { PRO_IMAGES?: ProImagesBucket };
    return env.PRO_IMAGES ?? null;
  } catch {
    return null;
  }
}

export function publicMediaUrl(key: string) {
  return `${R2_MEDIA_PREFIX}${key}`;
}

export function isSafeMediaKey(key: string) {
  return Boolean(
    key &&
      !key.includes("..") &&
      !key.startsWith("/") &&
      key.split("/").every(Boolean) &&
      /^[-/._a-zA-Z0-9]+$/.test(key),
  );
}
