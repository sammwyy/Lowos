import { KeyboardDriver, MouseDriver, VGADriver } from "@/drivers";
import { Logger } from "@/kernel";
import { Cursor } from "./applets/cursor";
import { StatusBar } from "./applets/status-bar";
import { WindowManager } from "./window-manager";

// Define a base applet interface
export interface Applet {
  draw(): void;
  update?(): void;
  getZIndex(): number; // Higher numbers appear on top
}

// Applet positioning constants
export enum AppletPosition {
  ALWAYS_BOTTOM = 0,
  NORMAL = 100,
  ALWAYS_TOP = 200,
}

export class Desktop {
  private logger: Logger;
  private vga: VGADriver;
  private windowManager: WindowManager;
  private cursor: Cursor;
  private applets: Applet[] = [];
  private running: boolean = false;
  private fps: number = 60;
  private lastTickTime: number = 0;

  constructor(vga: VGADriver, keyboard: KeyboardDriver, mouse: MouseDriver) {
    this.logger = new Logger("Desktop");
    this.vga = vga;

    // Initialize window manager
    this.windowManager = new WindowManager(vga, mouse, keyboard);

    // Initialize cursor (will be rendered on top of everything)
    this.cursor = new Cursor(vga, mouse);

    // Add status bar as a top applet
    this.addApplet(new StatusBar(vga), AppletPosition.ALWAYS_TOP);

    this.logger.info("Desktop environment initialized");
  }

  start(): void {
    if (this.running) return;

    this.running = true;
    this.lastTickTime = performance.now();

    // Start the window manager
    this.windowManager.start();

    // Start the desktop rendering loop
    requestAnimationFrame(() => this.tick());

    this.logger.info("Desktop environment started");
  }

  stop(): void {
    this.running = false;
    this.windowManager.stop();
    this.logger.info("Desktop environment stopped");
  }

  private tick(): void {
    if (!this.running) return;

    const now = performance.now();
    const elapsed = now - this.lastTickTime;
    const frameDuration = 1000 / this.fps;

    if (elapsed >= frameDuration) {
      this.lastTickTime = now - (elapsed % frameDuration);

      // Update all applets
      this.applets.forEach((applet) => {
        if (applet.update) {
          applet.update();
        }
      });

      // Render everything
      this.render();
    }

    requestAnimationFrame(() => this.tick());
  }

  private render(): void {
    // Clear the screen
    this.vga.clear("#333333");

    // Sort applet by z-index
    const sortedApplets = [...this.applets].sort(
      (a, b) => a.getZIndex() - b.getZIndex()
    );

    // Draw bottom applets
    sortedApplets
      .filter((w) => w.getZIndex() < AppletPosition.NORMAL)
      .forEach((applet) => {
        applet.draw();
      });

    // Draw normal applets and windows
    sortedApplets
      .filter(
        (w) =>
          w.getZIndex() >= AppletPosition.NORMAL &&
          w.getZIndex() < AppletPosition.ALWAYS_TOP
      )
      .forEach((applet) => {
        applet.draw();
      });

    // Let the window manager draw all windows
    this.windowManager.redrawAll();

    // Draw top applets
    sortedApplets
      .filter((w) => w.getZIndex() >= AppletPosition.ALWAYS_TOP)
      .forEach((applet) => {
        applet.draw();
      });

    // Draw cursor last so it's always on top
    this.cursor.draw();
  }

  addApplet(
    applet: Applet,
    position: AppletPosition = AppletPosition.NORMAL
  ): void {
    // Set the z-index based on position unless it's already set
    if (applet.getZIndex() === 0) {
      Object.defineProperty(applet, "zIndex", {
        value: position,
        writable: false,
      });

      // Add a default getZIndex method if not present
      if (!applet.getZIndex) {
        applet.getZIndex = function () {
          return position;
        };
      }
    }

    this.applets.push(applet);
    this.logger.info(`Added applet with z-index: ${applet.getZIndex()}`);
  }

  removeApplet(applet: Applet): boolean {
    const index = this.applets.indexOf(applet);
    if (index !== -1) {
      this.applets.splice(index, 1);
      this.logger.info(`Removed applet with z-index: ${applet.getZIndex()}`);
      return true;
    }
    return false;
  }

  getWindowManager(): WindowManager {
    return this.windowManager;
  }

  getApplets(): Applet[] {
    return [...this.applets];
  }
}
