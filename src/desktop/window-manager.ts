import {
  KeyboardDriver,
  MouseDriver,
  MousePosition,
  VGADriver,
} from "@/drivers";
import { Logger } from "@/kernel";
import { Window } from "./window";

export class WindowManager {
  private logger: Logger;

  // Drivers
  private vga: VGADriver;
  private mouse: MouseDriver;
  private keyboard: KeyboardDriver;

  // State
  private windows: Map<number, Window> = new Map();
  private nextWindowId: number = 1;
  private focusedWindowId: number | null = null;
  private running: boolean = false;
  private fps: number = 60;
  private lastTickTime: number = 0;

  constructor(vga: VGADriver, mouse: MouseDriver, keyboard: KeyboardDriver) {
    this.logger = new Logger("WindowManager");

    this.vga = vga;
    this.mouse = mouse;
    this.keyboard = keyboard;

    // Set up event listeners for mouse and keyboard
    this.mouse.onMouseMove((pos) => this.handleMouseMove(pos));
    this.mouse.onMouseClick((pos, button) =>
      this.handleMouseClick(pos, button)
    );
    this.keyboard.onKeyPress((key) => this.handleKeyPress(key));

    // Add a listener for mouse up events
    this.mouse.onMouseUp(() => this.handleMouseUp(this.mouse.getPosition()));

    // Add wheel event listener
    this.mouse.onMouseWheel((delta) => this.handleMouseWheel(delta));
  }

  getFPS(): number {
    return this.fps;
  }

  getLastTickTime(): number {
    return this.lastTickTime;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastTickTime = performance.now();
    this.logger.info("Window manager started");
  }

  stop(): void {
    this.running = false;
    this.logger.info("Window manager stopped");
  }

  private handleMouseMove(pos: MousePosition) {
    // Handle window dragging
    for (const [_id, window] of this.windows.entries()) {
      if (window.isDragging()) {
        const offset = window.getDragOffset();
        window.setPosition(pos.x - offset.x, pos.y - offset.y);
      }

      // Dispatch mouse move event to the window
      if (window.containsPoint(pos.x, pos.y)) {
        window.dispatchEvent({
          type: "mousemove",
          data: {
            x: pos.x - window.getX(),
            y: pos.y - window.getY(),
            button: this.mouse.isButtonPressed(0) ? 0 : null,
          },
        });
      }
    }
  }

  private handleMouseClick(pos: MousePosition, button: number) {
    if (button !== 0) return; // Only handle left clicks

    // Process windows in reverse order (from top to bottom)
    const windowIds = Array.from(this.windows.keys()).reverse();

    for (const id of windowIds) {
      const window = this.windows.get(id);
      if (!window || !window.isVisible()) continue;

      // Check if the close button is clicked
      if (window.pointInCloseButton(pos.x, pos.y)) {
        // Close the window
        this.destroyWindow(id);
        return;
      }

      // Check if the click is inside the window
      if (window.containsPoint(pos.x, pos.y)) {
        // Dispatch mousedown event to the window
        window.dispatchEvent({
          type: "mousedown",
          data: {
            x: pos.x - window.getX(),
            y: pos.y - window.getY(),
            button: button,
          },
        });

        // Check if the click is on the title bar
        if (window.pointInTitleBar(pos.x, pos.y)) {
          window.setDragging(
            true,
            pos.x - window.getX(),
            pos.y - window.getY()
          );

          // Focus this window
          this.focusWindow(id);
        }

        // Stop processing other windows
        break;
      }
    }
  }

  private handleMouseUp(pos: MousePosition) {
    // Stop dragging all windows
    for (const [_id, window] of this.windows.entries()) {
      if (window.isDragging()) {
        window.setDragging(false);
      }

      // Dispatch mouseup event to the window
      if (window.containsPoint(pos.x, pos.y)) {
        window.dispatchEvent({
          type: "mouseup",
          data: {
            x: pos.x - window.getX(),
            y: pos.y - window.getY(),
            button: 0,
          },
        });
      }
    }
  }

  private handleMouseWheel(delta: number) {
    // Check if any window is focused
    if (this.focusedWindowId) {
      const window = this.windows.get(this.focusedWindowId);
      if (window) {
        window.dispatchEvent({
          type: "mousewheel",
          data: { delta },
        });
      }
    }
  }

  private handleKeyPress(key: string) {
    // Dispatch keypress event to the focused window
    if (this.focusedWindowId) {
      const window = this.windows.get(this.focusedWindowId);
      if (window) {
        window.dispatchEvent({
          type: "keypress",
          data: { key },
        });
      }
    }
  }

  getFocusedWindowId(): number | null {
    return this.focusedWindowId;
  }

  windowExists(id: number): boolean {
    return this.windows.has(id);
  }

  createWindow(
    title: string,
    x: number,
    y: number,
    width: number,
    height: number
  ): [number, Window] {
    const id = this.nextWindowId++;

    // Create a new Window instance
    const window = new Window(
      id,
      this.vga,
      this.keyboard,
      this.mouse,
      this,
      title,
      x,
      y,
      width,
      height
    );

    // Add window to the map
    this.windows.set(id, window);

    // Focus the new window
    this.focusWindow(id);

    this.logger.info(`Created window with id: ${id}, title: ${title}`);
    return [id, window];
  }

  destroyWindow(id: number): boolean {
    if (!this.windows.has(id)) return false;

    // If this was the focused window, clear the focus
    if (this.focusedWindowId === id) {
      this.focusedWindowId = null;
    }

    this.windows.delete(id);
    this.logger.info(`Destroyed window with id: ${id}`);
    return true;
  }

  getWindow(id: number): Window | null {
    return this.windows.get(id) || null;
  }

  getAllWindows(): MapIterator<Window> {
    return this.windows.values();
  }

  focusWindow(id: number): boolean {
    // Unfocus previous window
    if (this.focusedWindowId !== null && this.focusedWindowId !== id) {
      const prevWindow = this.windows.get(this.focusedWindowId);
      if (prevWindow) {
        // prevWindow.setFocused(false); (To-do: Implement focus unfocus events)
      }
    }

    // Focus new window
    const window = this.windows.get(id);
    if (!window) return false;

    // window.focus(); (To-do: Implement focus unfocus events)
    this.focusedWindowId = id;

    // Move window to top (end of Map)
    this.windows.delete(id);
    this.windows.set(id, window);

    return true;
  }

  redrawAll(): void {
    // Draw all windows in order (first to last)
    for (const [_id, window] of this.windows.entries()) {
      window.draw();
    }
  }
}
