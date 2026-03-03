import { CanvasTexture, Texture } from 'three';

export interface SvgSymbol {
    id: string;
    viewBox: string;
    content: string;
}

export class SvgRasterizer {
    private symbols: Map<string, SvgSymbol> = new Map();
    private textureCache: Map<string, Texture> = new Map();
    private initialized = false;

    async init(): Promise<void> {
        if (this.initialized) return;

        try {
            // First try to load the spritemap
            const response = await fetch('/assets/spritemap.svg');
            if (!response.ok) {
                console.warn('SvgRasterizer: Could not load spritemap.svg');
                return;
            }
            const text = await response.text();

            // Parse symbols
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'image/svg+xml');
            const symbolElements = doc.querySelectorAll('symbol');

            symbolElements.forEach(symbol => {
                const id = symbol.getAttribute('id');
                const viewBox = symbol.getAttribute('viewBox') || '0 0 64 64';
                const content = symbol.innerHTML;

                if (id) {
                    this.symbols.set(id.toLowerCase(), { id, viewBox, content });
                }
            });

            console.log(`SvgRasterizer: Loaded ${this.symbols.size} symbols from spritemap.`);
            this.initialized = true;
        } catch (e) {
            console.error('SvgRasterizer: Failed to initialize', e);
        }
    }

    hasSymbol(id: string): boolean {
        return this.symbols.has(id.toLowerCase());
    }

    getTexture(id: string, width: number = 64, height: number = 64): Texture | null {
        const cacheKey = `${id.toLowerCase()}_${width}x${height}`;
        if (this.textureCache.has(cacheKey)) {
            return this.textureCache.get(cacheKey)!;
        }

        const symbol = this.symbols.get(id.toLowerCase());
        if (!symbol) return null;

        // Create standalone SVG document
        const svgStr = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="${symbol.viewBox}" width="${width}" height="${height}">
        ${symbol.content}
      </svg>
    `.trim();

        // Create offscreen canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        // We can't synchronously load an image from a blob/data URI
        // But Three.js allows updating the texture later.
        // We'll create the texture now and update it when the image loads.
        const texture = new CanvasTexture(canvas);
        texture.colorSpace = 'srgb';

        // Create image to trigger SVG rendering
        const img = new Image();
        img.crossOrigin = 'anonymous';
        const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        img.onload = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            texture.needsUpdate = true;
            URL.revokeObjectURL(url);
        };

        img.onerror = (e) => {
            console.error(`SvgRasterizer: Error loading SVG image for ${id}`, e);
            URL.revokeObjectURL(url);
        };

        img.src = url;

        this.textureCache.set(cacheKey, texture);
        return texture;
    }

    getFallbackTexture(type: 'wall' | 'flat' | 'sprite', name: string, width: number = 64, height: number = 64): Texture {
        const cacheKey = `fallback_${type}_${name}_${width}x${height}`;
        if (this.textureCache.has(cacheKey)) {
            return this.textureCache.get(cacheKey)!;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
            ctx.fillStyle = type === 'wall' ? '#ff00ff' : type === 'flat' ? '#00ffff' : '#ffff00';
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = '#000000';
            ctx.font = '10px monospace';
            ctx.fillText(name.substring(0, 6), 2, height / 2);
            ctx.strokeStyle = '#000000';
            ctx.strokeRect(0, 0, width, height);
        }

        const texture = new CanvasTexture(canvas);
        texture.colorSpace = 'srgb';
        this.textureCache.set(cacheKey, texture);
        return texture;
    }
}

export const svgRasterizer = new SvgRasterizer();
