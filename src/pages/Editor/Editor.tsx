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
import {
  FaArrowsAlt,
  FaBrush,
  FaEraser,
  FaPen,
  FaRedo,
  FaUndo,
} from "react-icons/fa";
import { Line } from "react-konva";
import useImage from "use-image";
import { DrawStage } from "./DrawStage";
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

interface startRefInterface {
  x: number;
  y: number;
  distance: number | null;
  lastCenter: { x: number; y: number } | null;
}

const navBarColorsArray = [
  "#FF0000", // Red
  "#FF7F00", // Orange
  "#FFFF00", // Yellow
  "#00FF00", // Green
  "#0000FF", // Blue
  "#4B0082", // Indigo
  "#9400D3", // Violet
];

export const Editor = ({ isSvg = false }: EditorProps) => {
  const [lines, setLines] = useState<Line[]>([]);
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [tool, setTool] = useState<"brush" | "pen" | "eraser">("pen");
  const [showToolSize, setShowToolSize] = useState(false);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [toolSize, setToolSize] = useState(5);
  const containerRef = useRef<HTMLDivElement>(null);
  const [image] = useImage(mockImage);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [hasUnclosedPaths, setHasUnclosedPaths] = useState(false);
  const [scale, setScale] = useState(1);
  const [showActionFeedback, setShowActionFeedback] = useState<
    "Undo" | "Redo" | null
  >(null);
  const [redoStack, setRedoStack] = useState<Line[]>([]);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [mode, setMode] = useState<"draw" | "move">("draw");
  const [navbarColor] = useState(
    () =>
      navBarColorsArray[Math.floor(Math.random() * navBarColorsArray.length)],
  );

  const touchStartRef = useRef<startRefInterface>({
    x: 0,
    y: 0,
    distance: null,
    lastCenter: null,
  });

  const controlButtons = [
    {
      label: "Brush",
      icon: <FaBrush />,
      handler: () => {
        setTool("brush");
        setToolSize(20);
      },
      isActive: tool === "brush",
    },
    {
      label: "Pen",
      icon: <FaPen />,
      handler: () => {
        setTool("pen");
        setToolSize(5);
      },
      isActive: tool === "pen",
    },
    {
      label: "Undo",
      icon: <FaUndo />,
      handler: () => {
        handleUndo();
      },
      isActive: false,
    },
    {
      label: "Redo",
      icon: <FaRedo />,
      handler: () => {
        handleRedo();
      },
      isActive: false,
    },
    {
      label: "Eraser",
      icon: <FaEraser />,
      handler: () => {
        setTool("eraser");
        setToolSize(20);
      },
      isActive: tool === "eraser",
    },
    {
      label: "Active Color",
      icon: <ActiveColorIcon fill={selectedColor} />,
      handler: () => setShowColorPicker(true),
    },
    {
      label: mode === "draw" ? "Move" : "Draw",
      icon: mode === "draw" ? <FaArrowsAlt /> : <FaPen />,
      handler: () => setMode(mode === "draw" ? "move" : "draw"),
      isActive: false,
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

  const handleToolSizeChange = (e: any) => {
    setToolSize(e.target.value);
  };

  // Touch handlers for SVG zoom
  const getTouchDistance = (touch1: Touch, touch2: Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getCenter = (touches: TouchList) => ({
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2,
  });

  const handleTouchStart = (e: TouchEvent) => {
    if (mode !== "move") return;

    if (e.touches.length === 2) {
      e.preventDefault();
      const distance = getTouchDistance(e.touches[0], e.touches[1]);
      const center = getCenter(e.touches);
      touchStartRef.current = {
        x: center.x,
        y: center.y,
        distance,
        lastCenter: center,
      };
    } else if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        distance: null,
        lastCenter: null,
      };
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (mode !== "move") return;

    if (e.touches.length === 2 && touchStartRef.current.distance !== null) {
      e.preventDefault();
      const newDistance = getTouchDistance(e.touches[0], e.touches[1]);
      const center = getCenter(e.touches);

      // Handle zoom
      const delta = newDistance / touchStartRef.current.distance;
      setScale((prevScale) => {
        const newScale = prevScale * delta;
        return Math.min(Math.max(newScale, 0.5), 3);
      });

      // Handle pan with two fingers
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
    } else if (e.touches.length === 1) {
      // Handle pan with one finger
      const deltaX = e.touches[0].clientX - touchStartRef.current.x;
      const deltaY = e.touches[0].clientY - touchStartRef.current.y;

      setPosition((prev) => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));

      touchStartRef.current.x = e.touches[0].clientX;
      touchStartRef.current.y = e.touches[0].clientY;
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

  const handleUndo = () => {
    if (lines.length === 0) return;
    const lastLine = lines[lines.length - 1];
    setRedoStack((prev) => [...prev, lastLine]);
    setLines((prev) => prev.slice(0, -1));
    setShowActionFeedback("Undo");
    setTimeout(() => setShowActionFeedback(null), 500);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const lineToRedo = redoStack[redoStack.length - 1];
    setLines((prev) => [...prev, lineToRedo]);
    setRedoStack((prev) => prev.slice(0, -1));
    setShowActionFeedback("Redo");
    setTimeout(() => setShowActionFeedback(null), 500);
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
      <Fade in={!!showActionFeedback}>
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
          {showActionFeedback}
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
        bgcolor={navbarColor}
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

      <DrawStage
        image={image}
        imageSize={imageSize}
        size={size}
        lines={lines}
        setLines={setLines}
        selectedColor={selectedColor}
        tool={tool}
        brushSize={toolSize}
        mode={mode}
      />

      {/* Brush settings */}
      <Stack
        width="100%"
        p={"16px"}
        boxSizing={"border-box"}
        position="absolute"
        bottom={0}
      >
        {showToolSize ? (
          <Slider
            min={1}
            max={100}
            value={toolSize}
            onChange={handleToolSizeChange}
          />
        ) : (
          <Button
            variant="contained"
            onClick={() => setShowToolSize(true)}
            sx={{
              borderRadius: "10px",
              backgroundColor: "#FFFAD6",
              width: "50px",
              height: "50px",
            }}
          >
            <Typography color="#000000">Tool Size</Typography>
          </Button>
        )}
      </Stack>

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
