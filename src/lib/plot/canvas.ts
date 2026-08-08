export interface DprCanvas {
  readonly ctx: CanvasRenderingContext2D;
  readonly cssWidth: number;
  readonly cssHeight: number;
  readonly dpr: number;
}

/**
 * Sizes a canvas's backing store for the current devicePixelRatio and
 * returns a context pre-scaled so all drawing code can work in CSS pixels.
 * Call on mount and on every resize; cheap enough to call per-frame if the
 * container size is animating.
 */
export function setupCanvasDPR(
  canvas: HTMLCanvasElement,
  cssWidth: number,
  cssHeight: number
): DprCanvas {
  const dpr = typeof window === 'undefined' ? 1 : (window.devicePixelRatio ?? 1);
  const pixelWidth = Math.max(1, Math.round(cssWidth * dpr));
  const pixelHeight = Math.max(1, Math.round(cssHeight * dpr));

  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('setupCanvasDPR: 2d context unavailable');

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  return { ctx, cssWidth, cssHeight, dpr };
}

export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  cssWidth: number,
  cssHeight: number
): void {
  ctx.clearRect(0, 0, cssWidth, cssHeight);
}
