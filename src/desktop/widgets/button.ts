import { VGADriver } from "@/drivers";
import { Widget, WidgetEvent } from "./widget";

export class ButtonWidget implements Widget {
  private vga: VGADriver;
  private label: string;
  private isPressed: boolean = false;
  private isHovered: boolean = false;
  private onClick: () => void;
  private textColor: string = "#000000";
  private bgColor: string = "#E0E0E0";
  private bgHoverColor: string = "#CCCCCC";
  private bgPressedColor: string = "#AAAAAA";
  private font: string = "14px sans-serif";

  constructor(vga: VGADriver, label: string, onClick: () => void) {
    this.vga = vga;
    this.label = label;
    this.onClick = onClick;
  }

  draw(x: number, y: number, width: number, height: number): void {
    // Determine button color based on state
    let bgColor = this.bgColor;
    if (this.isPressed) {
      bgColor = this.bgPressedColor;
    } else if (this.isHovered) {
      bgColor = this.bgHoverColor;
    }

    // Draw button background with rounded corners
    this.vga.drawRect(x, y, width, height, bgColor);

    // Draw button border
    this.vga.drawRect(x, y, width, height, "#999999");

    // Center and draw button text
    const textWidth = this.vga.measureText(this.label).width;
    const textX = x + (width - textWidth) / 2;
    const textY = y + height / 2 + 5; // Approximate vertical center

    this.vga.drawText(this.label, textX, textY, this.textColor, this.font);
  }

  handleEvent(event: WidgetEvent): boolean {
    if (event.type === "mousedown") {
      this.isPressed = true;
      return true;
    } else if (event.type === "mouseup") {
      if (this.isPressed) {
        this.isPressed = false;
        this.onClick();
      }
      return true;
    } else if (event.type === "mousemove") {
      this.isHovered = true;
      return true;
    }

    return false;
  }

  getMinWidth(): number {
    return 80;
  }

  getMinHeight(): number {
    return 30;
  }

  getPreferredWidth(): number {
    return 120;
  }

  getPreferredHeight(): number {
    return 40;
  }
}
