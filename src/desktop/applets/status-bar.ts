import { VGADriver } from "@/drivers";
import { Applet, AppletPosition } from "../desktop";

export class StatusBar implements Applet {
  private vga: VGADriver;
  private height: number = 20;
  private backgroundColor: string = "#444444";
  private textColor: string = "#FFFFFF";
  private lastUpdateTime: number = 0;
  private currentTime: string = "";
  private updateInterval: number = 1000; // Update time every second
  private zIndex: number = AppletPosition.ALWAYS_TOP;

  constructor(vga: VGADriver) {
    this.vga = vga;
    this.updateTime();
  }

  update(): void {
    const now = performance.now();

    // Only update the time once per second
    if (now - this.lastUpdateTime >= this.updateInterval) {
      this.updateTime();
      this.lastUpdateTime = now;
    }
  }

  private updateTime(): void {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    this.currentTime = `${hours}:${minutes}:${seconds}`;
  }

  draw(): void {
    const screenWidth = this.vga.width;

    // Draw the status bar background
    this.vga.drawRect(0, 0, screenWidth, this.height, this.backgroundColor);

    // Draw a subtle bottom border
    this.vga.drawRect(0, this.height - 1, screenWidth, 1, "#333333");

    // Draw the time on the right side
    const timeWidth = this.currentTime.length * 8; // Approximate width of text
    const timeX = screenWidth - timeWidth - 10; // 10px padding from right edge
    this.vga.drawText(
      this.currentTime,
      timeX,
      this.height / 2 + 3,
      this.textColor
    );

    // Draw window buttons
    let startX = 0;
    for (const openedWindow of window.kernel
      .getWindowManager()
      .getAllWindows()) {
      let background = openedWindow.isFocused() ? "#77a" : "#555";

      const size = this.vga.measureText(openedWindow.getTitle()).width + 20;

      // Draw bg
      this.vga.drawRect(startX, 0, size, this.height, background);

      // Draw window title with background color
      this.vga.drawText(
        openedWindow.getTitle(),
        startX + 10, // 10px padding from left edge
        this.height / 2 + 3, // Approximate vertical center
        "#FFFFFF"
      );

      startX += size;
    }
  }

  getHeight(): number {
    return this.height;
  }

  getZIndex(): number {
    return this.zIndex;
  }
}
