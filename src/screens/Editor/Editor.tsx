import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentType,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { invoke } from "@tauri-apps/api/core";
import { UI_TERMS } from "../../theme/UI_TERMS";
import { designTokens } from "../../theme/design_tokens";
import {
  FRAME_WIDTHS,
  type CanvasMode,
  type CanvasElementState,
  type CanvasState,
} from "../../types";
import Card from "../../components/library/Card/Card";
import { CardSchema } from "../../components/library/Card/Card.schema";
import "./Editor.css";

const ZOOM_MIN = 0.25;
const ZOOM_MAX = 1;

function clampZoom(value: number) {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, value));
}

const DEFAULT_ELEMENT_WIDTH = 220;
const DEFAULT_ELEMENT_HEIGHT = 120;
const ELEMENT_MIN_WIDTH = 120;
const ELEMENT_MIN_HEIGHT = 60;
const ADD_OFFSET = 24;

type EditorProps = {
  projectName: string;
  canvasMode: CanvasMode;
};

type DragState =
  | {
      type: "move";
      id: string;
      startX: number;
      startY: number;
      originX: number;
      originY: number;
    }
  | {
      type: "resize";
      id: string;
      startX: number;
      startY: number;
      originWidth: number;
      originHeight: number;
    };

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="style-field">
      <span className="style-field-label">{label}</span>
      <label className="color-swatch-control">
        <span className="color-swatch" style={{ backgroundColor: value }} />
        <span className="color-swatch-hex">{value}</span>
        <input
          type="color"
          className="color-swatch-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </label>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="style-field">
      <span className="style-field-label">{label}</span>
      <input
        type="number"
        className="style-number-input"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="style-field">
      <span className="style-field-label">{label}</span>
      <input
        type="text"
        className="style-text-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Editor({ projectName, canvasMode }: EditorProps) {
  const [availableWidth, setAvailableWidth] = useState(0);
  const [manualZoom, setManualZoom] = useState<number | null>(null);
  const [zoomOverlayOpen, setZoomOverlayOpen] = useState(false);
  const [elements, setElements] = useState<CanvasElementState[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [canvasBackgroundColor, setCanvasBackgroundColor] = useState(
    designTokens.colors.bgCard,
  );
  const [exportStatus, setExportStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [previewMode, setPreviewMode] = useState(false);
  const [previewAvailable, setPreviewAvailable] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [PreviewComponent, setPreviewComponent] =
    useState<ComponentType | null>(null);
  const canvasZoneRef = useRef<HTMLDivElement>(null);
  const zoomControlRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<DragState | null>(null);
  const zoomRef = useRef(1);
  const canvasBackgroundColorRef = useRef(canvasBackgroundColor);
  canvasBackgroundColorRef.current = canvasBackgroundColor;

  useLayoutEffect(() => {
    const node = canvasZoneRef.current;
    if (!node) return;

    setAvailableWidth(node.clientWidth);

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setAvailableWidth(entry.contentRect.width);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!zoomOverlayOpen) return;

    function handleOutsideClick(event: MouseEvent) {
      if (
        zoomControlRef.current &&
        !zoomControlRef.current.contains(event.target as Node)
      ) {
        setZoomOverlayOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [zoomOverlayOpen]);

  useEffect(() => {
    invoke<CanvasState>("get_canvas_state")
      .then((state) => {
        setElements(state.elements ?? []);
        if (state.canvasBackgroundColor) {
          setCanvasBackgroundColor(state.canvasBackgroundColor);
        }
      })
      .catch(() => setElements([]));

    invoke<boolean>("export_exists")
      .then(setPreviewAvailable)
      .catch(() => setPreviewAvailable(false));
  }, []);

  const autoZoom =
    availableWidth > 0
      ? clampZoom(availableWidth / FRAME_WIDTHS[canvasMode])
      : ZOOM_MAX;

  const zoom = manualZoom !== null ? manualZoom : autoZoom;
  zoomRef.current = zoom;
  const zoomPercent = Math.round(zoom * 100);

  function persistCanvas(
    nextElements: CanvasElementState[],
    nextColor: string,
  ) {
    invoke("save_canvas_state", {
      state: {
        projectId: projectName,
        canvasBackgroundColor: nextColor,
        elements: nextElements,
      } satisfies CanvasState,
    }).catch(() => {});
  }

  function handleCanvasBackgroundColorChange(nextColor: string) {
    setCanvasBackgroundColor(nextColor);
    persistCanvas(elements, nextColor);
  }

  function updateSelectedElement(patch: Partial<CanvasElementState>) {
    if (!selectedId) return;
    setElements((prev) => {
      const next = prev.map((el) =>
        el.id === selectedId ? { ...el, ...patch } : el,
      );
      persistCanvas(next, canvasBackgroundColorRef.current);
      return next;
    });
  }

  function clampToFrame(el: CanvasElementState): CanvasElementState {
    const maxX = Math.max(0, FRAME_WIDTHS[canvasMode] - el.width);
    return {
      ...el,
      x: Math.min(Math.max(0, el.x), maxX),
      y: Math.max(0, el.y),
    };
  }

  function handleAddCard() {
    const last = elements[elements.length - 1];
    const maxX = Math.max(0, FRAME_WIDTHS[canvasMode] - DEFAULT_ELEMENT_WIDTH);
    const x = last ? Math.min(last.x + ADD_OFFSET, maxX) : ADD_OFFSET;
    const y = last ? last.y + ADD_OFFSET : ADD_OFFSET;

    const newElement: CanvasElementState = {
      id: crypto.randomUUID(),
      componentRef: CardSchema.name,
      sourceLocation: "src/components/library/Card/Card.tsx",
      x: Math.max(0, x),
      y: Math.max(0, y),
      width: DEFAULT_ELEMENT_WIDTH,
      height: DEFAULT_ELEMENT_HEIGHT,
      title: CardSchema.props.title.default,
      content: CardSchema.props.content.default,
      backgroundColor: CardSchema.props.backgroundColor.default,
      borderColor: CardSchema.props.borderColor.default,
      borderWidth: CardSchema.props.borderWidth.default,
      borderRadius: CardSchema.props.borderRadius.default,
    };

    const next = [...elements, newElement];
    setElements(next);
    setSelectedId(newElement.id);
    persistCanvas(next, canvasBackgroundColorRef.current);
  }

  useEffect(() => {
    function handleMouseMove(event: MouseEvent) {
      const drag = dragStateRef.current;
      if (!drag) return;

      const z = zoomRef.current || 1;
      const deltaX = (event.clientX - drag.startX) / z;
      const deltaY = (event.clientY - drag.startY) / z;

      setElements((prev) =>
        prev.map((el) => {
          if (el.id !== drag.id) return el;

          if (drag.type === "move") {
            return clampToFrame({
              ...el,
              x: drag.originX + deltaX,
              y: drag.originY + deltaY,
            });
          }

          const maxWidth = Math.max(
            ELEMENT_MIN_WIDTH,
            FRAME_WIDTHS[canvasMode] - el.x,
          );
          return {
            ...el,
            width: Math.min(
              maxWidth,
              Math.max(ELEMENT_MIN_WIDTH, drag.originWidth + deltaX),
            ),
            height: Math.max(ELEMENT_MIN_HEIGHT, drag.originHeight + deltaY),
          };
        }),
      );
    }

    function handleMouseUp() {
      if (!dragStateRef.current) return;
      dragStateRef.current = null;
      setElements((current) => {
        persistCanvas(current, canvasBackgroundColorRef.current);
        return current;
      });
    }

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasMode]);

  function handleElementMouseDown(
    event: ReactMouseEvent,
    el: CanvasElementState,
  ) {
    event.stopPropagation();
    setSelectedId(el.id);
    dragStateRef.current = {
      type: "move",
      id: el.id,
      startX: event.clientX,
      startY: event.clientY,
      originX: el.x,
      originY: el.y,
    };
  }

  function handleResizeMouseDown(
    event: ReactMouseEvent,
    el: CanvasElementState,
  ) {
    event.stopPropagation();
    setSelectedId(el.id);
    dragStateRef.current = {
      type: "resize",
      id: el.id,
      startX: event.clientX,
      startY: event.clientY,
      originWidth: el.width,
      originHeight: el.height,
    };
  }

  function handleCanvasBackgroundMouseDown(event: ReactMouseEvent) {
    if (event.target === event.currentTarget) setSelectedId(null);
  }

  function handleDeleteSelected() {
    if (!selectedId) return;
    const next = elements.filter((el) => el.id !== selectedId);
    setElements(next);
    setSelectedId(null);
    persistCanvas(next, canvasBackgroundColorRef.current);
  }

  async function handleExport() {
    try {
      await invoke("export_project");
      setExportStatus("success");
      setPreviewAvailable(true);
    } catch {
      setExportStatus("error");
    }
    setTimeout(() => setExportStatus("idle"), 2500);
  }

  async function handleTogglePreview() {
    if (previewMode) {
      setPreviewMode(false);
      return;
    }

    const available = await invoke<boolean>("export_exists").catch(
      () => false,
    );
    setPreviewAvailable(available);

    if (!available) {
      setPreviewError(true);
      setPreviewMode(true);
      return;
    }

    try {
      const mod = await import("../Export/GeneratedPage");
      setPreviewComponent(() => mod.default);
      setPreviewError(false);
    } catch {
      setPreviewError(true);
    }
    setPreviewMode(true);
  }

  const selectedElement =
    elements.find((el) => el.id === selectedId) ?? null;

  return (
    <div className="editor-shell">
      <header className="editor-header">
        <span className="project-name">{projectName}</span>
        <span className="status-badge">{UI_TERMS.header.status}</span>

        <div className="zoom-control" ref={zoomControlRef}>
          <button
            type="button"
            className="zoom-indicator"
            onClick={() => setZoomOverlayOpen((open) => !open)}
          >
            {zoomPercent}%
          </button>

          {zoomOverlayOpen && (
            <div className="zoom-overlay">
              <input
                type="range"
                className="zoom-slider"
                min={ZOOM_MIN * 100}
                max={ZOOM_MAX * 100}
                value={zoomPercent}
                onChange={(e) =>
                  setManualZoom(clampZoom(Number(e.target.value) / 100))
                }
              />
              <div className="zoom-overlay-footer">
                <span className="zoom-overlay-value">{zoomPercent}%</span>
                {manualZoom !== null && (
                  <button
                    type="button"
                    className="zoom-reset"
                    onClick={() => setManualZoom(null)}
                  >
                    {UI_TERMS.header.zoomReset}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <button
          className={`export-button${exportStatus !== "idle" ? ` export-button--${exportStatus}` : ""}`}
          type="button"
          onClick={handleExport}
        >
          {exportStatus === "success"
            ? UI_TERMS.header.exportSuccess
            : exportStatus === "error"
              ? UI_TERMS.header.exportError
              : UI_TERMS.header.exportButton}
        </button>

        <button
          type="button"
          className={`preview-button${previewMode ? " preview-button--active" : ""}${!previewAvailable && !previewMode ? " preview-button--muted" : ""}`}
          onClick={handleTogglePreview}
        >
          {previewMode
            ? UI_TERMS.header.backToEdit
            : UI_TERMS.header.previewButton}
        </button>
      </header>

      {previewMode ? (
        <div className="preview-mode">
          <div className="preview-frame">
            {!previewError && PreviewComponent ? (
              <div className="preview-zoom-wrapper" style={{ zoom }}>
                <PreviewComponent />
              </div>
            ) : (
              <div className="preview-empty">
                {UI_TERMS.header.previewUnavailable}
              </div>
            )}
          </div>
        </div>
      ) : (
      <div className="main-content">
        <aside className="library-panel">
          <div className="library-panel-title">{UI_TERMS.panels.library}</div>
          <div className="library-item">
            <button
              type="button"
              className="library-item-preview"
              onClick={handleAddCard}
              aria-label={UI_TERMS.library.cardLabel}
            >
              +
            </button>
            <span className="library-item-name">
              {UI_TERMS.library.cardLabel}
            </span>
          </div>
        </aside>

        <section
          className="canvas-zone"
          ref={canvasZoneRef}
          onMouseDown={handleCanvasBackgroundMouseDown}
        >
          <div
            className={`canvas-frame canvas-frame--${canvasMode}`}
            style={{ zoom, backgroundColor: canvasBackgroundColor }}
            onMouseDown={handleCanvasBackgroundMouseDown}
          >
            {elements.map((el) => (
              <div
                key={el.id}
                className="canvas-element"
                style={{
                  left: el.x,
                  top: el.y,
                  width: el.width,
                  height: el.height,
                }}
                onMouseDown={(e) => handleElementMouseDown(e, el)}
              >
                <Card
                  title={el.title}
                  content={el.content}
                  backgroundColor={el.backgroundColor}
                  borderColor={el.borderColor}
                  borderWidth={el.borderWidth}
                  borderRadius={el.borderRadius}
                  active={selectedId === el.id}
                />
                {selectedId === el.id && (
                  <div
                    className="canvas-element-resize-handle"
                    onMouseDown={(e) => handleResizeMouseDown(e, el)}
                  />
                )}
              </div>
            ))}
          </div>
        </section>

        <aside className="style-panel">
          <div className="style-panel-title">{UI_TERMS.panels.style}</div>

          {selectedElement ? (
            <div className="style-field-group">
              <TextField
                label={CardSchema.props.title.label}
                value={selectedElement.title}
                onChange={(value) => updateSelectedElement({ title: value })}
              />
              <TextField
                label={CardSchema.props.content.label}
                value={selectedElement.content}
                onChange={(value) =>
                  updateSelectedElement({ content: value })
                }
              />
              <ColorField
                label={CardSchema.props.backgroundColor.label}
                value={selectedElement.backgroundColor}
                onChange={(value) =>
                  updateSelectedElement({ backgroundColor: value })
                }
              />
              <ColorField
                label={CardSchema.props.borderColor.label}
                value={selectedElement.borderColor}
                onChange={(value) =>
                  updateSelectedElement({ borderColor: value })
                }
              />
              <NumberField
                label={CardSchema.props.borderWidth.label}
                value={selectedElement.borderWidth}
                onChange={(value) =>
                  updateSelectedElement({ borderWidth: value })
                }
              />
              <NumberField
                label={CardSchema.props.borderRadius.label}
                value={selectedElement.borderRadius}
                onChange={(value) =>
                  updateSelectedElement({ borderRadius: value })
                }
              />

              <button
                type="button"
                className="style-delete-button"
                onClick={handleDeleteSelected}
              >
                {UI_TERMS.stylePanel.deleteElement}
              </button>
            </div>
          ) : (
            <ColorField
              label={UI_TERMS.stylePanel.canvasBackgroundLabel}
              value={canvasBackgroundColor}
              onChange={handleCanvasBackgroundColorChange}
            />
          )}
        </aside>
        <aside className="layers-panel">{UI_TERMS.panels.layers}</aside>
      </div>
      )}
    </div>
  );
}

export default Editor;
