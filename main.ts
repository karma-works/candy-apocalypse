import { Doom } from './src/doom/doom'
// import { Skill } from './src/global/doomdef'

async function main() {
  const doom = new Doom()

  await doom.init({
    dev: true,
    // skill: Skill.Medium,
    // episode: 1,
    // map: 1,
  })
}

main()
