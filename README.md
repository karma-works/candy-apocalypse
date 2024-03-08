# DOOM.ts

**doom.ts** is a port of the classic game DOOM, implemented in TypeScript.
It is based on the original source code available [here](https://github.com/id-Software/DOOM).

An online version of doom.ts is available [here](https://tchandelle.gitlab.io/doom.ts/).

## Features

- **Playable Game**. Source code in [./src/doom/](./src/doom/)
- **Modern THREE.js Renderer Engine**: Play with either the legacy 2.5D rendering engine, or a modern 3D engine. Source code in [./src/doom/webgl/](./src/doom/webgl/)
- **WAD Explorer**: Source code in [./src/WadExplorer/](./src/WadExplorer/)

## Missing Features

- **Compatibility test with other WAD**: Currently only tested on DOOM v1.9, other version might actually work.
- Deathmatch
- Music

### In WAD Explorer

- Sprites viewer

## Usage

To run the game locally, follow these steps:

1. Install dependencies:

```sh
yarn install
```

2. Start the development server:

```sh
yarn run dev
```

3. Open your browser and visit [http://localhost:5173](http://localhost:5173) to play doom.ts.


## Disclaimer

This project is a fan-made port of the original DOOM game and is not affiliated with or endorsed by id Software or ZeniMax Media Inc. All rights to the original DOOM source code belong to ZeniMax Media Inc.
