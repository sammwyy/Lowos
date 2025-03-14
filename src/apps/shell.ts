// src/desktop/shell.ts
import { MessageBox, WindowManager } from "@/desktop";
import { TextWidget } from "@/desktop/widgets/text";
import { Window } from "@/desktop/window";
import { Kernel } from "@/kernel";

export class Shell {
  private kernel: Kernel;
  private windowManager: WindowManager;
  private messageBox: MessageBox;
  private windowId: number;
  private window: Window;
  private textWidget: TextWidget;
  private input: string = "";
  private history: string[] = [];
  private historyIndex: number = 0;
  private prompt: string = "> ";
  private output: string[] = [
    "Lowos v0.1",
    'Type "help" for available commands',
    "",
  ];

  constructor(
    kernel: Kernel,
    windowManager: WindowManager,
    x: number = 50,
    y: number = 50
  ) {
    this.kernel = kernel;
    this.windowManager = windowManager;
    this.textWidget = new TextWidget(this.kernel.getVGA());
    this.messageBox = globalThis.window.messageBox;

    // Create shell window
    const [windowId, window] = this.windowManager.createWindow(
      "Terminal",
      x,
      y,
      500,
      400
    );

    this.windowId = windowId;
    this.window = window;

    if (this.window) {
      // Create text widget for content
      this.textWidget = new TextWidget(this.kernel.getVGA());
      this.textWidget.setText(this.getDisplayText());

      // Set the text widget as the window's content
      this.window.setContentWidget(this.textWidget);

      // Add event listeners
      this.window.onEvent("mousewheel", ({ data }) => {
        if (data && data.delta) {
          this.textWidget.setScrollOffset(
            this.textWidget.getScrollOffset() + data.delta
          );
        }
      });

      this.window.onEvent("keypress", (event) => {
        if (event.data && event.data.key) {
          this.handleKeyPress(event.data.key);
        }
      });

      // Add tick event listener to update content if needed
      this.window.onEvent("tick", () => {
        // This could be used for animations or real-time updates
        // For now, we'll just make sure the content is up to date
        this.updateContent();
      });
    }
  }

  getWindowId(): number {
    return this.windowId;
  }

  private handleKeyPress(key: string) {
    // Only handle if shell window is active
    if (this.windowId === null) return;

    switch (key) {
      case "Enter":
        // Execute command
        this.executeCommand();
        break;
      case "Backspace":
        // Remove last character
        this.input = this.input.slice(0, -1);
        break;
      case "ArrowUp":
        // Navigate history
        if (this.historyIndex > 0) {
          this.historyIndex--;
          this.input = this.history[this.historyIndex];
        }
        break;
      case "ArrowDown":
        // Navigate history
        if (this.historyIndex < this.history.length - 1) {
          this.historyIndex++;
          this.input = this.history[this.historyIndex];
        } else {
          this.historyIndex = this.history.length;
          this.input = "";
        }
        break;
      default:
        // Add character if it's a single character
        if (key.length === 1) {
          this.input += key;
        }
    }

    // Update display text
    this.updateContent();
  }

  private updateContent() {
    if (this.textWidget) {
      this.textWidget.setText(this.getDisplayText());
    }
  }

  private executeCommand() {
    // Add command to history
    if (this.input.trim()) {
      this.history.push(this.input);
      this.historyIndex = this.history.length;
    }

    // Add command to output
    this.output.push(this.prompt + this.input);

    // Parse and execute command
    const parts = this.input.trim().split(" ");
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (command) {
      case "help":
        this.showHelp();
        break;
      case "ls":
        this.listDirectory(args[0]);
        break;
      case "cd":
        this.changeDirectory(args[0]);
        break;
      case "cat":
        this.catFile(args[0]);
        break;
      case "run":
        this.runProgram(args[0]);
        break;
      case "echo":
        this.output.push(args.join(" "));
        break;
      case "clear":
        this.output = [];
        break;
      case "ps":
        this.listProcesses();
        break;
      case "kill":
        this.killProcess(parseInt(args[0]));
        break;
      case "beep":
        this.kernel.getAudio().playBeep();
        break;
      case "alert":
        this.showAlert(args.join(" "));
        break;
      case "newshell":
        this.createNewShell();
        break;
      case "dummy":
        this.createNewDummyApp();
        break;
      case "":
        // Do nothing for empty command
        break;
      default:
        this.output.push(`Command not found: ${command}`);
    }

    // Clear input
    this.input = "";

    // Update display text
    this.updateContent();
  }

  createNewDummyApp() {
    const dummyApp = this.kernel.executeDummy();
    this.output.push(`New dummy app created with window.`);
    this.updateContent();
    return dummyApp;
  }

  createNewShell() {
    const newShell = this.kernel.executeShell();
    this.output.push(
      `New shell created with window ID: ${newShell.getWindowId()}`
    );
    this.updateContent();
    return newShell;
  }

  private showHelp() {
    this.output.push("Available commands:");
    this.output.push("  help - Show this help");
    this.output.push("  ls [path] - List directory contents");
    this.output.push("  cd <path> - Change directory");
    this.output.push("  cat <file> - Display file contents");
    this.output.push("  run <file> - Execute a program");
    this.output.push("  echo <text> - Display text");
    this.output.push("  clear - Clear the screen");
    this.output.push("  ps - List running processes");
    this.output.push("  kill <pid> - Terminate a process");
    this.output.push("  beep - Play a sound");
    this.output.push("  alert <message> - Show an alert box");
    this.output.push("  newshell - Open a new shell window");
    this.output.push("  dummy - Open a dummy app");
  }

  private listDirectory(path?: string) {
    const files = this.kernel.getFS().listDir(path || "");
    if (files.length === 0) {
      this.output.push("Directory is empty");
    } else {
      this.output.push(...files);
    }
  }

  private changeDirectory(path: string) {
    if (!path) {
      this.output.push(
        "Current directory: " + this.kernel.getFS().getCurrentPath()
      );
      return;
    }

    const success = this.kernel.getFS().changeDir(path);
    if (!success) {
      this.output.push(`Directory not found: ${path}`);
    } else {
      this.output.push(`Changed to: ${this.kernel.getFS().getCurrentPath()}`);
    }
  }

  private catFile(path: string) {
    if (!path) {
      this.output.push("Usage: cat <file>");
      return;
    }

    const content = this.kernel.getFS().readFile(path);
    if (content === null) {
      this.output.push(`File not found: ${path}`);
    } else {
      this.output.push(...content.split("\n"));
    }
  }

  private runProgram(path: string) {
    if (!path) {
      this.output.push("Usage: run <file>");
      return;
    }

    const pid = this.kernel.executeFile(path);
    if (pid === null) {
      this.output.push(`Cannot execute file: ${path}`);
    } else {
      this.output.push(`Started process with PID: ${pid}`);
      this.updateContent();
    }
  }

  private listProcesses() {
    const processes = this.kernel.getProcessList();
    if (processes.length === 0) {
      this.output.push("No processes running");
    } else {
      this.output.push("PID\tName\tState");
      processes.forEach((process) => {
        this.output.push(`${process.pid}\t${process.name}\t${process.state}`);
      });
    }
  }

  private killProcess(pid: number) {
    if (isNaN(pid)) {
      this.output.push("Usage: kill <pid>");
      return;
    }

    const success = this.kernel.terminateProcess(pid);
    if (!success) {
      this.output.push(`Process not found: ${pid}`);
    } else {
      this.output.push(`Terminated process ${pid}`);
    }
  }

  private showAlert(message: string) {
    if (!message) {
      this.output.push("Usage: alert <message>");
      return;
    }

    this.messageBox.show("Alert", message);
  }

  private getDisplayText(): string {
    // Combine output and current input
    return [...this.output, this.prompt + this.input].join("\n");
  }
}
