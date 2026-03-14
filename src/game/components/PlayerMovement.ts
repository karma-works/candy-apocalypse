import { Component } from '../entities/Entity';
import { FreeCamera, Vector3 } from '@babylonjs/core';
import type { InputManager } from '../../engine/input/InputManager';

export class PlayerMovement extends Component {
  speed = 5;
  jumpForce = 8;
  sensitivity = 0.002;

  private camera: FreeCamera | null = null;
  private inputManager: InputManager | null = null;
  private yaw = 0;
  private pitch = 0;
  private isGrounded = true;

  attachToCamera(camera: FreeCamera, inputManager: InputManager): void {
    this.camera = camera;
    this.inputManager = inputManager;
  }

  update(deltaTime: number): void {
    if (
      !this.camera ||
      !this.inputManager ||
      !this.inputManager.isPointerLocked()
    ) {
      return;
    }

    const mouseDelta = this.inputManager.getMouseDelta();
    this.yaw += mouseDelta.x * this.sensitivity;
    this.pitch -= mouseDelta.y * this.sensitivity;
    this.pitch = Math.max(
      -Math.PI / 2 + 0.01,
      Math.min(Math.PI / 2 - 0.01, this.pitch),
    );

    const direction = new Vector3(
      Math.sin(this.yaw) * Math.cos(this.pitch),
      Math.sin(this.pitch),
      Math.cos(this.yaw) * Math.cos(this.pitch),
    );

    this.camera.setTarget(this.camera.position.add(direction));

    const forward = new Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw));
    const right = new Vector3(
      Math.sin(this.yaw + Math.PI / 2),
      0,
      Math.cos(this.yaw + Math.PI / 2),
    );

    const velocity = Vector3.Zero();

    if (this.inputManager.isKeyHeld('KeyW')) {
      velocity.addInPlace(forward);
    }
    if (this.inputManager.isKeyHeld('KeyS')) {
      velocity.subtractInPlace(forward);
    }
    if (this.inputManager.isKeyHeld('KeyA')) {
      velocity.subtractInPlace(right);
    }
    if (this.inputManager.isKeyHeld('KeyD')) {
      velocity.addInPlace(right);
    }

    if (velocity.length() > 0) {
      velocity.normalize();
      velocity.scaleInPlace(this.speed * deltaTime);
      this.camera.cameraDirection.addInPlace(velocity);
    }
  }

  setPosition(x: number, y: number, z: number): void {
    if (this.camera) {
      this.camera.position.set(x, y, z);
    }
  }
}
