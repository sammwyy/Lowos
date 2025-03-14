import { VGADriver } from "@/drivers";
import { Widget, WidgetEvent } from "./widget";

export class CheckboxWidget implements Widget {
  private vga: VGADriver;
  private label: string;
  private isChecked: boolean = false;
  private hovered: boolean = false;
  private onChange: (checked: boolean) => void;
  private textColor: string = "#000000";
  private boxSize: number = 16;
  private font: string = "14px sans-serif";

  constructor(
    vga: VGADriver,
    label: string,
    onChange: (checked: boolean) => void = () => {}
  ) {
    this.vga = vga;
    this.label = label;
    this.onChange = onChange;
  }

  isHovered(): boolean {
    return this.hovered;
  }

  isSelected(): boolean {
    return this.isChecked;
  }

  setChecked(checked: boolean): void {
    this.isChecked = checked;
    this.onChange(this.isChecked);
  }

  draw(x: number, y: number, size: number): void {
    const boxY = y + (size - this.boxSize) / 2;

    // Draw checkbox
    this.vga.drawRect(x, boxY, this.boxSize, this.boxSize, "#FFFFFF");
    this.vga.drawRect(x, boxY, this.boxSize, this.boxSize, "#999999");

    // Draw check mark if checked
    if (this.isChecked) {
      const padding = 3;
      this.vga.drawLine(
        x + padding,
        boxY + this.boxSize / 2,
        x + this.boxSize / 2,
        boxY + this.boxSize - padding,
        "#000000"
      );
      this.vga.drawLine(
        x + this.boxSize / 2,
        boxY + this.boxSize - padding,
        x + this.boxSize - padding,
        boxY + padding,
        "#000000"
      );
    }

    // Draw label
    this.vga.drawText(
      this.label,
      x + this.boxSize + 8,
      y + size / 2 + 5,
      this.textColor,
      this.font
    );
  }

  handleEvent(event: WidgetEvent): boolean {
    if (event.type === "mousedown") {
      this.isChecked = !this.isChecked;
      this.onChange(this.isChecked);
      return true;
    } else if (event.type === "mousemove") {
      this.hovered = true;
      return true;
    }

    return false;
  }

  getMinWidth(): number {
    return this.boxSize + 8 + 80;
  }

  getMinHeight(): number {
    return Math.max(20, this.boxSize);
  }

  getPreferredWidth(): number {
    return this.boxSize + 8 + 150;
  }

  getPreferredHeight(): number {
    return 30;
  }
}
