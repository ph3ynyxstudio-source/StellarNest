import { useState } from "react";
import Launcher from "./screens/Launcher/Launcher";
import Editor from "./screens/Editor/Editor";
import type { CanvasMode } from "./types";
import "./App.css";

type Screen = "launcher" | "editor";

type ProjectConfig = {
  name: string;
  canvasMode: CanvasMode;
};

function App() {
  const [screen, setScreen] = useState<Screen>("launcher");
  const [projectConfig, setProjectConfig] = useState<ProjectConfig | null>(
    null,
  );

  function handleOpenEditor(config: ProjectConfig) {
    setProjectConfig(config);
    setScreen("editor");
  }

  if (screen === "launcher" || !projectConfig) {
    return <Launcher onOpenEditor={handleOpenEditor} />;
  }

  return (
    <Editor
      projectName={projectConfig.name}
      canvasMode={projectConfig.canvasMode}
    />
  );
}

export default App;
