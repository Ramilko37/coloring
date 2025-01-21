import Button from "@mui/material/Button";

interface ColorPaletteProps {
  baseColor: string;
  onColorSelect: (color: string) => void;
}

export function ColorPalette({ baseColor, onColorSelect }: ColorPaletteProps) {
  // Generate harmonious colors based on the base color
  const generateHarmoniousColors = (base: string): string[] => {
    const hsl = hexToHSL(base);
    return [
      // Original color
      base,
      // Analogous colors
      hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l),
      hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l),
      // Complementary with different lightness
      hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l * 0.8),
      hslToHex((hsl.h + 180) % 360, hsl.s * 0.7, hsl.l * 1.2),
    ];
  };

  const colors = generateHarmoniousColors(baseColor);

  return (
    <div className="Box gap-2">
      {colors.map((color, index) => (
        <Button
          key={index}
          onClick={() => onColorSelect(color)}
          className="w-8 h-8 p-0 border-2"
          style={{
            backgroundColor: color,
            borderColor: adjustBorderColor(color),
          }}
        />
      ))}
    </div>
  );
}

// Helper functions for color conversion
function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 0, l: 0 };

  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s, l };
}

function hslToHex(h: number, s: number, l: number): string {
  l = Math.min(Math.max(l, 0), 1);
  s = Math.min(Math.max(s, 0), 1);

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  const toHex = (n: number) => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function adjustBorderColor(color: string): string {
  const hsl = hexToHSL(color);
  // Make border darker for light colors, lighter for dark colors
  const newL = hsl.l < 0.5 ? hsl.l + 0.2 : hsl.l - 0.2;
  return hslToHex(hsl.h, hsl.s, newL);
}
