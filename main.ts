import { Wad } from './src/wad/wad'

function main() {
  const wad = new Wad()

  wad.addFile('./data/Doom.wad')
}

main()
