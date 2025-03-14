// process.ts
import { Window } from "@/desktop";

export interface ProcessInfo {
  pid: number;
  name: string;
  state: "running" | "terminated";
  code: string;
  windowId?: number;
}

export class Process {
  private pid: number;
  private name: string;
  private code: string;
  private state: "running" | "terminated" = "running";
  private window: Window | null = null;

  constructor(pid: number, name: string, code: string, window?: Window) {
    this.pid = pid;
    this.name = name;
    this.code = code;
    this.window = window || null;

    // If we have a window, set up event listeners
    if (this.window) {
      this.setupWindowEvents();
    }
  }

  private setupWindowEvents(): void {
    if (!this.window) return;

    // Add tick event listener to run process logic on each tick
    this.window.onEvent("tick", () => {
      this.onTick();
    });

    // Add other event listeners
    this.window.onEvent("keypress", (event) => {
      this.onKeyPress(event.data?.key);
    });

    this.window.onEvent("mousedown", (event) => {
      this.onMouseDown(event.data?.x, event.data?.y, event.data?.button);
    });

    this.window.onEvent("mouseup", (event) => {
      this.onMouseUp(event.data?.x, event.data?.y, event.data?.button);
    });

    this.window.onEvent("mousemove", (event) => {
      this.onMouseMove(event.data?.x, event.data?.y);
    });
  }

  getPid(): number {
    return this.pid;
  }

  getName(): string {
    return this.name;
  }

  getWindow(): Window | null {
    return this.window;
  }

  setWindow(window: Window): void {
    this.window = window;
    this.setupWindowEvents();
  }

  getState(): string {
    return this.state;
  }

  terminate(): void {
    this.state = "terminated";
  }

  // Event handlers that can be overridden by subclasses
  protected onTick(): void {
    // Default implementation does nothing
    // Subclasses can override this to implement real-time behavior
  }

  protected onKeyPress(_key?: string): void {
    // Default implementation does nothing
  }

  protected onMouseDown(_x?: number, _y?: number, _button?: number): void {
    // Default implementation does nothing
  }

  protected onMouseUp(_x?: number, _y?: number, _button?: number): void {
    // Default implementation does nothing
  }

  protected onMouseMove(_x?: number, _y?: number): void {
    // Default implementation does nothing
  }

  // Execute the process code within a sandbox
  execute(): void {
    if (this.state !== "running") return;

    try {
      // Create a sandbox for executing the code
      const sandbox = {
        process: this,
        window: this.window,
        console: {
          log: (text: string) => {
            console.log(`[PID ${this.pid}] ${text}`);
          },
        },
      };

      // Create a function from the code
      const fn = new Function("sandbox", `with(sandbox) { ${this.code} }`);

      // Execute the function
      fn(sandbox);
    } catch (error) {
      console.error(`Error executing process ${this.pid}: ${error}`);
    }
  }
}
