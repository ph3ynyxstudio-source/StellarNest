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
  // Propriétés propres à chaque type de component (voir {Nom}.schema.ts) —
  // optionnelles ici car un élément ne porte que les champs de son propre schéma.
  title?: string;
  content?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  label?: string;
  textColor?: string;
  padding?: number;
};

export type CanvasState = {
  projectId: string;
  canvasBackgroundColor?: string;
  canvasHeight?: number;
  elements: CanvasElementState[];
};
