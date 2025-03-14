import { MouseDriver, MousePosition, VGADriver } from "@/drivers";

export interface MessageBoxButton {
  text: string;
  callback: () => void;
}

export class MessageBox {
  private vga: VGADriver;
  private mouse: MouseDriver;
  private visible: boolean = false;
  private title: string = "";
  private message: string = "";
  private buttons: MessageBoxButton[] = [];
  private x: number = 0;
  private y: number = 0;
  private width: number = 0;
  private height: number = 0;
  private clickListenerId: number = -1;

  constructor(vga: VGADriver, mouse: MouseDriver) {
    this.vga = vga;
    this.mouse = mouse;
  }

  show(
    title: string,
    message: string,
    buttons: MessageBoxButton[] = [{ text: "OK", callback: () => this.hide() }]
  ) {
    this.title = title;
    this.message = message;
    this.buttons = buttons;
    this.visible = true;

    // Calculate size based on content
    const lines = message.split("\n");
    this.width = Math.max(
      300,
      title.length * 8 + 40,
      Math.max(...lines.map((line) => line.length * 8)) + 40
    );
    this.height = 80 + lines.length * 20;

    // Center on screen
    this.x = (this.vga.width - this.width) / 2;
    this.y = (this.vga.height - this.height) / 2;

    // Add click listener
    this.clickListenerId = this.mouse.onMouseClick((pos, button) =>
      this.handleClick(pos, button)
    );

    // Draw
    this.draw();
  }

  hide() {
    this.visible = false;

    // Remove click listener
    if (this.clickListenerId !== -1) {
      this.mouse.removeMouseClickListener(this.clickListenerId);
      this.clickListenerId = -1;
    }
  }

  private handleClick(pos: MousePosition, button: number) {
    if (!this.visible || button !== 0) return;

    // Check if click is within message box
    if (
      pos.x < this.x ||
      pos.x > this.x + this.width ||
      pos.y < this.y ||
      pos.y > this.y + this.height
    ) {
      return;
    }

    // Check if click is on a button
    const buttonWidth = this.width / this.buttons.length;
    const buttonY = this.y + this.height - 40;

    for (let i = 0; i < this.buttons.length; i++) {
      const buttonX = this.x + i * buttonWidth;

      if (
        pos.x >= buttonX &&
        pos.x <= buttonX + buttonWidth &&
        pos.y >= buttonY &&
        pos.y <= buttonY + 30
      ) {
        // Button click
        this.buttons[i].callback();
        break;
      }
    }
  }

  draw() {
    if (!this.visible) return;

    // Draw background overlay
    this.vga.drawRect(
      0,
      0,
      this.vga.width,
      this.vga.height,
      "rgba(0, 0, 0, 0.5)"
    );

    // Draw message box
    this.vga.drawRect(this.x, this.y, this.width, this.height, "#EEEEEE");

    // Draw title bar
    this.vga.drawRect(this.x, this.y, this.width, 30, "#3355AA");
    this.vga.drawText(this.title, this.x + 10, this.y + 20, "#FFFFFF");

    // Draw message
    const lines = this.message.split("\n");
    for (let i = 0; i < lines.length; i++) {
      this.vga.drawText(lines[i], this.x + 20, this.y + 50 + i * 20, "#000000");
    }

    // Draw buttons
    const buttonWidth = this.width / this.buttons.length;
    const buttonY = this.y + this.height - 40;

    for (let i = 0; i < this.buttons.length; i++) {
      const buttonX = this.x + i * buttonWidth;

      this.vga.drawRect(buttonX + 5, buttonY, buttonWidth - 10, 30, "#DDDDDD");

      // Center button text
      const textWidth = this.buttons[i].text.length * 8;
      const textX = buttonX + (buttonWidth - textWidth) / 2;

      this.vga.drawText(this.buttons[i].text, textX, buttonY + 20, "#000000");
    }
  }
}
