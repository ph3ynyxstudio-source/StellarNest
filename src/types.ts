export type CanvasMode = "mobile" | "desktop";

export const FRAME_WIDTHS: Record<CanvasMode, number> = {
  mobile: 375,
  desktop: 1440,
};

export type CanvasElementState = {
  id: string;
  componentRef: string;
  sourceLocation: string;
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  content: string;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
};

export type CanvasState = {
  projectId: string;
  canvasBackgroundColor?: string;
  elements: CanvasElementState[];
};
