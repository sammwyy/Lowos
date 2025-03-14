export interface MousePosition {
  x: number;
  y: number;
}

export class MouseDriver {
  private position: MousePosition = { x: 0, y: 0 };
  private buttons: boolean[] = [false, false, false]; // Left, middle, right
  private moveCallbacks: ((pos: MousePosition) => void)[] = [];
  private clickCallbacks: ((pos: MousePosition, button: number) => void)[] = [];
  private wheelCallbacks: ((delta: number) => void)[] = [];
  private mouseUpCallbacks: (() => void)[] = [];

  constructor(canvas: HTMLCanvasElement) {
    canvas.addEventListener("mousemove", (e) => this.handleMouseMove(e));
    canvas.addEventListener("mousedown", (e) => this.handleMouseDown(e));
    canvas.addEventListener("mouseup", (e) => this.handleMouseUp(e));
    canvas.addEventListener("wheel", (e) => this.handleWheel(e));

    // Hide cursor inside canvas
    canvas.style.cursor = "none";
  }

  private handleMouseMove(e: MouseEvent) {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    this.position = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    for (const callback of this.moveCallbacks) {
      callback(this.position);
    }
  }

  private handleMouseDown(e: MouseEvent) {
    this.buttons[e.button] = true;

    for (const callback of this.clickCallbacks) {
      callback(this.position, e.button);
    }
  }

  private handleMouseUp(e: MouseEvent) {
    this.buttons[e.button] = false;

    for (const callback of this.clickCallbacks) {
      callback(this.position, e.button);
    }

    for (const callback of this.mouseUpCallbacks) {
      callback();
    }
  }

  private handleWheel(e: WheelEvent) {
    const delta = Math.sign(e.deltaY);

    for (const callback of this.wheelCallbacks) {
      callback(delta);
    }
  }

  getPosition(): MousePosition {
    return { ...this.position };
  }

  isButtonPressed(button: number): boolean {
    return this.buttons[button] || false;
  }

  onMouseMove(callback: (pos: MousePosition) => void) {
    this.moveCallbacks.push(callback);
    return this.moveCallbacks.length - 1;
  }

  onMouseClick(callback: (pos: MousePosition, button: number) => void) {
    this.clickCallbacks.push(callback);
    return this.clickCallbacks.length - 1;
  }

  onMouseWheel(callback: (delta: number) => void) {
    this.wheelCallbacks.push(callback);
    return this.wheelCallbacks.length - 1;
  }

  onMouseUp(callback: () => void) {
    this.mouseUpCallbacks.push(callback);
    return this.mouseUpCallbacks.length - 1;
  }

  removeMouseMoveListener(id: number) {
    this.moveCallbacks.splice(id, 1);
  }

  removeMouseClickListener(id: number) {
    this.clickCallbacks.splice(id, 1);
  }

  removeMouseWheelListener(id: number) {
    this.wheelCallbacks.splice(id, 1);
  }
}
