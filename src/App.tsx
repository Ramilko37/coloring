import { ColoringCanvas } from "@/components/ColoringCanvas";
import { ColorModeButton } from "@/components/ui/color-mode";

function App() {
  return (
    <div className="min-h-screen p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">AI Coloring App</h1>
        <ColorModeButton />
      </header>

      <main className="flex justify-center">
        <ColoringCanvas />
      </main>
    </div>
  );
}

export default App;
