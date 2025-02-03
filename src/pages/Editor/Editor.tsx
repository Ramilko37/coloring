import { ActiveColorIcon } from "@/assets/icons";
import sampleSVG from "@/assets/images/flower.svg";
import mockImage from "@/assets/images/unicorn.avif";
import { checkSVGPaths, optimizeSVG } from "@/utils/svgUtils";
import {
  Box,
  Button,
  Drawer,
  Fade,
  IconButton,
  Slider,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { AiOutlineZoomIn, AiOutlineZoomOut } from "react-icons/ai";
import { FaBrush, FaEraser, FaPen } from "react-icons/fa";
import { Image as KonvaImage, Layer, Line, Stage } from "react-konva";
import useImage from "use-image";
import "./styles.css";

interface Line {
  points: number[];
  color: string;
  tool: "brush" | "pen" | "eraser";
  brushSize: number;
}

interface EditorProps {
  isSvg?: boolean;
}

export const Editor = ({ isSvg = false }: EditorProps) => {
  const stageRef = useRef<any>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [tool, setTool] = useState<"brush" | "pen" | "eraser">("pen");
  const [showBrushSize, setShowBrushSize] = useState(false);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [brushSize, setBrushSize] = useState(5);
  const containerRef = useRef<HTMLDivElement>(null);
  const [image] = useImage(mockImage);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [hasUnclosedPaths, setHasUnclosedPaths] = useState(false);
  const [scale, setScale] = useState(1);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [showUndoFeedback, setShowUndoFeedback] = useState(false);

  const touchStartRef = useRef<{
    x: number;
    y: number;
    distance: number | null;
  }>({
    x: 0,
    y: 0,
    distance: null,
  });

  const controlButtons = [
    {
      label: "Zoom In",
      icon: <AiOutlineZoomIn size={24} />,
      handler: () => setScale((prev) => Math.min(prev + 0.1, 3)),
    },
    {
      label: "Zoom Out",
      icon: <AiOutlineZoomOut size={24} />,
      handler: () => setScale((prev) => Math.max(prev - 0.1, 0.5)),
    },
    {
      label: "Brush",
      icon: <FaBrush />,
      handler: () => {
        setTool("brush");
        setBrushSize(20);
      },
      isActive: tool === "brush",
    },
    {
      label: "Pen",
      icon: <FaPen />,
      handler: () => {
        setTool("pen");
        setBrushSize(5);
      },
      isActive: tool === "pen",
    },
    {
      label: "Eraser",
      icon: <FaEraser />,
      handler: () => {
        setTool("eraser");
        setBrushSize(20);
      },
      isActive: tool === "eraser",
    },
    {
      label: "Active Color",
      icon: <ActiveColorIcon fill={selectedColor} />,
      handler: () => setShowColorPicker(true),
    },
  ];

  // Update container size on mount and resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setSize({
          width: clientWidth,
          height: clientHeight,
        });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Update stage size with zoom
  const stageSize = {
    width: size.width,
    height: size.height,
    scaleX: scale,
    scaleY: scale,
  };

  // Calculate image dimensions considering zoom
  useEffect(() => {
    if (image && size.width && size.height) {
      const aspectRatio = image.width / image.height;
      let newWidth = size.width / scale;
      let newHeight = size.width / scale / aspectRatio;

      if (newHeight > size.height / scale) {
        newHeight = size.height / scale;
        newWidth = (size.height / scale) * aspectRatio;
      }

      setImageSize({
        width: newWidth,
        height: newHeight,
      });
    }
  }, [image, size, scale]);

  const handleMouseDown = (e: any) => {
    // Prevent default touch behavior
    e.evt.preventDefault();
    setIsDrawing(true);
    const pos = e.target.getStage().getPointerPosition();
    setLines([
      ...lines,
      {
        points: [pos.x, pos.y],
        color: selectedColor,
        tool,
        brushSize,
      },
    ]);
  };

  const handleMouseMove = (e: any) => {
    // Prevent default touch behavior
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

  const handleBrushSizeChange = (e: any) => {
    setBrushSize(e.target.value);
  };

  // Touch handlers for SVG zoom
  const getTouchDistance = (touch1: Touch, touch2: Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const distance = getTouchDistance(e.touches[0], e.touches[1]);
      touchStartRef.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
        distance,
      };
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 2 && touchStartRef.current.distance !== null) {
      e.preventDefault();
      const newDistance = getTouchDistance(e.touches[0], e.touches[1]);
      const delta = newDistance / touchStartRef.current.distance;

      setScale((prevScale) => {
        const newScale = prevScale * delta;
        return Math.min(Math.max(newScale, 0.5), 3);
      });

      touchStartRef.current.distance = newDistance;
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current.distance = null;
  };

  // Touch event listeners for SVG
  useEffect(() => {
    if (isSvg) {
      const container = document.getElementById("editor-container");
      if (container) {
        container.addEventListener("touchstart", handleTouchStart, {
          passive: false,
        });
        container.addEventListener("touchmove", handleTouchMove, {
          passive: false,
        });
        container.addEventListener("touchend", handleTouchEnd);

        return () => {
          container.removeEventListener("touchstart", handleTouchStart);
          container.removeEventListener("touchmove", handleTouchMove);
          container.removeEventListener("touchend", handleTouchEnd);
        };
      }
    }
  }, [isSvg]);

  // Load content
  useEffect(() => {
    const loadContent = async () => {
      try {
        if (isSvg) {
          const loadSVG = async () => {
            try {
              const response = await fetch(sampleSVG);
              const text = await response.text();
              const optimizedSVG = optimizeSVG(text);

              // Check if all paths are closed
              const hasUnclosedPaths = checkSVGPaths(optimizedSVG);
              setHasUnclosedPaths(!hasUnclosedPaths);
            } catch (error) {
              console.error("Error loading SVG:", error);
            }
          };

          loadSVG();
        }
      } catch (error) {
        console.error("Error loading SVG:", error);
      }
    };

    loadContent();
  }, [isSvg]);

  // Zoom controls
  const handleZoom = (newScale: number) => {
    setScale(Math.min(Math.max(newScale, 0.5), 3));
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const scaleBy = 1.1;
    const newScale = e.deltaY < 0 ? scale * scaleBy : scale / scaleBy;
    handleZoom(newScale);
  };

  const handleUndo = () => {
    setLines((prev) => prev.slice(0, -1));
    setShowUndoFeedback(true);
    setTimeout(() => setShowUndoFeedback(false), 500);
  };

  const handleStageTouch = (e: any) => {
    e.evt.preventDefault();
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapTime;

    if (tapLength < 300 && tapLength > 0) {
      handleUndo();
    }
    setLastTapTime(currentTime);
  };

  // Fix line coordinates to stay in place during zoom
  const getScaledPoints = (points: number[], scale: number) => {
    return points.map((point, i) => {
      // Scale points relative to the center of the stage
      const isX = i % 2 === 0;
      const center = isX ? size.width / 2 : size.height / 2;
      const scaledPoint = (point - center) * scale + center;
      return scaledPoint;
    });
  };

  return (
    <Stack
      ref={containerRef}
      height="100%"
      width="100%"
      position="relative"
      sx={{
        bgcolor: "background.default",
        touchAction: "none",
        overscrollBehavior: "none",
      }}
    >
      <Fade in={showUndoFeedback}>
        <Typography
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            px: 3,
            py: 1,
            borderRadius: 2,
            zIndex: 1000,
          }}
        >
          Undo
        </Typography>
      </Fade>

      {isSvg && hasUnclosedPaths && (
        <Typography
          color="error"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            textAlign: "center",
            bgcolor: "error.light",
            color: "white",
            py: 1,
          }}
        >
          Warning: This SVG contains unclosed paths which may affect coloring
        </Typography>
      )}

      <Stack
        bgcolor={"#FEE034"}
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        p={"16px"}
      >
        {controlButtons.map((button) => (
          <IconButton
            key={button.label}
            sx={{
              borderRadius: "10px",
              backgroundColor: "#FFFAD6",
              width: "50px",
              height: "50px",
            }}
            onClick={button.handler}
          >
            {button.icon}
          </IconButton>
        ))}
      </Stack>
      <Stage
        width={size.width}
        height={size.height}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
        onTouchstart={handleMouseDown}
        onTouchmove={handleMouseMove}
        onTouchend={(e: any) => {
          handleMouseUp();
          handleStageTouch(e);
        }}
        ref={stageRef}
        style={{
          backgroundColor: "white",
          touchAction: "none",
        }}
      >
        {/* Separate layer for the background image */}
        <Layer>
          {!isSvg && image && (
            <KonvaImage
              image={image}
              width={imageSize.width}
              height={imageSize.height}
              x={(size.width - imageSize.width) / 2}
              y={(size.height - imageSize.height) / 2}
              listening={false}
            />
          )}
        </Layer>

        {/* Separate layer for drawings */}
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
              dash={line.tool === "brush" ? undefined : undefined}
              shadowColor={line.tool === "brush" ? line.color : undefined}
              shadowBlur={line.tool === "brush" ? 4 : 0}
              shadowOpacity={line.tool === "brush" ? 0.3 : 0}
            />
          ))}
        </Layer>
      </Stage>

      {/* Brush settings */}
      <Stack
        width="100%"
        p={"16px"}
        boxSizing={"border-box"}
        position="absolute"
        bottom={0}
      >
        {showBrushSize ? (
          <Slider
            min={1}
            max={100}
            value={brushSize}
            onChange={handleBrushSizeChange}
          />
        ) : (
          <Button
            variant="contained"
            onClick={() => setShowBrushSize(true)}
            sx={{
              borderRadius: "10px",
              backgroundColor: "#FFFAD6",
              width: "50px",
              height: "50px",
            }}
          >
            <Typography color="#000000">Line Size</Typography>
          </Button>
        )}
      </Stack>

      <Box
        ref={containerRef}
        flex={1}
        onWheel={handleWheel}
        sx={{
          touchAction: "none",
          overflow: "hidden",
        }}
      >
        <Stage
          {...stageSize}
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
          onTouchstart={handleMouseDown}
          onTouchmove={handleMouseMove}
          onTouchend={(e: any) => {
            handleMouseUp();
            handleStageTouch(e);
          }}
          ref={stageRef}
          style={{
            backgroundColor: "white",
          }}
        >
          {/* Background Image Layer */}
          <Layer>
            {image && (
              <KonvaImage
                image={image}
                width={imageSize.width}
                height={imageSize.height}
                x={(size.width / scale - imageSize.width) / 2}
                y={(size.height / scale - imageSize.height) / 2}
                listening={false}
              />
            )}
          </Layer>

          {/* Drawing Layer */}
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
                dash={line.tool === "brush" ? undefined : undefined}
                shadowColor={line.tool === "brush" ? line.color : undefined}
                shadowBlur={line.tool === "brush" ? 4 : 0}
                shadowOpacity={line.tool === "brush" ? 0.3 : 0}
              />
            ))}
          </Layer>
        </Stage>
      </Box>

      <Drawer
        anchor="bottom"
        open={showColorPicker}
        onClose={() => setShowColorPicker(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: "100%",
            borderTopLeftRadius: "16px",
            borderTopRightRadius: "16px",
          },
        }}
      >
        <Stack
          sx={{
            width: "100%",
            borderTopLeftRadius: "16px",
            borderTopRightRadius: "16px",
          }}
          direction="column"
          justifyContent="center"
          alignItems="center"
          height="100%"
          p={2}
        >
          <Typography>Color Picker</Typography>
          <Box className="color-picker" width="100%" height="100%">
            <HexColorPicker color={selectedColor} onChange={setSelectedColor} />
          </Box>
        </Stack>
      </Drawer>
    </Stack>
  );
};
