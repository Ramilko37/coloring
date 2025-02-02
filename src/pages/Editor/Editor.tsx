import { ActiveColorIcon } from "@/assets/icons";

import mockImage from "@/assets/images/unicorn.avif";
import {
  Box,
  Button,
  Drawer,
  IconButton,
  Slider,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
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

export const Editor = () => {
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

  const EditorButtonsData = useMemo(
    () => [
      // {
      //   label: "Download",
      //   icon: <DownloadIcon />,
      // },
      // {
      //   label: "Lock",
      //   icon: <LockIconClosed />,
      // },
      // {
      //   label: "Tap",
      //   icon: <TapIcon />,
      // },
      // {
      //   label: "Tools",
      //   icon: <ToolsIcon />,
      // },
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
        handler: () => {
          if (tool === "eraser") {
            setTool("brush");
            setBrushSize(5);
          }
          setShowColorPicker(true);
        },
      },
    ],
    [tool, selectedColor],
  );

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

  // Calculate image dimensions to fit container
  useEffect(() => {
    if (image && size.width && size.height) {
      const aspectRatio = image.width / image.height;
      let newWidth = size.width;
      let newHeight = size.width / aspectRatio;

      if (newHeight > size.height) {
        newHeight = size.height;
        newWidth = size.height * aspectRatio;
      }

      setImageSize({
        width: newWidth,
        height: newHeight,
      });
    }
  }, [image, size]);

  const handleMouseDown = (e: any) => {
    setIsDrawing(true);
    const pos = e.target.getStage().getPointerPosition();
    setLines([
      ...lines,
      {
        points: [pos.x, pos.y],
        color: selectedColor,
        tool,
        brushSize: brushSize, // Store current brush size with the line
      },
    ]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    const lastLine = lines[lines.length - 1];

    // Add point to line while maintaining its original properties
    lastLine.points = lastLine.points.concat([point.x, point.y]);

    // Replace last line
    lines.splice(lines.length - 1, 1, lastLine);
    setLines([...lines]);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleBrushSizeChange = (e: any) => {
    setBrushSize(e.target.value);
  };

  return (
    <Stack ref={containerRef} height="100%" width="100%" position="relative">
      <Stack
        bgcolor={"#FEE034"}
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        p={"16px"}
      >
        {EditorButtonsData.map((button) => (
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
        height={size.height - 150}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
        onTouchstart={handleMouseDown}
        onTouchmove={handleMouseMove}
        onTouchend={handleMouseUp}
        ref={stageRef}
        style={{ backgroundColor: "white" }}
      >
        {/* Separate layer for the background image */}
        <Layer>
          {image && (
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
              points={line.points}
              stroke={line.color}
              strokeWidth={line.brushSize}
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

      {/* Color Picker */}

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
