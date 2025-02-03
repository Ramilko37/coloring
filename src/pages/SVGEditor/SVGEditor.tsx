import { ActiveColorIcon } from "@/assets/icons";
import sampleSVG from "@/assets/images/flower.svg";
import { checkSVGPaths, optimizeSVG } from "@/utils/svgUtils";
import { Box, Drawer, IconButton, Stack, Typography } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { AiOutlineZoomIn, AiOutlineZoomOut } from "react-icons/ai";

export const SVGEditor = () => {
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [hasUnclosedPaths, setHasUnclosedPaths] = useState(false);
  const [scale, setScale] = useState(1);
  const touchStartRef = useRef<{
    x: number;
    y: number;
    distance: number | null;
  }>({
    x: 0,
    y: 0,
    distance: null,
  });

  // Calculate distance between two touch points
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
        return Math.min(Math.max(newScale, 0.5), 3); // Limit scale between 0.5 and 3
      });

      touchStartRef.current.distance = newDistance;
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current.distance = null;
  };

  useEffect(() => {
    const svgContainer = document.getElementById("svg-container");
    if (svgContainer) {
      svgContainer.addEventListener("touchstart", handleTouchStart, {
        passive: false,
      });
      svgContainer.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      svgContainer.addEventListener("touchend", handleTouchEnd);

      return () => {
        svgContainer.removeEventListener("touchstart", handleTouchStart);
        svgContainer.removeEventListener("touchmove", handleTouchMove);
        svgContainer.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, []);

  // Load and parse SVG content
  useEffect(() => {
    const loadSVG = async () => {
      try {
        const response = await fetch(sampleSVG);
        const text = await response.text();
        const optimizedSVG = optimizeSVG(text);

        // Check if all paths are closed
        const hasUnclosedPaths = checkSVGPaths(optimizedSVG);
        setHasUnclosedPaths(!hasUnclosedPaths);

        setSvgContent(optimizedSVG);
      } catch (error) {
        console.error("Error loading SVG:", error);
      }
    };

    loadSVG();
  }, []);

  // Handle element click for coloring
  const handleElementClick = (event: React.MouseEvent<SVGElement>) => {
    const target = event.target as SVGElement;
    if (
      target.tagName === "path" ||
      target.tagName === "circle" ||
      target.tagName === "rect"
    ) {
      target.setAttribute("fill", selectedColor);
    }
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.1, 3)); // Max zoom 3x
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.1, 0.5)); // Min zoom 0.5x
  };

  const EditorButtonsData = useMemo(
    () => [
      {
        label: "Zoom In",
        icon: <AiOutlineZoomIn size={24} />,
        handler: handleZoomIn,
      },
      {
        label: "Zoom Out",
        icon: <AiOutlineZoomOut size={24} />,
        handler: handleZoomOut,
      },
      {
        label: "Active Color",
        icon: <ActiveColorIcon fill={selectedColor} />,
        handler: () => setShowColorPicker(true),
      },
    ],
    [selectedColor],
  );

  return (
    <Stack
      height="100%"
      width="100%"
      position="relative"
      sx={{
        bgcolor: "background.default",
      }}
    >
      {hasUnclosedPaths && (
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

      {/* Top toolbar */}
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

      {/* SVG Container */}
      <Box
        id="svg-container"
        flex={1}
        display="flex"
        justifyContent="center"
        alignItems="center"
        p={2}
        sx={{
          backgroundColor: "grey.100",
          overflow: "hidden",
          touchAction: "none", // Important for handling touch events
        }}
      >
        {svgContent && (
          <div
            onClick={(e: any) => handleElementClick(e)}
            dangerouslySetInnerHTML={{
              __html: svgContent,
            }}
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              transform: `scale(${scale})`,
              transition: "transform 0.1s ease-out", // Shorter transition for smoother pinch
            }}
          />
        )}
      </Box>

      {/* Color Picker Drawer */}
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
