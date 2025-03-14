export class KeyboardDriver {
  private keyState: Map<string, boolean> = new Map();
  private keyPressCallbacks: ((key: string) => void)[] = [];

  constructor() {
    window.addEventListener("keydown", (e) => this.handleKeyDown(e));
    window.addEventListener("keyup", (e) => this.handleKeyUp(e));
  }

  private handleKeyDown(e: KeyboardEvent) {
    this.keyState.set(e.key, true);
    for (const callback of this.keyPressCallbacks) {
      callback(e.key);
    }
  }

  private handleKeyUp(e: KeyboardEvent) {
    this.keyState.set(e.key, false);
  }

  isKeyPressed(key: string): boolean {
    return this.keyState.get(key) || false;
  }

  onKeyPress(callback: (key: string) => void) {
    this.keyPressCallbacks.push(callback);
    return this.keyPressCallbacks.length - 1;
  }

  removeKeyPressListener(id: number) {
    this.keyPressCallbacks.splice(id, 1);
  }
}
