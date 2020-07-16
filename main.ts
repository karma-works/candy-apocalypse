import { Doom } from './src/doom/doom'
// import { Skill } from './src/global/doomdef'

async function main() {
  const doom = new Doom({
    wad: './data/doom.wad',
    dev: true,
    // skill: Skill.Medium,
    // episode: 1,
    // map: 1,
  })

  await doom.init()
}

main()
