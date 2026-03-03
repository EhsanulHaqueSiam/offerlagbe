const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1200;
const QUALITY = 0.75;
const MAX_SIZE_BYTES = 400 * 1024; // 400KB target

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob> {
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

export async function compressImage(file: File): Promise<File> {
  // Skip tiny files or non-images
  if (!file.type.startsWith("image/")) {
    throw new Error("Not an image file");
  }

  // Reject SVGs — potential XSS vector
  if (file.type === "image/svg+xml") {
    throw new Error("SVG files are not supported");
  }

  // If already small enough, just return
  if (file.size <= MAX_SIZE_BYTES) {
    // Still resize if dimensions are huge
    const img = await loadImage(file);
    if (img.width <= MAX_WIDTH && img.height <= MAX_HEIGHT) {
      URL.revokeObjectURL(img.src);
      return file;
    }
    URL.revokeObjectURL(img.src);
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

  // Try JPEG first (smaller), then WebP
  let blob = await canvasToBlob(canvas, "image/jpeg", QUALITY);

  // If still too large, reduce quality progressively
  let quality = QUALITY;
  while (blob.size > MAX_SIZE_BYTES && quality > 0.3) {
    quality -= 0.1;
    blob = await canvasToBlob(canvas, "image/jpeg", quality);
  }

  // If still too large, reduce dimensions (re-draw from canvas, not revoked img)
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
    blob = await canvasToBlob(canvas, "image/jpeg", 0.7);
  }

  const name = file.name.replace(/\.[^.]+$/, ".jpg");
  return new File([blob], name, { type: "image/jpeg" });
}

export function validateImageFile(file: File): string | null {
  const validTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ];
  if (!validTypes.includes(file.type)) {
    return "Invalid file type. Use JPEG, PNG, WebP, or GIF.";
  }
  // 10MB raw limit before compression
  if (file.size > 10 * 1024 * 1024) {
    return "File too large. Maximum 10MB per image.";
  }
  return null;
}
