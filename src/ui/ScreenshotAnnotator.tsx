"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "./primitives/button";

import { ScreenshotHighlightRegion } from "../core/types";

type ScreenshotAnnotationChange = {
  annotatedBlob: Blob | null;
  highlights: ScreenshotHighlightRegion[];
  imageWidth: number;
  imageHeight: number;
};

type ScreenshotAnnotatorProps = {
  imageUrl: string;
  disabled?: boolean;
  onChange: (value: ScreenshotAnnotationChange) => void;
};

type Rect = ScreenshotHighlightRegion;

type Point = {
  x: number;
  y: number;
};

function clamp(value: number): number {
  if (value < 0) {
    return 0;
  }

  if (value > 1) {
    return 1;
  }

  return value;
}

function normalizeRect(start: Point, end: Point): Rect {
  const x = clamp(Math.min(start.x, end.x));
  const y = clamp(Math.min(start.y, end.y));
  const maxX = clamp(Math.max(start.x, end.x));
  const maxY = clamp(Math.max(start.y, end.y));

  return {
    x,
    y,
    width: Math.max(0, maxX - x),
    height: Math.max(0, maxY - y),
  };
}

function toDisplayRect(rect: Rect, width: number, height: number): { x: number; y: number; width: number; height: number } {
  return {
    x: rect.x * width,
    y: rect.y * height,
    width: rect.width * width,
    height: rect.height * height,
  };
}

async function renderAnnotatedBlob(
  imageUrl: string,
  imageWidth: number,
  imageHeight: number,
  highlights: Rect[],
): Promise<Blob> {
  const image = new Image();
  image.src = imageUrl;

  await new Promise<void>((resolve, reject) => {
    const handleLoad = () => {
      cleanup();
      resolve();
    };

    const handleError = () => {
      cleanup();
      reject(new Error("Failed to prepare screenshot annotation image."));
    };

    const cleanup = () => {
      image.removeEventListener("load", handleLoad);
      image.removeEventListener("error", handleError);
    };

    image.addEventListener("load", handleLoad, { once: true });
    image.addEventListener("error", handleError, { once: true });
  });

  const canvas = document.createElement("canvas");
  canvas.width = imageWidth;
  canvas.height = imageHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Could not prepare screenshot annotation canvas.");
  }

  context.drawImage(image, 0, 0, imageWidth, imageHeight);

  context.lineWidth = Math.max(2, Math.round(Math.min(imageWidth, imageHeight) / 300));
  context.strokeStyle = "#ef4444";
  context.fillStyle = "rgba(239, 68, 68, 0.18)";

  for (const rect of highlights) {
    const draw = toDisplayRect(rect, imageWidth, imageHeight);
    context.fillRect(draw.x, draw.y, draw.width, draw.height);
    context.strokeRect(draw.x, draw.y, draw.width, draw.height);
  }

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/png", 1);
  });

  if (!blob) {
    throw new Error("Failed to generate screenshot annotation.");
  }

  return blob;
}

export function ScreenshotAnnotator({ imageUrl, disabled = false, onChange }: ScreenshotAnnotatorProps) {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [highlights, setHighlights] = useState<Rect[]>([]);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [activeRect, setActiveRect] = useState<Rect | null>(null);
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

  const isDrawing = Boolean(startPoint && activeRect);

  const syncCanvasSize = useCallback(() => {
    const image = imageRef.current;
    const canvas = canvasRef.current;

    if (!image || !canvas) {
      return;
    }

    const width = Math.max(1, Math.round(image.clientWidth));
    const height = Math.max(1, Math.round(image.clientHeight));

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    setDisplaySize({ width, height });
  }, []);

  const handleImageLoad = useCallback(() => {
    const image = imageRef.current;
    if (!image) {
      return;
    }

    setNaturalSize({
      width: Math.max(1, image.naturalWidth || 1),
      height: Math.max(1, image.naturalHeight || 1),
    });
    syncCanvasSize();
  }, [syncCanvasSize]);

  useEffect(() => {
    const onResize = () => {
      syncCanvasSize();
    };

    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [syncCanvasSize]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    context.lineWidth = 2;
    context.strokeStyle = "#ef4444";
    context.fillStyle = "rgba(239, 68, 68, 0.18)";

    for (const rect of highlights) {
      const draw = toDisplayRect(rect, canvas.width, canvas.height);
      context.fillRect(draw.x, draw.y, draw.width, draw.height);
      context.strokeRect(draw.x, draw.y, draw.width, draw.height);
    }

    if (activeRect) {
      const draw = toDisplayRect(activeRect, canvas.width, canvas.height);
      context.fillRect(draw.x, draw.y, draw.width, draw.height);
      context.strokeRect(draw.x, draw.y, draw.width, draw.height);
    }
  }, [activeRect, highlights]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas, displaySize]);

  useEffect(() => {
    let cancelled = false;

    const publish = async () => {
      if (naturalSize.width <= 0 || naturalSize.height <= 0) {
        return;
      }

      if (highlights.length === 0) {
        onChange({
          annotatedBlob: null,
          highlights: [],
          imageWidth: naturalSize.width,
          imageHeight: naturalSize.height,
        });
        return;
      }

      try {
        const annotatedBlob = await renderAnnotatedBlob(imageUrl, naturalSize.width, naturalSize.height, highlights);
        if (cancelled) {
          return;
        }

        onChange({
          annotatedBlob,
          highlights,
          imageWidth: naturalSize.width,
          imageHeight: naturalSize.height,
        });
      } catch {
        if (cancelled) {
          return;
        }

        onChange({
          annotatedBlob: null,
          highlights,
          imageWidth: naturalSize.width,
          imageHeight: naturalSize.height,
        });
      }
    };

    void publish();

    return () => {
      cancelled = true;
    };
  }, [highlights, imageUrl, naturalSize.height, naturalSize.width, onChange]);

  const toPoint = useCallback((event: React.PointerEvent<HTMLCanvasElement>): Point | null => {
    const canvas = canvasRef.current;

    if (!canvas || canvas.width <= 0 || canvas.height <= 0) {
      return null;
    }

    const bounds = canvas.getBoundingClientRect();
    if (bounds.width <= 0 || bounds.height <= 0) {
      return null;
    }

    const x = clamp((event.clientX - bounds.left) / bounds.width);
    const y = clamp((event.clientY - bounds.top) / bounds.height);
    return { x, y };
  }, []);

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) {
      return;
    }

    const point = toPoint(event);
    if (!point) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    setStartPoint(point);
    setActiveRect({ x: point.x, y: point.y, width: 0, height: 0 });
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled || !startPoint) {
      return;
    }

    const point = toPoint(event);
    if (!point) {
      return;
    }

    setActiveRect(normalizeRect(startPoint, point));
  };

  const completeDrawing = (point: Point | null) => {
    if (!point || !startPoint) {
      setStartPoint(null);
      setActiveRect(null);
      return;
    }

    const rect = normalizeRect(startPoint, point);

    if (rect.width >= 0.01 && rect.height >= 0.01) {
      setHighlights((current) => [...current, rect]);
    }

    setStartPoint(null);
    setActiveRect(null);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled) {
      return;
    }

    const point = toPoint(event);
    completeDrawing(point);
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const handlePointerCancel = () => {
    setStartPoint(null);
    setActiveRect(null);
  };

  const clearHighlights = () => {
    setHighlights([]);
    setStartPoint(null);
    setActiveRect(null);
  };

  const undoLast = () => {
    setHighlights((current) => current.slice(0, -1));
  };

  const highlightCountLabel = useMemo(() => {
    const count = highlights.length;
    return `${count} highlight${count === 1 ? "" : "s"}`;
  }, [highlights.length]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-gray-500">
          Drag over the screenshot to highlight the exact area with an issue. {highlightCountLabel} added.
        </p>
        <div className="flex items-center gap-2">
          <Button disabled={disabled || highlights.length === 0} size="sm" type="button" variant="outline" onClick={undoLast}>
            Undo
          </Button>
          <Button
            disabled={disabled || (highlights.length === 0 && !isDrawing)}
            size="sm"
            type="button"
            variant="outline"
            onClick={clearHighlights}
          >
            Clear
          </Button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-lg border border-gray-200 bg-black/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imageRef}
          alt="Captured screenshot"
          className="mx-auto h-auto max-h-[45vh] w-full select-none object-contain"
          onLoad={handleImageLoad}
          src={imageUrl}
        />
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 h-full w-full ${disabled ? "cursor-not-allowed" : "cursor-crosshair"}`}
          onPointerCancel={handlePointerCancel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
      </div>
    </div>
  );
}
