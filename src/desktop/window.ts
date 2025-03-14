// src/desktop/window.ts
import { KeyboardDriver, MouseDriver, VGADriver } from "@/drivers";
import { Layout } from "./widgets/layout";
import { Widget, WidgetEvent } from "./widgets/widget";
import { WindowManager } from "./window-manager";

export type WindowEventType =
  | "tick"
  | "keypress"
  | "mousedown"
  | "mouseup"
  | "mousemove"
  | "mousewheel";

export interface WindowEvent {
  type: WindowEventType;
  data?: any;
}

export class Window {
  private id: number;
  private vga: VGADriver;
  // private keyboard: KeyboardDriver;
  // private mouse: MouseDriver;
  private manager: WindowManager;
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private title: string;
  private eventListeners: Map<
    WindowEventType,
    Array<(event: WindowEvent) => void>
  > = new Map();
  private visible: boolean = true;
  private dragging: boolean = false;
  private dragOffsetX: number = 0;
  private dragOffsetY: number = 0;

  // New properties for widget system
  private rootLayout: Layout;
  private contentWidget: Widget | null = null;

  constructor(
    id: number,
    vga: VGADriver,
    _keyboard: KeyboardDriver,
    _mouse: MouseDriver,
    manager: WindowManager,
    title: string,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    this.id = id;
    this.vga = vga;
    // this.keyboard = keyboard;
    // this.mouse = mouse;
    this.manager = manager;
    this.title = title;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    // Initialize the root layout
    this.rootLayout = new Layout();
  }

  // Event handling methods
  onEvent(type: WindowEventType, callback: (event: WindowEvent) => void): void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, []);
    }
    this.eventListeners.get(type)?.push(callback);
  }

  removeEventListener(
    type: WindowEventType,
    callback: (event: WindowEvent) => void
  ): void {
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  dispatchEvent(event: WindowEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach((listener) => listener(event));
    }

    // Forward event to content widget if applicable
    if (this.contentWidget && event.data) {
      const widgetEvent: WidgetEvent = {
        type: event.type as any,
        x: event.data.x - this.x,
        y: event.data.y - (this.y + 20), // Adjust for title bar
        data: event.data,
      };

      if (this.pointInContentArea(event.data.x, event.data.y)) {
        this.contentWidget.handleEvent(widgetEvent);
      }
    }
  }

  // Getters and setters
  getId(): number {
    return this.id;
  }

  getTitle(): string {
    return this.title;
  }

  setTitle(title: string): void {
    this.title = title;
  }

  getX(): number {
    return this.x;
  }

  getY(): number {
    return this.y;
  }

  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }

  setSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  // New methods for widget system
  setContentWidget(widget: Widget): void {
    this.contentWidget = widget;
    this.rootLayout = new Layout();
    this.rootLayout.addWidget(widget);
  }

  getContentWidget(): Widget | null {
    return this.contentWidget;
  }

  isVisible(): boolean {
    return this.visible;
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
  }

  isFocused(): boolean {
    return this.manager.getFocusedWindowId() === this.id;
  }

  focus(): void {
    if (!this.isFocused()) {
      this.manager.focusWindow(this.id);
    }
  }

  unfocus(): void {
    if (this.isFocused()) {
      this.manager.focusWindow(-1);
    }
  }

  isDragging(): boolean {
    return this.dragging;
  }

  setDragging(dragging: boolean, offsetX?: number, offsetY?: number): void {
    this.dragging = dragging;
    if (offsetX !== undefined) this.dragOffsetX = offsetX;
    if (offsetY !== undefined) this.dragOffsetY = offsetY;
  }

  getDragOffset(): { x: number; y: number } {
    return { x: this.dragOffsetX, y: this.dragOffsetY };
  }

  // Drawing methods
  draw(): void {
    if (!this.visible) return;

    // Draw window frame
    this.vga.drawRect(this.x, this.y, this.width, this.height, "#DDDDDD");

    // Draw title bar
    this.vga.drawRect(
      this.x,
      this.y,
      this.width,
      20,
      this.isFocused() ? "#3355AA" : "#555555"
    );
    this.vga.drawText(this.title, this.x + 5, this.y + 15, "#FFFFFF");

    // Draw close button
    this.vga.drawRect(this.x + this.width - 18, this.y + 2, 16, 16, "#FF3333");
    this.vga.drawText("X", this.x + this.width - 13, this.y + 15, "#FFFFFF");

    // Draw content area
    this.vga.drawRect(
      this.x,
      this.y + 20,
      this.width,
      this.height - 20,
      "#FFFFFF"
    );

    // Draw content widget if available
    if (this.contentWidget) {
      this.rootLayout.draw(this.x, this.y + 20, this.width, this.height - 20);
    }
  }

  // Check if a point is inside the window
  containsPoint(x: number, y: number): boolean {
    return (
      x >= this.x &&
      x < this.x + this.width &&
      y >= this.y &&
      y < this.y + this.height
    );
  }

  // Check if a point is inside the title bar
  pointInTitleBar(x: number, y: number): boolean {
    return (
      x >= this.x && x < this.x + this.width && y >= this.y && y < this.y + 20
    );
  }

  // Check if a point is inside the close button
  pointInCloseButton(x: number, y: number): boolean {
    return (
      x >= this.x + this.width - 18 &&
      x < this.x + this.width - 2 &&
      y >= this.y + 2 &&
      y < this.y + 18
    );
  }

  // Check if a point is inside the content area
  pointInContentArea(x: number, y: number): boolean {
    return (
      x >= this.x &&
      x < this.x + this.width &&
      y >= this.y + 20 &&
      y < this.y + this.height
    );
  }
}
