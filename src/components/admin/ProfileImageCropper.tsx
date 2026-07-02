"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent, type SyntheticEvent } from "react";

const OUTPUT_SIZE = 1200;
const DEFAULT_STAGE_SIZE = 320;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

type ImageMetrics = {
  naturalWidth: number;
  naturalHeight: number;
};

type Offset = {
  x: number;
  y: number;
};

export function ProfileImageCropper({
  file,
  uploading,
  onCancel,
  onConfirm,
}: {
  file: File;
  uploading: boolean;
  onCancel: () => void;
  onConfirm: (file: File) => Promise<boolean>;
}) {
  const [previewUrl, setPreviewUrl] = useState("");
  const [metrics, setMetrics] = useState<ImageMetrics | null>(null);
  const [stageSize, setStageSize] = useState(DEFAULT_STAGE_SIZE);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const [error, setError] = useState("");
  const stageRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setMetrics(null);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setError("");
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const syncStageSize = () => {
      const nextSize = Math.round(stage.getBoundingClientRect().width);
      if (nextSize > 0) setStageSize(nextSize);
    };

    syncStageSize();
    const observer = new ResizeObserver(syncStageSize);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const baseScale = useMemo(() => {
    if (!metrics) return 1;
    return Math.max(stageSize / metrics.naturalWidth, stageSize / metrics.naturalHeight);
  }, [metrics, stageSize]);

  const displaySize = useMemo(() => {
    if (!metrics) return { width: stageSize, height: stageSize };
    return {
      width: metrics.naturalWidth * baseScale * zoom,
      height: metrics.naturalHeight * baseScale * zoom,
    };
  }, [baseScale, metrics, stageSize, zoom]);

  useEffect(() => {
    if (!metrics) return;
    setOffset((current) => clampOffset(current, displaySize.width, displaySize.height, stageSize));
  }, [displaySize.height, displaySize.width, metrics, stageSize]);

  function displaySizeForZoom(nextZoom: number) {
    if (!metrics) return { width: stageSize, height: stageSize };
    return {
      width: metrics.naturalWidth * baseScale * nextZoom,
      height: metrics.naturalHeight * baseScale * nextZoom,
    };
  }

  function handleImageLoad(event: SyntheticEvent<HTMLImageElement>) {
    const image = event.currentTarget;
    setMetrics({
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
    });
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!metrics || uploading) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: offset.x,
      originY: offset.y,
    };
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const nextOffset = {
      x: drag.originX + event.clientX - drag.startX,
      y: drag.originY + event.clientY - drag.startY,
    };
    setOffset(clampOffset(nextOffset, displaySize.width, displaySize.height, stageSize));
  }

  function handlePointerEnd(event: PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
  }

  function handleZoomChange(value: string) {
    const nextZoom = clamp(Number(value), MIN_ZOOM, MAX_ZOOM);
    const nextDisplaySize = displaySizeForZoom(nextZoom);
    setZoom(nextZoom);
    setOffset((current) => clampOffset(current, nextDisplaySize.width, nextDisplaySize.height, stageSize));
  }

  async function handleConfirm() {
    if (!imageRef.current || !metrics) {
      setError("이미지를 불러오는 중입니다.");
      return;
    }

    setError("");
    try {
      const croppedFile = await createCroppedProfileFile({
        originalFile: file,
        image: imageRef.current,
        metrics,
        stageSize,
        baseScale,
        zoom,
        offset,
      });
      const uploaded = await onConfirm(croppedFile);
      if (!uploaded) setError("사진을 업로드하지 못했습니다. 로그인 상태와 파일 형식을 확인해주세요.");
    } catch {
      setError("프로필 사진을 자르지 못했습니다. 다른 사진으로 다시 시도해주세요.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-fairway-950/70 px-4 py-6">
      <div className="w-full max-w-[480px] rounded-lg bg-white p-4 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-fairway-900">프로필 사진 위치 지정</h2>
            <p className="mt-1 text-[13px] text-fairway-500">사각형 안에 얼굴이 오도록 맞춰주세요.</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={uploading}
            className="rounded-lg border border-fairway-200 px-3 py-1.5 text-xs font-bold text-fairway-600 hover:bg-fairway-50 disabled:opacity-50"
          >
            닫기
          </button>
        </div>

        <div className="mt-4 flex justify-center">
          <div
            ref={stageRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
            className="relative aspect-square w-full max-w-[360px] cursor-grab overflow-hidden rounded-lg bg-fairway-100 ring-1 ring-fairway-200 active:cursor-grabbing"
            style={{ touchAction: "none" }}
          >
            {previewUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                ref={imageRef}
                src={previewUrl}
                alt="프로필 사진 크롭 미리보기"
                draggable={false}
                onLoad={handleImageLoad}
                className="absolute select-none"
                style={{
                  height: displaySize.height,
                  left: "50%",
                  maxWidth: "none",
                  top: "50%",
                  transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px)`,
                  width: displaySize.width,
                }}
              />
            )}
            <div className="pointer-events-none absolute inset-0 ring-2 ring-inset ring-white/90" />
            <div className="pointer-events-none absolute inset-x-0 top-1/3 border-t border-white/60" />
            <div className="pointer-events-none absolute inset-x-0 top-2/3 border-t border-white/60" />
            <div className="pointer-events-none absolute inset-y-0 left-1/3 border-l border-white/60" />
            <div className="pointer-events-none absolute inset-y-0 left-2/3 border-l border-white/60" />
          </div>
        </div>

        <label className="mt-4 block">
          <div className="flex items-center justify-between gap-3">
            <span className="label mb-0">확대</span>
            <span className="text-xs font-bold text-fairway-500">{Math.round(zoom * 100)}%</span>
          </div>
          <input
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step="0.01"
            value={zoom}
            disabled={!metrics || uploading}
            onChange={(event) => handleZoomChange(event.target.value)}
            className="mt-2 w-full accent-fairway-700"
          />
        </label>

        {error && <p className="mt-3 text-[13px] font-semibold text-rose-600">{error}</p>}

        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onCancel} disabled={uploading} className="btn-outline">
            취소
          </button>
          <button type="button" onClick={handleConfirm} disabled={!metrics || uploading} className="btn-primary">
            {uploading ? "업로드 중..." : "이대로 업로드"}
          </button>
        </div>
      </div>
    </div>
  );
}

async function createCroppedProfileFile({
  originalFile,
  image,
  metrics,
  stageSize,
  baseScale,
  zoom,
  offset,
}: {
  originalFile: File;
  image: HTMLImageElement;
  metrics: ImageMetrics;
  stageSize: number;
  baseScale: number;
  zoom: number;
  offset: Offset;
}) {
  const visibleScale = baseScale * zoom;
  const sourceSize = stageSize / visibleScale;
  const maxSourceX = Math.max(0, metrics.naturalWidth - sourceSize);
  const maxSourceY = Math.max(0, metrics.naturalHeight - sourceSize);
  const sourceX = clamp((metrics.naturalWidth - sourceSize) / 2 - offset.x / visibleScale, 0, maxSourceX);
  const sourceY = clamp((metrics.naturalHeight - sourceSize) / 2 - offset.y / visibleScale, 0, maxSourceY);

  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas context is unavailable.");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
  context.imageSmoothingQuality = "high";
  context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((nextBlob) => {
      if (nextBlob) resolve(nextBlob);
      else reject(new Error("Failed to create cropped image."));
    }, "image/jpeg", 0.92);
  });

  const stem = originalFile.name.replace(/\.[^.]+$/, "") || "profile";
  return new File([blob], `${stem}-profile-crop.jpg`, {
    lastModified: Date.now(),
    type: "image/jpeg",
  });
}

function clampOffset(offset: Offset, displayWidth: number, displayHeight: number, stageSize: number) {
  const maxX = Math.max(0, (displayWidth - stageSize) / 2);
  const maxY = Math.max(0, (displayHeight - stageSize) / 2);
  return {
    x: clamp(offset.x, -maxX, maxX),
    y: clamp(offset.y, -maxY, maxY),
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
