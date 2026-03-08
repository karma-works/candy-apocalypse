export type KeyState = "pressed" | "held" | "released" | "up";

export class InputManager {
  private canvas: HTMLCanvasElement | null = null;
  private keyStates: Map<string, KeyState> = new Map();
  private mouseDelta = { x: 0, y: 0 };
  private pointerLocked = false;

  initialize(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;

    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    canvas.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("pointerlockchange", this.onPointerLockChange);

    canvas.addEventListener("click", () => {
      if (!this.pointerLocked) {
        canvas.requestPointerLock();
      }
    });
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    if (!this.keyStates.has(e.code) || this.keyStates.get(e.code) === "up") {
      this.keyStates.set(e.code, "pressed");
    }
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    this.keyStates.set(e.code, "released");
  };

  private onMouseMove = (e: MouseEvent): void => {
    if (this.pointerLocked) {
      this.mouseDelta.x += e.movementX;
      this.mouseDelta.y += e.movementY;
    }
  };

  private onPointerLockChange = (): void => {
    this.pointerLocked = document.pointerLockElement === this.canvas;
  };

  isKeyPressed(key: string): boolean {
    return this.keyStates.get(key) === "pressed";
  }

  isKeyHeld(key: string): boolean {
    const state = this.keyStates.get(key);
    return state === "pressed" || state === "held";
  }

  isKeyReleased(key: string): boolean {
    return this.keyStates.get(key) === "released";
  }

  getMouseDelta(): { x: number; y: number } {
    const delta = { ...this.mouseDelta };
    this.mouseDelta.x = 0;
    this.mouseDelta.y = 0;
    return delta;
  }

  isPointerLocked(): boolean {
    return this.pointerLocked;
  }

  update(): void {
    this.keyStates.forEach((state, key) => {
      if (state === "pressed") {
        this.keyStates.set(key, "held");
      } else if (state === "released") {
        this.keyStates.set(key, "up");
      }
    });
  }

  dispose(): void {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    if (this.canvas) {
      this.canvas.removeEventListener("mousemove", this.onMouseMove);
    }
    document.removeEventListener("pointerlockchange", this.onPointerLockChange);
  }
}
