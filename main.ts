import { Doom } from './src/doom/doom'

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

  const doom = new Doom({
    screen,
    wad: './data/doom.wad',
    dev: true,
    // skill: Skill.Medium,
    // episode: 1,
    // map: 1,
  })

  await doom.init()
}

main()
