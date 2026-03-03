const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1200;
const QUALITY = 0.7;
const MAX_SIZE_BYTES = 300 * 1024; // 300KB target

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas toBlob failed"));
      },
      type,
      quality,
    );
  });
}

let _webpSupported: boolean | null = null;
function supportsWebP(): boolean {
  if (_webpSupported !== null) return _webpSupported;
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  _webpSupported = canvas.toDataURL("image/webp").startsWith("data:image/webp");
  return _webpSupported;
}

export async function compressImage(file: File): Promise<File> {
  // Skip tiny files or non-images
  if (!file.type.startsWith("image/")) {
    throw new Error("Not an image file");
  }

  // Reject SVGs — potential XSS vector
  if (file.type === "image/svg+xml") {
    throw new Error("SVG files are not supported");
  }

  const img = await loadImage(file);

  // Calculate new dimensions maintaining aspect ratio
  let { width, height } = img;
  if (width > MAX_WIDTH) {
    height = Math.round((height * MAX_WIDTH) / width);
    width = MAX_WIDTH;
  }
  if (height > MAX_HEIGHT) {
    width = Math.round((width * MAX_HEIGHT) / height);
    height = MAX_HEIGHT;
  }

  // Draw to canvas
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, width, height);
  URL.revokeObjectURL(img.src);

  // Prefer WebP (much smaller), fall back to JPEG
  const useWebP = supportsWebP();
  const outputType = useWebP ? "image/webp" : "image/jpeg";
  const ext = useWebP ? ".webp" : ".jpg";

  let blob = await canvasToBlob(canvas, outputType, QUALITY);

  // If still too large, reduce quality progressively
  let quality = QUALITY;
  while (blob.size > MAX_SIZE_BYTES && quality > 0.2) {
    quality -= 0.1;
    blob = await canvasToBlob(canvas, outputType, quality);
  }

  // If still too large, reduce dimensions
  if (blob.size > MAX_SIZE_BYTES) {
    const scale = Math.sqrt(MAX_SIZE_BYTES / blob.size);
    const srcData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const tmpCanvas = document.createElement("canvas");
    tmpCanvas.width = srcData.width;
    tmpCanvas.height = srcData.height;
    tmpCanvas.getContext("2d")!.putImageData(srcData, 0, 0);
    ctx.drawImage(tmpCanvas, 0, 0, canvas.width, canvas.height);
    blob = await canvasToBlob(canvas, outputType, 0.6);
  }

  const name = file.name.replace(/\.[^.]+$/, ext);
  return new File([blob], name, { type: outputType });
}

export function validateImageFile(file: File): string | null {
  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!validTypes.includes(file.type)) {
    return "Invalid file type. Use JPEG, PNG, WebP, or GIF.";
  }
  // 10MB raw limit before compression
  if (file.size > 10 * 1024 * 1024) {
    return "File too large. Maximum 10MB per image.";
  }
  return null;
}
