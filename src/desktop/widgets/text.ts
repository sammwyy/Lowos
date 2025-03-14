import { VGADriver } from "@/drivers";
import { Widget, WidgetEvent } from "./widget";

export class TextWidget implements Widget {
  private vga: VGADriver;
  private text: string = "";
  private scrollOffset: number = 0;
  private maxScrollOffset: number = 0;
  private lineHeight: number = 16;
  private padding: number = 5;
  private textColor: string = "#000000";
  private backgroundColor: string = "#FFFFFF";
  private font: string = "16px monospace";
  private focused: boolean = false;

  constructor(vga: VGADriver) {
    this.vga = vga;
  }

  setText(text: string): void {
    this.text = text;
    this.updateScrollInfo(0, 0); // Will be updated with actual dimensions when drawn
  }

  getText(): string {
    return this.text;
  }

  setTextColor(color: string): void {
    this.textColor = color;
  }

  setBackgroundColor(color: string): void {
    this.backgroundColor = color;
  }

  setFont(font: string): void {
    this.font = font;
  }

  setFocused(focused: boolean): void {
    this.focused = focused;
  }

  draw(x: number, y: number, width: number, height: number): void {
    // Update scroll info with actual dimensions
    this.updateScrollInfo(width, height);

    // Draw background
    this.vga.drawRect(x, y, width, height, this.backgroundColor);

    // Draw text content with scroll offset
    const lines = this.text.split("\n");
    const startLine = this.scrollOffset;
    const visibleLines = Math.floor(
      (height - 2 * this.padding) / this.lineHeight
    );

    for (let i = 0; i < visibleLines; i++) {
      const lineIndex = startLine + i;
      if (lineIndex < lines.length) {
        this.vga.drawText(
          lines[lineIndex],
          x + this.padding,
          y + this.padding + (i + 1) * this.lineHeight,
          this.textColor,
          this.font
        );
      }
    }

    // Draw scrollbar if needed
    if (this.maxScrollOffset > 0) {
      const scrollbarWidth = 8;
      const scrollRatio = this.scrollOffset / this.maxScrollOffset;
      const scrollbarHeight = Math.max(
        30,
        height * (visibleLines / lines.length)
      );
      const scrollbarY = y + scrollRatio * (height - scrollbarHeight);

      // Draw scrollbar background
      this.vga.drawRect(
        x + width - scrollbarWidth - 2,
        y,
        scrollbarWidth + 2,
        height,
        "#DDDDDD"
      );

      // Draw scrollbar handle
      this.vga.drawRect(
        x + width - scrollbarWidth,
        scrollbarY,
        scrollbarWidth - 2,
        scrollbarHeight,
        "#999999"
      );
    }
  }

  handleEvent(event: WidgetEvent): boolean {
    if (event.type === "mousewheel" && event.data?.delta) {
      // Handle mouse wheel for scrolling
      const newOffset = this.scrollOffset + event.data.delta;
      this.setScrollOffset(newOffset);
      return true;
    }
    return false;
  }

  getScrollOffset(): number {
    return this.scrollOffset;
  }

  setScrollOffset(offset: number): void {
    this.scrollOffset = Math.max(0, Math.min(this.maxScrollOffset, offset));
  }

  getMaxScrollOffset(): number {
    return this.maxScrollOffset;
  }

  updateScrollInfo(width: number, height: number): void {
    const contentLines = this.text.split("\n").length;
    const visibleLines = Math.floor(
      (height - 2 * this.padding) / this.lineHeight
    );
    this.maxScrollOffset = Math.max(0, contentLines - visibleLines);
  }

  getMinWidth(): number {
    return 100;
  }

  getMinHeight(): number {
    return this.lineHeight + 2 * this.padding;
  }

  getPreferredWidth(): number {
    return 300;
  }

  getPreferredHeight(): number {
    return 200;
  }
}
