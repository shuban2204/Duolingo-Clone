"use client";

import { useEffect, useRef } from "react";

export function AnimatedDuo({ size = 112 }: { size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const image = new Image();
    image.src = "/duo-reading.png";
    image.onload = () => {
      const source = document.createElement("canvas");
      source.width = image.naturalWidth;
      source.height = image.naturalHeight;
      const sourceContext = source.getContext("2d", { willReadFrequently: true });
      if (!sourceContext) return;

      sourceContext.drawImage(image, 0, 0);
      const pixels = sourceContext.getImageData(0, 0, source.width, source.height);
      const [backgroundRed, backgroundGreen, backgroundBlue] = pixels.data;
      let minX = source.width;
      let minY = source.height;
      let maxX = 0;
      let maxY = 0;

      for (let index = 0; index < pixels.data.length; index += 4) {
        const red = pixels.data[index];
        const green = pixels.data[index + 1];
        const blue = pixels.data[index + 2];
        const distance = Math.hypot(red - backgroundRed, green - backgroundGreen, blue - backgroundBlue);
        const alpha = Math.max(0, Math.min(255, ((distance - 5) / 32) * 255));
        pixels.data[index + 3] = alpha;

        if (alpha > 18) {
          const pixel = index / 4;
          const x = pixel % source.width;
          const y = Math.floor(pixel / source.width);
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }

      sourceContext.putImageData(pixels, 0, 0);
      const padding = 8;
      const cropX = Math.max(0, minX - padding);
      const cropY = Math.max(0, minY - padding);
      const cropWidth = Math.min(source.width - cropX, maxX - minX + 1 + padding * 2);
      const cropHeight = Math.min(source.height - cropY, maxY - minY + 1 + padding * 2);

      canvas.width = cropWidth;
      canvas.height = cropHeight;
      canvas.getContext("2d")?.drawImage(source, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
    };
  }, []);

  return (
    <span
      className="animated-duo"
      style={{ "--animated-duo-size": `${size}px` } as React.CSSProperties}
      role="img"
      aria-label="Duo reading a book"
    >
      <canvas ref={canvasRef} />
      <i className="animated-duo-sparkle sparkle-one" aria-hidden="true" />
      <i className="animated-duo-sparkle sparkle-two" aria-hidden="true" />
    </span>
  );
}
