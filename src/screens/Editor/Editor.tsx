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
import Button from "../../components/library/Button/Button";
import { ButtonSchema } from "../../components/library/Button/Button.schema";
import Section from "../../components/library/Section/Section";
import { SectionSchema } from "../../components/library/Section/Section.schema";
import Text from "../../components/library/Text/Text";
import { TextSchema } from "../../components/library/Text/Text.schema";
import "./Editor.css";

const ZOOM_MIN = 0.25;
const ZOOM_MAX = 1;

function clampZoom(value: number) {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, value));
}

const ELEMENT_MIN_WIDTH = 120;
const ELEMENT_MIN_HEIGHT = 60;
const ADD_OFFSET = 24;
const CANVAS_DEFAULT_HEIGHT = 600;
const CANVAS_MIN_HEIGHT = 200;

type SchemaFieldDef = {
  type: string;
  label: string;
  default: string | number;
};

type LibrarySchema = {
  name: string;
  props: Record<string, SchemaFieldDef>;
};

const SCHEMAS: Record<string, LibrarySchema> = {
  [CardSchema.name]: CardSchema,
  [ButtonSchema.name]: ButtonSchema,
  [SectionSchema.name]: SectionSchema,
  [TextSchema.name]: TextSchema,
};

const LIBRARY_ITEMS: {
  componentRef: string;
  sourceLocation: string;
  label: string;
  width: number;
  height: number;
}[] = [
  {
    componentRef: CardSchema.name,
    sourceLocation: "src/components/library/Card/Card.tsx",
    label: UI_TERMS.library.cardLabel,
    width: 220,
    height: 120,
  },
  {
    componentRef: ButtonSchema.name,
    sourceLocation: "src/components/library/Button/Button.tsx",
    label: UI_TERMS.library.buttonLabel,
    width: 160,
    height: 48,
  },
  {
    componentRef: SectionSchema.name,
    sourceLocation: "src/components/library/Section/Section.tsx",
    label: UI_TERMS.library.sectionLabel,
    width: 320,
    height: 180,
  },
  {
    componentRef: TextSchema.name,
    sourceLocation: "src/components/library/Text/Text.tsx",
    label: UI_TERMS.library.textLabel,
    width: 200,
    height: 40,
  },
];

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
    }
  | {
      type: "canvas-resize";
      startY: number;
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
  const [canvasHeight, setCanvasHeight] = useState(CANVAS_DEFAULT_HEIGHT);
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
  const canvasHeightRef = useRef(canvasHeight);
  canvasHeightRef.current = canvasHeight;

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
        if (state.canvasHeight) {
          setCanvasHeight(state.canvasHeight);
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
    nextHeight: number,
  ) {
    invoke("save_canvas_state", {
      state: {
        projectId: projectName,
        canvasBackgroundColor: nextColor,
        canvasHeight: nextHeight,
        elements: nextElements,
      } satisfies CanvasState,
    }).catch(() => {});
  }

  function handleCanvasBackgroundColorChange(nextColor: string) {
    setCanvasBackgroundColor(nextColor);
    persistCanvas(elements, nextColor, canvasHeightRef.current);
  }

  function updateSelectedElement(patch: Partial<CanvasElementState>) {
    if (!selectedId) return;
    setElements((prev) => {
      const next = prev.map((el) =>
        el.id === selectedId ? { ...el, ...patch } : el,
      );
      persistCanvas(
        next,
        canvasBackgroundColorRef.current,
        canvasHeightRef.current,
      );
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

  function handleAddElement(item: (typeof LIBRARY_ITEMS)[number]) {
    const last = elements[elements.length - 1];
    const maxX = Math.max(0, FRAME_WIDTHS[canvasMode] - item.width);
    const x = last ? Math.min(last.x + ADD_OFFSET, maxX) : ADD_OFFSET;
    const y = last ? last.y + ADD_OFFSET : ADD_OFFSET;

    const newElement: CanvasElementState = {
      id: crypto.randomUUID(),
      componentRef: item.componentRef,
      sourceLocation: item.sourceLocation,
      x: Math.max(0, x),
      y: Math.max(0, y),
      width: item.width,
      height: item.height,
    };

    const schema = SCHEMAS[item.componentRef];
    for (const [key, def] of Object.entries(schema.props)) {
      (newElement as Record<string, unknown>)[key] = def.default;
    }

    const next = [...elements, newElement];
    setElements(next);
    setSelectedId(newElement.id);
    persistCanvas(next, canvasBackgroundColorRef.current, canvasHeightRef.current);
  }

  function handleCanvasResizeMouseDown(event: ReactMouseEvent) {
    event.stopPropagation();
    setSelectedId(null);
    dragStateRef.current = {
      type: "canvas-resize",
      startY: event.clientY,
      originHeight: canvasHeight,
    };
  }

  useEffect(() => {
    function handleMouseMove(event: MouseEvent) {
      const drag = dragStateRef.current;
      if (!drag) return;

      const z = zoomRef.current || 1;
      const deltaY = (event.clientY - drag.startY) / z;

      if (drag.type === "canvas-resize") {
        setCanvasHeight(
          Math.max(CANVAS_MIN_HEIGHT, drag.originHeight + deltaY),
        );
        return;
      }

      const deltaX = (event.clientX - drag.startX) / z;

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
        persistCanvas(
          current,
          canvasBackgroundColorRef.current,
          canvasHeightRef.current,
        );
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
    persistCanvas(next, canvasBackgroundColorRef.current, canvasHeightRef.current);
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

  function renderCanvasComponent(el: CanvasElementState, active: boolean) {
    switch (el.componentRef) {
      case ButtonSchema.name:
        return (
          <Button
            label={el.label ?? (ButtonSchema.props.label.default as string)}
            backgroundColor={
              el.backgroundColor ??
              (ButtonSchema.props.backgroundColor.default as string)
            }
            textColor={
              el.textColor ?? (ButtonSchema.props.textColor.default as string)
            }
            borderRadius={
              el.borderRadius ??
              (ButtonSchema.props.borderRadius.default as number)
            }
            active={active}
          />
        );
      case SectionSchema.name:
        return (
          <Section
            backgroundColor={
              el.backgroundColor ??
              (SectionSchema.props.backgroundColor.default as string)
            }
            padding={
              el.padding ?? (SectionSchema.props.padding.default as number)
            }
            active={active}
          />
        );
      case TextSchema.name:
        return (
          <Text
            content={
              el.content ?? (TextSchema.props.content.default as string)
            }
            textColor={
              el.textColor ?? (TextSchema.props.textColor.default as string)
            }
            active={active}
          />
        );
      case CardSchema.name:
      default:
        return (
          <Card
            title={el.title ?? (CardSchema.props.title.default as string)}
            content={
              el.content ?? (CardSchema.props.content.default as string)
            }
            backgroundColor={
              el.backgroundColor ??
              (CardSchema.props.backgroundColor.default as string)
            }
            borderColor={
              el.borderColor ??
              (CardSchema.props.borderColor.default as string)
            }
            borderWidth={
              el.borderWidth ??
              (CardSchema.props.borderWidth.default as number)
            }
            borderRadius={
              el.borderRadius ??
              (CardSchema.props.borderRadius.default as number)
            }
            active={active}
          />
        );
    }
  }

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
              <div
                className={`preview-zoom-wrapper canvas-frame--${canvasMode}`}
                style={{
                  zoom,
                  backgroundColor: canvasBackgroundColor,
                  minHeight: canvasHeight,
                }}
              >
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
          {LIBRARY_ITEMS.map((item) => (
            <div className="library-item" key={item.componentRef}>
              <button
                type="button"
                className="library-item-preview"
                onClick={() => handleAddElement(item)}
                aria-label={item.label}
              >
                +
              </button>
              <span className="library-item-name">{item.label}</span>
            </div>
          ))}
        </aside>

        <section
          className="canvas-zone"
          ref={canvasZoneRef}
          onMouseDown={handleCanvasBackgroundMouseDown}
        >
          <div
            className={`canvas-frame canvas-frame--${canvasMode}`}
            style={{
              zoom,
              backgroundColor: canvasBackgroundColor,
              minHeight: canvasHeight,
            }}
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
                {renderCanvasComponent(el, selectedId === el.id)}
                {selectedId === el.id && (
                  <div
                    className="canvas-element-resize-handle"
                    onMouseDown={(e) => handleResizeMouseDown(e, el)}
                  />
                )}
              </div>
            ))}
            <div
              className="canvas-frame-resize-handle"
              onMouseDown={handleCanvasResizeMouseDown}
            />
          </div>
        </section>

        <aside className="style-panel">
          <div className="style-panel-title">{UI_TERMS.panels.style}</div>

          {selectedElement ? (
            <div className="style-field-group">
              {Object.entries(
                SCHEMAS[selectedElement.componentRef]?.props ?? {},
              ).map(([key, def]) => {
                const value =
                  (selectedElement as Record<string, unknown>)[key] ??
                  def.default;
                const onChange = (next: string | number) =>
                  updateSelectedElement({
                    [key]: next,
                  } as Partial<CanvasElementState>);

                if (def.type === "color") {
                  return (
                    <ColorField
                      key={key}
                      label={def.label}
                      value={value as string}
                      onChange={onChange}
                    />
                  );
                }
                if (def.type === "number") {
                  return (
                    <NumberField
                      key={key}
                      label={def.label}
                      value={value as number}
                      onChange={onChange}
                    />
                  );
                }
                return (
                  <TextField
                    key={key}
                    label={def.label}
                    value={value as string}
                    onChange={onChange}
                  />
                );
              })}

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
