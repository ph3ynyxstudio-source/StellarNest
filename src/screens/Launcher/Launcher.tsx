import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { openUrl } from "@tauri-apps/plugin-opener";
import { UI_TERMS } from "../../theme/UI_TERMS";
import type { CanvasMode } from "../../types";
import "./Launcher.css";

type LastProject = {
  name: string;
  canvasMode: CanvasMode;
  openedAt: number;
};

type ProjectConfig = {
  name: string;
  canvasMode: CanvasMode;
};

type LauncherProps = {
  onOpenEditor: (config: ProjectConfig) => void;
};

function Launcher({ onOpenEditor }: LauncherProps) {
  const [lastProject, setLastProject] = useState<LastProject | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState(UI_TERMS.header.projectName);
  const [selectedMode, setSelectedMode] = useState<CanvasMode>("desktop");

  useEffect(() => {
    invoke<LastProject | null>("get_last_project")
      .then(setLastProject)
      .catch(() => setLastProject(null));
  }, []);

  function handleNewProject() {
    setProjectName(UI_TERMS.header.projectName);
    setSelectedMode("desktop");
    setDialogOpen(true);
  }

  async function handleConfirmCreate() {
    const name = projectName.trim() || UI_TERMS.header.projectName;

    try {
      await invoke("save_last_project", { name, canvasMode: selectedMode });
    } catch {
      // L'absence de persistance ne doit jamais bloquer l'ouverture de l'éditeur.
    }

    setDialogOpen(false);
    onOpenEditor({ name, canvasMode: selectedMode });
  }

  function handleOpenRecent() {
    if (!lastProject) return;
    onOpenEditor({ name: lastProject.name, canvasMode: lastProject.canvasMode });
  }

  function handleOpenWebsite() {
    openUrl(UI_TERMS.launcher.websiteUrl).catch(() => {});
  }

  return (
    <div className="launcher">
      <div className="launcher-panel">
        <div className="launcher-branding">
          <h1 className="launcher-title">{UI_TERMS.launcher.appName}</h1>
          <p className="launcher-tagline">{UI_TERMS.launcher.tagline}</p>
        </div>

        <div className="launcher-actions">
          <button
            type="button"
            className="launcher-action launcher-action--primary"
            onClick={handleNewProject}
          >
            {UI_TERMS.launcher.newProject}
          </button>

          {lastProject && (
            <button
              type="button"
              className="launcher-action"
              onClick={handleOpenRecent}
            >
              {UI_TERMS.launcher.recentProject} — {lastProject.name}
            </button>
          )}
        </div>

        <div className="launcher-theme-section">
          <span className="launcher-theme-title">
            {UI_TERMS.launcher.themeSectionTitle}
          </span>
          <span className="launcher-theme-badge">
            {UI_TERMS.launcher.themeSectionBadge}
          </span>
        </div>

        <div className="launcher-info">
          <div className="launcher-info-row">
            <span className="launcher-info-label">
              {UI_TERMS.launcher.designerLabel}
            </span>
            <span>{UI_TERMS.launcher.designerName}</span>
          </div>

          <div className="launcher-info-secondary">
            <button
              type="button"
              className="launcher-link"
              onClick={handleOpenWebsite}
            >
              {UI_TERMS.launcher.websiteLabel}
            </button>

            <div className="launcher-changelog">
              <span className="launcher-changelog-title">
                {UI_TERMS.launcher.changelogTitle}
              </span>
              <p className="launcher-changelog-body">
                {UI_TERMS.launcher.changelogBody}
              </p>
            </div>
          </div>
        </div>
      </div>

      {dialogOpen && (
        <div
          className="launcher-dialog-scrim"
          onClick={() => setDialogOpen(false)}
        >
          <div
            className="launcher-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="launcher-dialog-title">
              {UI_TERMS.launcher.newProjectDialogTitle}
            </h2>

            <label className="launcher-dialog-label">
              {UI_TERMS.launcher.projectNameLabel}
              <input
                type="text"
                className="launcher-dialog-input"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                autoFocus
              />
            </label>

            <div className="launcher-dialog-field">
              <span className="launcher-dialog-label">
                {UI_TERMS.launcher.canvasModeLabel}
              </span>
              <div className="canvas-mode-toggle">
                <button
                  type="button"
                  className={`canvas-mode-option${selectedMode === "mobile" ? " active" : ""}`}
                  onClick={() => setSelectedMode("mobile")}
                >
                  {UI_TERMS.launcher.canvasModeMobile}
                </button>
                <button
                  type="button"
                  className={`canvas-mode-option${selectedMode === "desktop" ? " active" : ""}`}
                  onClick={() => setSelectedMode("desktop")}
                >
                  {UI_TERMS.launcher.canvasModeDesktop}
                </button>
              </div>
            </div>

            <div className="launcher-dialog-actions">
              <button
                type="button"
                className="launcher-action"
                onClick={() => setDialogOpen(false)}
              >
                {UI_TERMS.launcher.cancel}
              </button>
              <button
                type="button"
                className="launcher-action launcher-action--primary"
                onClick={handleConfirmCreate}
              >
                {UI_TERMS.launcher.createProject}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Launcher;
