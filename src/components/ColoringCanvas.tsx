import React, { useEffect, useRef, useState } from "react";
import { ColorPalette } from "./ColorPalette";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";

interface ColoringCanvasProps {
  width?: number;
  height?: number;
}

export function ColoringCanvas({
  width = 800,
  height = 600,
}: ColoringCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState([2]);

  const [isLocked, setIsLocked] = useState(true);
  const [pathData, setPathData] = useState<ImageData | null>(null);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(
    null,
  );

  // Generate a simple SVG image (example: a house)
  const generateSimpleSVG = () => {
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <!-- House body -->
        <rect x="300" y="250" width="200" height="150" stroke="black" stroke-width="2" fill="none"/>
        <!-- Roof -->
        <path d="M280 250 L400 150 L520 250" stroke="black" stroke-width="2" fill="none"/>
        <!-- Door -->
        <rect x="375" y="300" width="50" height="100" stroke="black" stroke-width="2" fill="none"/>
        <!-- Window left -->
        <rect x="325" y="275" width="40" height="40" stroke="black" stroke-width="2" fill="none"/>
        <!-- Window right -->
        <rect x="435" y="275" width="40" height="40" stroke="black" stroke-width="2" fill="none"/>
      </svg>
    `;
    return svg;
  };

  // Load SVG onto canvas
  const loadSVGOntoCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    const svg = generateSimpleSVG();
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      savePathData();
      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  // Load SVG when component mounts
  useEffect(() => {
    loadSVGOntoCanvas();
  }, []);

  // Save the initial line art for locked mode
  const savePathData = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setPathData(ctx.getImageData(0, 0, canvas.width, canvas.height));
  };

  const drawBrush = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.beginPath();
    ctx.arc(x, y, lineWidth[0] / 2, 0, Math.PI * 2);
    ctx.fillStyle = currentColor;
    ctx.fill();

    // Connect brush strokes smoothly if there's a last point
    if (lastPoint) {
      const { x: lastX, y: lastY } = lastPoint;
      const distance = Math.sqrt((x - lastX) ** 2 + (y - lastY) ** 2);
      const steps = Math.floor(distance);

      for (let i = 1; i < steps; i++) {
        const ratio = i / steps;
        const interpX = lastX + (x - lastX) * ratio;
        const interpY = lastY + (y - lastY) * ratio;
        ctx.beginPath();
        ctx.arc(interpX, interpY, lineWidth[0] / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    setLastPoint({ x, y });
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    drawBrush(ctx, x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isLocked && pathData) {
      // Check if we're coloring within the lines
      const pixelData = ctx.getImageData(x, y, 1, 1).data;
      const isOnLine = pixelData[3] > 0; // Check alpha channel

      if (!isOnLine) {
        drawBrush(ctx, x, y);
      }
    } else {
      drawBrush(ctx, x, y);
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setLastPoint(null); // Reset last point when stopping drawing
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-col gap-4 mb-4 w-full max-w-md">
        <div className="flex items-center gap-4">
          <input
            type="color"
            value={currentColor}
            onChange={(e) => setCurrentColor(e.target.value)}
            className="w-10 h-10"
          />
          <ColorPalette
            baseColor={currentColor}
            onColorSelect={setCurrentColor}
          />
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm">Line Width:</span>
          <Slider
            defaultValue={lineWidth}
            onValueChange={(e) => setLineWidth(e.value)}
            min={1}
            max={20}
            step={1}
            className="w-32"
          />
          <span className="text-sm">{lineWidth}px</span>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => {
              setIsLocked(!isLocked);
              if (!isLocked) savePathData();
            }}
          >
            {isLocked ? "Locked (Color within lines)" : "Unlocked"}
          </Button>
          <Button onClick={loadSVGOntoCanvas}>Reset Image</Button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="border border-gray-300"
      />
    </div>
  );
}
