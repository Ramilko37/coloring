export const optimizeSVG = (svgString: string): string => {
  // Add fill="white" and stroke="black" to elements that don't have them
  return svgString.replace(
    /<(path|circle|rect)([^>]*)>/g,
    (_, tag, attributes) => {
      if (!attributes.includes("fill=")) {
        attributes += ' fill="white"';
      }
      if (!attributes.includes("stroke=")) {
        attributes += ' stroke="black"';
      }
      return `<${tag}${attributes}>`;
    },
  );
};

export const loadSVG = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    const svgText = await response.text();
    return optimizeSVG(svgText);
  } catch (error) {
    console.error("Error loading SVG:", error);
    return "";
  }
};

interface PathCommand {
  type: string;
  x?: number;
  y?: number;
}

export const isPathClosed = (d: string): boolean => {
  // If path ends with 'z' or 'Z', it's explicitly closed
  if (d.trim().match(/[zZ]$/)) return true;

  // Parse path commands to check if first and last points match
  const commands = parsePath(d);
  if (commands.length < 2) return false;

  const firstCommand = commands[0];
  const lastCommand = commands[commands.length - 1];

  // Check if last point matches first point
  return firstCommand.x === lastCommand.x && firstCommand.y === lastCommand.y;
};

const parsePath = (d: string): PathCommand[] => {
  const commands: PathCommand[] = [];
  let currentX = 0;
  let currentY = 0;

  // Split path into commands
  const parts = d.match(/[a-zA-Z][^a-zA-Z]*/g) || [];

  parts.forEach((part) => {
    const command = part[0];
    const numbers = part
      .slice(1)
      .trim()
      .split(/[\s,]+/)
      .map(Number);

    switch (command.toUpperCase()) {
      case "M": // Move to
        currentX = numbers[0];
        currentY = numbers[1];
        commands.push({ type: command, x: currentX, y: currentY });
        break;
      case "L": // Line to
        currentX = numbers[0];
        currentY = numbers[1];
        commands.push({ type: command, x: currentX, y: currentY });
        break;
      case "H": // Horizontal line
        currentX = numbers[0];
        commands.push({ type: command, x: currentX, y: currentY });
        break;
      case "V": // Vertical line
        currentY = numbers[0];
        commands.push({ type: command, x: currentX, y: currentY });
        break;
      // Add more cases for other path commands as needed
    }
  });

  return commands;
};

export const checkSVGPaths = (svgString: string): boolean => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");
  const paths = doc.querySelectorAll("path");

  let allPathsClosed = true;
  paths.forEach((path) => {
    const d = path.getAttribute("d");
    if (d && !isPathClosed(d)) {
      allPathsClosed = false;
      console.warn("Found unclosed path:", d);
    }
  });

  return allPathsClosed;
};
