import { Doom } from './src/doom/doom'
import { fs } from './src/system/fs'

async function main() {
  const screen = document.getElementById('screen') as HTMLCanvasElement
  if (screen === null) {
    throw 'screen = null'
  }
  const screenParent = screen.parentElement as HTMLElement

  function resize() {
    const horizontalRatio = screenParent.clientWidth / screen.width
    const verticallRatio = screenParent.clientHeight / screen.height
    const ratio = Math.min(horizontalRatio, verticallRatio)

    screen.style.transform = `scale3d(${ratio}, ${ratio}, 1)`
  }

  window.addEventListener('resize', () => resize())
  resize()

  await fs.write('doom1.wad', './data/doom1.wad')

  const doom = new Doom({
    screen,
    wad: 'doom1.wad',
    // skill: Skill.Medium,
    // episode: 1,
    // map: 1,
  })

  await doom.init()
}

main()
