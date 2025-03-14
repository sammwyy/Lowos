// kernel.ts
import { DummyApp } from "@/apps/dummy";
import { Shell } from "@/apps/shell";
import { Desktop, WindowManager } from "@/desktop";
import {
  AudioDriver,
  FileSystem,
  KeyboardDriver,
  MouseDriver,
  VGADriver,
} from "@/drivers";
import { Logger } from "./logger";
import { Process, ProcessInfo } from "./process";

export class Kernel {
  private logger: Logger;

  private vga: VGADriver;
  private keyboard: KeyboardDriver;
  private mouse: MouseDriver;
  private audio: AudioDriver;
  private fs: FileSystem;
  private desktop: Desktop;
  private processes: Map<number, Process> = new Map();
  private nextPid: number = 1;

  constructor() {
    this.logger = new Logger("Kernel");

    this.vga = new VGADriver();
    this.keyboard = new KeyboardDriver();
    this.mouse = new MouseDriver(this.vga.getCanvas());
    this.audio = new AudioDriver();
    this.fs = new FileSystem();

    // Start the desktop environment
    this.desktop = new Desktop(this.vga, this.keyboard, this.mouse);
    this.desktop.start();
  }

  getVGA(): VGADriver {
    return this.vga;
  }

  getKeyboard(): KeyboardDriver {
    return this.keyboard;
  }

  getMouse(): MouseDriver {
    return this.mouse;
  }

  getAudio(): AudioDriver {
    return this.audio;
  }

  getFS(): FileSystem {
    return this.fs;
  }

  getDesktop(): Desktop {
    return this.desktop;
  }

  getWindowManager(): WindowManager {
    return this.desktop.getWindowManager();
  }

  createProcess(
    name: string,
    code: string,
    createWindow: boolean = false
  ): number {
    const pid = this.nextPid++;
    this.logger.info(`Spawning process with pid: ${pid}`);

    let process: Process;

    if (createWindow) {
      // Create a window for the process
      const [windowId, window] = this.getWindowManager().createWindow(
        name,
        100 + (pid % 5) * 30, // Offset windows so they don't all stack
        100 + (pid % 5) * 30,
        400,
        300
      );

      process = new Process(pid, name, code, window);
      this.logger.info(`Assigned window id: ${windowId} for process ${pid}`);
    } else {
      process = new Process(pid, name, code);
    }

    // Store the process
    this.processes.set(pid, process);

    // Execute the process immediately
    this.logger.info(`Calling process entry point: ${pid}`);
    process.execute();

    return pid;
  }

  terminateProcess(pid: number): boolean {
    const process = this.processes.get(pid);
    if (!process) return false;

    this.logger.info(`Terminating process: ${pid}`);
    process.terminate();

    // Close the window if there is one
    const window = process.getWindow();
    if (window) {
      this.logger.info(
        `Destroying window due to process termination: ${window.getId()}`
      );
      this.getWindowManager().destroyWindow(window.getId());
    }

    return true;
  }

  executeFile(path: string): number | null {
    this.logger.info(`Requested file execution for path: ${path}`);

    // Check if file exists and is executable
    if (!this.fs.isExecutable(path)) {
      this.logger.warn(`File is not executable: ${path}`);
      return null;
    }

    const code = this.fs.readFile(path);
    if (!code) return null;

    // Extract file name from path
    const fileName = path.split("/").pop() || "unknown";

    // Add this debugging log
    this.logger.info(`Creating process for file: ${fileName}`);

    // Create a process with a window
    return this.createProcess(fileName, code, false);
  }

  executeShell() {
    const offsetX = 30;
    const offsetY = 30;
    const newX = Math.min(this.vga.width - 500, 50 + offsetX);
    const newY = Math.min(this.vga.height - 400, 50 + offsetY);
    const newShell = new Shell(this, this.getWindowManager(), newX, newY);
    return newShell;
  }

  executeDummy() {
    const offsetX = 30;
    const offsetY = 30;
    const newX = Math.min(this.vga.width - 500, 50 + offsetX);
    const newY = Math.min(this.vga.height - 400, 50 + offsetY);
    const app = new DummyApp(this, newX, newY);
    return app;
  }

  getProcessList(): ProcessInfo[] {
    const processList: ProcessInfo[] = [];

    for (const [_pid, process] of this.processes.entries()) {
      const window = process.getWindow();

      processList.push({
        pid: process.getPid(),
        name: process.getName(),
        state: process.getState() as "running" | "terminated",
        code: "", // Don't return the actual code for security
        windowId: window ? window.getId() : undefined,
      });
    }

    return processList;
  }

  getProcess(pid: number): Process | null {
    return this.processes.get(pid) || null;
  }
}
