export interface Widget {
  draw(x: number, y: number, width: number, height: number): void;
  handleEvent(event: WidgetEvent): boolean;
  getMinWidth(): number;
  getMinHeight(): number;
  getPreferredWidth(): number;
  getPreferredHeight(): number;
}

export type WidgetEventType =
  | "keypress"
  | "mousedown"
  | "mouseup"
  | "mousemove"
  | "mousewheel";

export interface WidgetEvent {
  type: WidgetEventType;
  x: number;
  y: number;
  data?: any;
}
