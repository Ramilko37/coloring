import { ActiveColorIcon, TapIcon } from "@/assets/icons";
import { DownloadIcon } from "@/assets/icons/download-icon";
import { EraserIcon } from "@/assets/icons/eraser-icon";
import { LockIconClosed } from "@/assets/icons/lock-icon";
import { ToolsIcon } from "@/assets/icons/tools-icon";
import mockImage from "@/assets/images/unicorn.avif";
import { useAppDispatch } from "@/store";
import { setPainting } from "@/store/slices/editorSlice";
import {
  Box,
  Button,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Image as KonvaImage, Layer, Line, Stage } from "react-konva";
import useImage from "use-image";
import "./styles.css";

interface Line {
  points: number[];
  color: string;
  tool: string;
}

export const Editor = () => {
  const dispatch = useAppDispatch();
  const stageRef = useRef<any>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [tool, setTool] = useState("brush");
  const [size, setSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [image] = useImage(mockImage);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  const EditorButtonsData = useMemo(
    () => [
      {
        label: "Download",
        icon: <DownloadIcon />,
      },
      {
        label: "Lock",
        icon: <LockIconClosed />,
      },
      {
        label: "Tap",
        icon: <TapIcon />,
      },
      {
        label: "Tools",
        icon: <ToolsIcon />,
      },
      {
        label: "Eraser",
        icon: <EraserIcon />,
      },
      {
        label: "Active Color",
        icon: <ActiveColorIcon fill={selectedColor} />,
      },
    ],
    [selectedColor],
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
      { points: [pos.x, pos.y], color: selectedColor, tool },
    ]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    const lastLine = lines[lines.length - 1];

    // Add point to line
    lastLine.points = lastLine.points.concat([point.x, point.y]);

    // Replace last line
    lines.splice(lines.length - 1, 1, lastLine);
    setLines([...lines]);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleUndo = () => {
    setLines(lines.slice(0, -1));
  };

  const saveCanvasState = () => {
    if (!stageRef.current) return;
    const uri = stageRef.current.toDataURL();
    dispatch(setPainting(uri));
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
          >
            {button.icon}
          </IconButton>
        ))}
      </Stack>
      <Stage
        width={size.width}
        height={size.height - 100}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
        onTouchstart={handleMouseDown}
        onTouchmove={handleMouseMove}
        onTouchend={handleMouseUp}
        ref={stageRef}
        style={{ backgroundColor: "white" }}
      >
        <Layer>
          {image && (
            <KonvaImage
              image={image}
              width={imageSize.width}
              height={imageSize.height}
              x={(size.width - imageSize.width) / 2} // Center horizontally
              y={(size.height - imageSize.height) / 2} // Center vertically
              listening={false}
            />
          )}
          {/* Drawing Lines */}
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke={line.color}
              strokeWidth={5}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={
                tool === "eraser" ? "destination-out" : "source-over"
              }
            />
          ))}
        </Layer>
      </Stage>

      {/* Controls */}
      <Stack direction="row" spacing={2} mt={2}>
        <Button
          variant="contained"
          onClick={() => setShowColorPicker(!showColorPicker)}
        >
          Color
        </Button>
        <Button variant="contained" onClick={handleUndo}>
          Undo
        </Button>
        <Button variant="contained" onClick={saveCanvasState}>
          Save
        </Button>
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
