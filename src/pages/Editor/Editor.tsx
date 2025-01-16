import { ColorPalette } from "@/components/ColorPalette";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/store";
import { setPainting } from "@/store/slices/editorSlice";
import { Flex } from "@chakra-ui/react";
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
    <Flex direction="column" gap={4} w="100%" h="100%" bgColor={"beige"}>
      <CanvasDraw
        brushColor={currentDrawState.selectedColor}
        brushRadius={currentDrawState.brushSize}
        hideGrid={true}
        hideInterface={true}
        canvasWidth={500}
        style={{ height: "90dvh" }}
        imgSrc={currentDrawState.imageUrl}
        onChange={saveCanvasState}
      />
      <Flex direction={"column"} gap={2}>
        <ColorPalette
          baseColor={currentDrawState.selectedColor}
          onColorSelect={handleColorSelect}
        />
        <Flex gap={2}>
          <Button onClick={handleUndo}>Undo</Button>
          <Button onClick={handleRedo}>Redo</Button>
          <Button onClick={saveCanvasState}>Save State</Button>
        </Flex>
      </Flex>
    </Flex>
  );
}
