import { forwardRef, useRef, useState } from "react";
import { Image as KonvaImage, Layer, Line, Stage } from "react-konva";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

interface DrawStageProps {
  image: any;
  imageSize: any;
  size: any;
  lines: any[];
  setLines: (lines: any[]) => void;
  selectedColor: string;
  tool: "brush" | "pen" | "eraser";
  brushSize: number;
  mode: "draw" | "move";
}

export const DrawStage = forwardRef<any, DrawStageProps>(
  (
    {
      image,
      imageSize,
      size,
      lines,
      setLines,
      selectedColor,
      tool,
      brushSize,
      mode,
    },
    ref,
  ) => {
    const [isDrawing, setIsDrawing] = useState(false);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const touchStartRef = useRef<{
      x: number;
      y: number;
      distance: number | null;
      lastCenter: { x: number; y: number } | null;
    }>({
      x: 0,
      y: 0,
      distance: null,
      lastCenter: null,
    });

    const getScaledPoints = (points: number[], scale: number) => {
      return points.map((point, i) => {
        const isX = i % 2 === 0;
        const center = isX ? size.width / 2 : size.height / 2;
        const scaledPoint = (point - center) * scale + center;
        return scaledPoint;
      });
    };

    const handleMouseDown = (e: any) => {
      if (mode !== "draw") return;

      e.evt.preventDefault();
      setIsDrawing(true);
      const pos = e.target.getStage().getPointerPosition();
      setLines([
        ...lines,
        { points: [pos.x, pos.y], color: selectedColor, tool, brushSize },
      ]);
    };

    const handleMouseMove = (e: any) => {
      if (mode !== "draw") return;

      e.evt.preventDefault();
      if (!isDrawing) return;

      const stage = e.target.getStage();
      const point = stage.getPointerPosition();
      const lastLine = lines[lines.length - 1];
      lastLine.points = lastLine.points.concat([point.x, point.y]);
      lines.splice(lines.length - 1, 1, lastLine);
      setLines([...lines]);
    };

    const handleMouseUp = () => {
      setIsDrawing(false);
    };

    const getTouchDistance = (touch1: Touch, touch2: Touch) => {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const getCenter = (touches: TouchList) => ({
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    });

    const handleTouchStart = (e: any) => {
      if (mode !== "move") return;

      if (e.touches?.length === 2) {
        e.preventDefault();
        const distance = getTouchDistance(e.touches[0], e.touches[1]);
        const center = getCenter(e.touches);
        touchStartRef.current = {
          x: center.x,
          y: center.y,
          distance,
          lastCenter: center,
        };
      }
    };

    const handleTouchMove = (e: any) => {
      if (mode !== "move") return;

      if (e.touches?.length === 2 && touchStartRef.current.distance !== null) {
        e.preventDefault();
        const newDistance = getTouchDistance(e.touches[0], e.touches[1]);
        const center = getCenter(e.touches);

        const delta = newDistance / touchStartRef.current.distance;
        setScale((prevScale) => {
          const newScale = prevScale * delta;
          return Math.min(Math.max(newScale, 0.5), 3);
        });

        if (touchStartRef.current.lastCenter) {
          const deltaX = center.x - touchStartRef.current.lastCenter.x;
          const deltaY = center.y - touchStartRef.current.lastCenter.y;
          setPosition((prev) => ({
            x: prev.x + deltaX,
            y: prev.y + deltaY,
          }));
        }

        touchStartRef.current.distance = newDistance;
        touchStartRef.current.lastCenter = center;
      }
    };

    const stageProps = {
      width: size.width,
      height: size.height,
      scaleX: scale,
      scaleY: scale,
      x: position.x,
      y: position.y,
      draggable: mode === "move",
      onDragEnd: (e: any) => {
        setPosition({ x: e.target.x(), y: e.target.y() });
      },
    };

    return (
      <TransformWrapper
        initialScale={1}
        initialPositionX={200}
        initialPositionY={100}
      >
        <TransformComponent>
          <Stage
            {...stageProps}
            onMouseDown={handleMouseDown}
            onMousemove={handleMouseMove}
            onMouseup={handleMouseUp}
            onTouchstart={handleMouseDown}
            onTouchmove={handleMouseMove}
            onTouchend={handleMouseUp}
            ref={ref}
            style={{
              backgroundColor: "white",
              touchAction: "none",
            }}
          >
            <Layer>
              <KonvaImage
                image={image}
                width={imageSize.width}
                height={imageSize.height}
                x={(size.width - imageSize.width) / 2}
                y={(size.height - imageSize.height) / 2}
                listening={false}
              />
            </Layer>
            <Layer>
              {lines.map((line, i) => (
                <Line
                  key={i}
                  points={getScaledPoints(line.points, 1 / scale)}
                  stroke={line.color}
                  strokeWidth={line.brushSize / scale}
                  tension={0.5}
                  lineCap={line.tool === "brush" ? "round" : "round"}
                  lineJoin="round"
                  globalCompositeOperation={
                    line.tool === "eraser" ? "destination-out" : "source-over"
                  }
                  opacity={line.tool === "brush" ? 0.5 : 1}
                  shadowColor={line.tool === "brush" ? line.color : undefined}
                  shadowBlur={line.tool === "brush" ? 4 : 0}
                  shadowOpacity={line.tool === "brush" ? 0.3 : 0}
                />
              ))}
            </Layer>
          </Stage>
        </TransformComponent>
      </TransformWrapper>
    );
  },
);

DrawStage.displayName = "DrawStage";
