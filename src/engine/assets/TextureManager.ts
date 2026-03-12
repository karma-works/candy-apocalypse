import { Scene, Texture, DynamicTexture } from "@babylonjs/core";

export class TextureManager {
    private static instance: TextureManager | null = null;
    private scene: Scene;
    private textures: Map<string, Texture> = new Map();
    private scaleFactor = 2; // Render at 2x resolution for crispness

    constructor(scene: Scene) {
        this.scene = scene;
        TextureManager.instance = this;
    }

    static getInstance(): TextureManager | null {
        return TextureManager.instance;
    }

    /**
     * Loads the SVG spritemap, parses all <symbol> tags,
     * rendering them into rasterized BabylonJS Textures.
     *
     * @param path The URL path to the SVG spritemap (e.g. '/assets/spritemap.svg')
     */
    async loadSpritemap(path: string): Promise<void> {
        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`Failed to load spritemap: ${response.statusText}`);
            }

            const svgText = await response.text();
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgText, "image/svg+xml");

            const symbols = svgDoc.querySelectorAll("symbol");
            if (symbols.length === 0) {
                console.warn("No <symbol> elements found in SVG spritemap.");
                return;
            }

            for (const symbol of Array.from(symbols)) {
                const id = symbol.getAttribute("id");
                if (!id) continue;

                // Extract viewBox to determine aspect ratio and dimensions
                const viewBox = symbol.getAttribute("viewBox");
                let width = 64;
                let height = 64;

                if (viewBox) {
                    const parts = viewBox.split(" ").map(Number);
                    if (parts.length === 4) {
                        width = parts[2];
                        height = parts[3];
                    }
                }

                // Construct a standalone standalone SVG document from the symbol contents
                // This is necessary because we can't draw a <symbol> directly to a canvas easily
                const svgContent = symbol.innerHTML;
                const standaloneSvg = `
          <svg xmlns="http://www.w3.org/2000/svg" 
               viewBox="${viewBox || '0 0 64 64'}" 
               width="${width * this.scaleFactor}" 
               height="${height * this.scaleFactor}">
            ${svgContent}
          </svg>
        `.trim();

                // Convert the standalone SVG into a data URL
                const blob = new Blob([standaloneSvg], { type: "image/svg+xml;charset=utf-8" });
                const url = URL.createObjectURL(blob);

                // Load the image asynchronously
                const img = new Image();
                img.crossOrigin = "anonymous";

                await new Promise<void>((resolve, reject) => {
                    img.onload = () => {
                        // Provide a DynamicTexture where we can draw the image
                        // We use DynamicTexture because it wraps a canvas which we can draw into
                        const texture = new DynamicTexture(
                            `tex_${id}`,
                            { width: width * this.scaleFactor, height: height * this.scaleFactor },
                            this.scene,
                            false
                        );

                        texture.hasAlpha = true;
                        const ctx = texture.getContext();

                        // Clear to transparent
                        ctx.clearRect(0, 0, width * this.scaleFactor, height * this.scaleFactor);

                        // Draw the rasterized SVG onto the canvas
                        ctx.drawImage(img, 0, 0, width * this.scaleFactor, height * this.scaleFactor);
                        texture.update();

                        this.textures.set(id, texture);
                        URL.revokeObjectURL(url);
                        resolve();
                    };
                    img.onerror = (e) => {
                        console.error(`Failed to load SVG symbol ${id} into image.`, e);
                        URL.revokeObjectURL(url);
                        resolve(); // Resolve anyway to not block loading everything else
                    };
                    img.src = url;
                });
            }

            console.log(`Loaded ${this.textures.size} SVG textures successfully.`);
        } catch (e) {
            console.error("Error loading SVG spritemap:", e);
        }
    }

    /**
     * Gets a pre-rasterized texture by its symbol ID.
     * Returns null if not found.
     */
    getTexture(id: string): Texture | null {
        return this.textures.get(id) || null;
    }

    /**
     * Cleans up all generated textures to free memory.
     */
    dispose(): void {
        for (const texture of this.textures.values()) {
            texture.dispose();
        }
        this.textures.clear();
    }
}
