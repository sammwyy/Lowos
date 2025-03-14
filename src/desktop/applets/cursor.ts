import { MouseDriver, MousePosition, VGADriver } from "@/drivers";
import { Applet } from "../desktop";

export class Cursor implements Applet {
  private vga: VGADriver;
  private mouse: MouseDriver;
  private position: MousePosition = { x: 0, y: 0 };
  private zIndex: number = Number.MAX_SAFE_INTEGER; // Always on top

  constructor(vga: VGADriver, mouse: MouseDriver) {
    this.vga = vga;
    this.mouse = mouse;

    this.mouse.onMouseMove((pos) => {
      this.position = pos;
    });
  }

  draw() {
    // Draw a more visible cursor
    const x = this.position.x;
    const y = this.position.y;

    // Draw cursor outline
    this.vga.drawRect(x - 1, y - 1, 12, 12, "#000000");

    // Draw cursor fill
    this.vga.drawRect(x, y, 10, 10, "#FFFFFF");

    // Draw inner details
    this.vga.drawRect(x + 2, y + 2, 6, 6, "#3355AA");
  }

  getZIndex(): number {
    return this.zIndex;
  }
}
