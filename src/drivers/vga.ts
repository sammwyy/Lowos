export class VGADriver {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  public width: number = 800;
  public height: number = 600;

  constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.canvas.style.display = "block";
    this.canvas.style.margin = "0 auto";
    this.canvas.style.backgroundColor = "#000";

    const ctx = this.canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get 2D context");
    this.ctx = ctx;

    // Clear screen initially
    this.clear();

    document.getElementById("screen")?.appendChild(this.canvas);
  }

  clear(color: string = "#000000") {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawLine(x1: number, y1: number, x2: number, y2: number, color: string) {
    this.ctx.strokeStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
  }

  drawPixel(x: number, y: number, color: string) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, 1, 1);
  }

  drawRect(x: number, y: number, width: number, height: number, color: string) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, width, height);
  }

  drawText(
    text: string,
    x: number,
    y: number,
    color: string = "#FFFFFF",
    font: string = "16px monospace"
  ) {
    this.ctx.font = font;
    this.ctx.fillStyle = color;
    this.ctx.fillText(text, x, y);
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  measureText(text: string): { width: number; height: number } {
    return { width: this.ctx.measureText(text).width, height: 16 }; // Approximate height
  }
}
