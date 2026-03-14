import { afterAll, afterEach, beforeAll } from 'vitest';
import { cleanup } from '@testing-library/react';

// Mock Web Audio API for unit tests
class MockAudioContext {
  createGain() {
    return {
      connect: () => {},
      gain: { value: 1 },
    };
  }

  createBufferSource() {
    return {
      connect: () => {},
      start: () => {},
      stop: () => {},
      buffer: null,
    };
  }

  decodeAudioData() {
    return Promise.resolve({});
  }

  get currentTime() {
    return 0;
  }
}

// Mock canvas for tests
class MockCanvasRenderingContext2D {
  fillRect() {}
  clearRect() {}
  getImageData() {
    return { data: new Uint8ClampedArray(4) };
  }
  putImageData() {}
  createImageData() {
    return { data: new Uint8ClampedArray(4) };
  }
  setTransform() {}
  drawImage() {}
  save() {}
  restore() {}
  scale() {}
  rotate() {}
  translate() {}
  transform() {}
  beginPath() {}
  moveTo() {}
  lineTo() {}
  stroke() {}
  fill() {}
  arc() {}
  rect() {}
  clip() {}
  closePath() {}
}

// Setup global mocks
beforeAll(() => {
  global.AudioContext = MockAudioContext as any;
  global.webkitAudioContext = MockAudioContext as any;

  // Mock canvas
  HTMLCanvasElement.prototype.getContext = function(contextId: string) {
    if (contextId === '2d') {
      return new MockCanvasRenderingContext2D() as any;
    }
    return null;
  };

  // Mock pointer lock
  Object.defineProperty(document, 'pointerLockElement', {
    writable: true,
    value: null,
  });

  Object.defineProperty(document, 'exitPointerLock', {
    writable: true,
    value: () => {},
  });

  Object.defineProperty(Element.prototype, 'requestPointerLock', {
    writable: true,
    value: () => {},
  });
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Global test utilities
declare global {
  var AudioContext: typeof MockAudioContext;
  var webkitAudioContext: typeof MockAudioContext;
}
