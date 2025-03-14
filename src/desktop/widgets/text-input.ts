import { VGADriver } from "@/drivers";
import { Widget, WidgetEvent } from "./widget";

export class TextInputWidget implements Widget {
  private vga: VGADriver;
  private text: string = "";
  private placeholder: string;
  private isFocused: boolean = false;
  private cursorPosition: number = 0;
  private cursorVisible: boolean = true;
  private cursorBlinkTimer: number = 0;
  private onChange: (text: string) => void;
  private textColor: string = "#000000";
  private bgColor: string = "#FFFFFF";
  private borderColor: string = "#CCCCCC";
  private focusBorderColor: string = "#4A90E2";
  private placeholderColor: string = "#999999";
  private font: string = "14px monospace";
  private padding: number = 8;

  constructor(
    vga: VGADriver,
    placeholder: string = "",
    onChange: (text: string) => void = () => {}
  ) {
    this.vga = vga;
    this.placeholder = placeholder;
    this.onChange = onChange;
  }

  getText(): string {
    return this.text;
  }

  setText(text: string): void {
    this.text = text;
    this.cursorPosition = text.length;
    this.onChange(this.text);
  }

  draw(x: number, y: number, width: number, height: number): void {
    // Draw input background
    this.vga.drawRect(x, y, width, height, this.bgColor);

    // Draw border with different color when focused
    const borderColor = this.isFocused
      ? this.focusBorderColor
      : this.borderColor;
    this.vga.drawRect(x, y, width, height, borderColor);

    // Draw text or placeholder
    const displayText = this.text || this.placeholder;
    const textColor = this.text ? this.textColor : this.placeholderColor;

    // Calculate visible text (handle overflow)
    const textMetrics = this.vga.measureText(displayText);
    let visibleText = displayText;
    let textX = x + this.padding;

    // Draw the text
    this.vga.drawText(
      visibleText,
      textX,
      y + height / 2 + 5,
      textColor,
      this.font
    );

    // Draw cursor if focused
    if (this.isFocused && this.cursorVisible) {
      const cursorText = this.text.substring(0, this.cursorPosition);
      const cursorX = textX + this.vga.measureText(cursorText).width;
      this.vga.drawLine(
        cursorX,
        y + this.padding,
        cursorX,
        y + height - this.padding,
        "#000000"
      );
    }
  }

  handleEvent(event: WidgetEvent): boolean {
    if (event.type === "mousedown") {
      this.isFocused = true;
      // TODO: Set cursor position based on click position
      return true;
    } else if (event.type === "keypress" && this.isFocused && event.data?.key) {
      const key = event.data.key;

      if (key === "Backspace") {
        if (this.cursorPosition > 0) {
          this.text =
            this.text.substring(0, this.cursorPosition - 1) +
            this.text.substring(this.cursorPosition);
          this.cursorPosition--;
          this.onChange(this.text);
        }
      } else if (key === "Delete") {
        if (this.cursorPosition < this.text.length) {
          this.text =
            this.text.substring(0, this.cursorPosition) +
            this.text.substring(this.cursorPosition + 1);
          this.onChange(this.text);
        }
      } else if (key === "ArrowLeft") {
        if (this.cursorPosition > 0) {
          this.cursorPosition--;
        }
      } else if (key === "ArrowRight") {
        if (this.cursorPosition < this.text.length) {
          this.cursorPosition++;
        }
      } else if (key === "Home") {
        this.cursorPosition = 0;
      } else if (key === "End") {
        this.cursorPosition = this.text.length;
      } else if (key.length === 1) {
        // Insert character at cursor position
        this.text =
          this.text.substring(0, this.cursorPosition) +
          key +
          this.text.substring(this.cursorPosition);
        this.cursorPosition++;
        this.onChange(this.text);
      }

      this.cursorVisible = true;
      return true;
    }

    return false;
  }

  getMinWidth(): number {
    return 100;
  }

  getMinHeight(): number {
    return 30;
  }

  getPreferredWidth(): number {
    return 200;
  }

  getPreferredHeight(): number {
    return 40;
  }
}
