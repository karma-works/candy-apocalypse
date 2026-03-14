export type KeyState = "pressed" | "held" | "released" | "up";

export class InputManager {
  private canvas: HTMLCanvasElement | null = null;
  private keyStates: Map<string, KeyState> = new Map();
  private mouseButtonStates: Map<number, KeyState> = new Map();
  private mouseDelta = { x: 0, y: 0 };
  private pointerLocked = false;

  initialize(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;

    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    canvas.addEventListener("mousedown", this.onMouseDown);
    canvas.addEventListener("mouseup", this.onMouseUp);
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

  private onMouseDown = (e: MouseEvent): void => {
    const state = this.mouseButtonStates.get(e.button);
    if (!state || state === "up" || state === "released") {
      this.mouseButtonStates.set(e.button, "pressed");
    }
  };

  private onMouseUp = (e: MouseEvent): void => {
    this.mouseButtonStates.set(e.button, "released");
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

  isMouseButtonPressed(button: number): boolean {
    return this.mouseButtonStates.get(button) === "pressed";
  }

  isMouseButtonHeld(button: number): boolean {
    const state = this.mouseButtonStates.get(button);
    return state === "pressed" || state === "held";
  }

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
    this.mouseButtonStates.forEach((state, btn) => {
      if (state === "pressed") {
        this.mouseButtonStates.set(btn, "held");
      } else if (state === "released") {
        this.mouseButtonStates.set(btn, "up");
      }
    });
  }

  dispose(): void {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    if (this.canvas) {
      this.canvas.removeEventListener("mousedown", this.onMouseDown);
      this.canvas.removeEventListener("mouseup", this.onMouseUp);
      this.canvas.removeEventListener("mousemove", this.onMouseMove);
    }
    document.removeEventListener("pointerlockchange", this.onPointerLockChange);
  }
}
