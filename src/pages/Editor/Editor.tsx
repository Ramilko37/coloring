import { ColorPalette } from "@/components/ColorPalette";
import { useAppDispatch } from "@/store";
import { setPainting } from "@/store/slices/editorSlice";
import { Box, Button, Stack } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import CanvasDraw from "react-canvas-draw";

interface DrawState {
  selectedColor: string;
  brushSize: number;
  currentTool: string;
  imageUrl: string;
  drawPath: string[];
}

export function Editor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dispatch = useAppDispatch();
  const [currentDrawState, setCurrentDrawState] = useState<DrawState>({
    selectedColor: "",
    brushSize: 10,
    currentTool: "",
    imageUrl: "",
    drawPath: [],
  });
  const [canvasHeight, setCanvasHeight] = useState<number>(0);

  const handleColorSelect = (color: string) => {
    setCurrentDrawState({ ...currentDrawState, selectedColor: color });
  };

  const handleUndo = () => {
    setCurrentDrawState({
      ...currentDrawState,
      drawPath: [...currentDrawState.drawPath.slice(0, -1)],
    });
  };

  const handleRedo = () => {
    setCurrentDrawState({
      ...currentDrawState,
      drawPath: [...currentDrawState.drawPath, ...currentDrawState.drawPath],
    });
  };

  const saveCanvasState = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL();
    dispatch(setPainting(dataUrl));
  };

  useEffect(() => {
    setTimeout(() => {
      setCanvasHeight(window.innerHeight - 100);
    }, 100);
  }, []);

  return (
    <Stack bgcolor="beige" height="100%" p="24px" border="1px solid red">
      <CanvasDraw
        brushColor={currentDrawState.selectedColor}
        brushRadius={currentDrawState.brushSize}
        hideGrid={true}
        hideInterface={true}
        style={{ width: "100%", height: "80dvh" }}
        imgSrc={currentDrawState.imageUrl}
        onChange={saveCanvasState}
      />
      <Stack border="1px solid red" direction="column" gap={2}>
        <ColorPalette
          baseColor={currentDrawState.selectedColor}
          onColorSelect={handleColorSelect}
        />
        <Box gap={2}>
          <Button onClick={handleUndo}>Undo</Button>
          <Button onClick={handleRedo}>Redo</Button>
          <Button onClick={saveCanvasState}>Save State</Button>
        </Box>
      </Stack>
    </Stack>
  );
}
