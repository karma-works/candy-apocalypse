import { Doom } from './src/doom/doom'

async function main() {
  const doom = new Doom()

  await doom.init()
}

main()
