import { Component, Prop, Vue } from 'vue-property-decorator'
import { AgnosticDefaults } from '@/doom/misc/defaults'
import { RenderingMode } from '@/doom/rendering/rendering-interface'
import { ScanCode } from '@/doom/interfaces/scancodes'

interface KeyBinding {
  name: string
  label: string
  key: number
}

@Component
export default class FilesTable extends Vue {
  @Prop() name!: string

  savedWarning = false

  keyBindings: KeyBinding[] = [
    { name: 'key_left', label: 'Look left', key: 0 },
    { name: 'key_right', label: 'Look right', key: 0 },
    { name: 'key_up', label: 'Forward', key: 0 },
    { name: 'key_down', label: 'Backward', key: 0 },
    { name: 'key_strafeleft', label: 'Strafe left', key: 0 },
    { name: 'key_straferight', label: 'Strafe right', key: 0 },
    { name: 'key_fire', label: 'Fire', key: 0 },
    { name: 'key_use', label: 'Use', key: 0 },
    { name: 'key_strafe', label: 'Strafe', key: 0 },
    { name: 'key_speed', label: 'Run', key: 0 },
  ]

  private defaults!: AgnosticDefaults

  async mounted(): Promise<void> {
    this.defaults = new AgnosticDefaults()
    await this.defaults.load(this.name)

    Object.keys(this.defaults.defaults).forEach(k => {
      const keyBinding = this.keyBindings.find(({ name }) => name === k)
      const value = this.defaults.get(k)
      if (keyBinding && typeof value === 'number') {
        keyBinding.key = value
      }
    })

    const width = this.defaults.get('resolution_width')
    const height = this.defaults.get('resolution_height')
    const scale = this.defaults.get('resolution_scale')
    if (typeof width === 'number' &&
      typeof height === 'number' &&
      typeof scale === 'number'
    ) {
      this.resolution = [ width, height, scale ]
    }
    const renderingMode = this.defaults.get('rendering_mode')
    if (typeof renderingMode === 'number') {
      this.renderingMode = renderingMode
    }
  }

  async save(): Promise<void> {
    this.keyBindings.forEach(k => {
      this.defaults.set(k.name, k.key)
    })

    this.defaults.set('resolution_width', this.resolution[0])
    this.defaults.set('resolution_height', this.resolution[1])
    this.defaults.set('resolution_scale', this.resolution[2])
    this.defaults.set('rendering_mode', this.renderingMode)

    await this.defaults.save()

    this.savedWarning = true
  }

  getKeyLabel(key: number): string {
    let code: string
    switch (key) {
    case 0:
      code = '<undefined>'
      break
    case ScanCode.ControlLeft:
      code = 'Control'
      break
    case ScanCode.AltLeft:
      code = 'Alt'
      break
    case ScanCode.ShiftLeft:
    case ScanCode.ShiftRight:
      code = 'Shift'
      break
    default:
      code = ScanCode[key]
      break
    }

    if (code) {
      return code
    } else {
      return `<${key}>`
    }
  }

  pending = ''
  setPendingKey(k: string): void {
    this.pending = k

    document.addEventListener('keydown', (ev) => {
      if (this.pending === k) {
        this.setKey(k, ev.code)
      }
    }, { once: true })
  }

  setKey(name: string, keyCode: string): void {
    let key = ScanCode[keyCode as keyof typeof ScanCode]
    if (key === ScanCode.ShiftLeft) {
      key = ScanCode.ShiftRight
    }

    let keyBinding = this.keyBindings.find(k => k.key === key)
    if (keyBinding !== undefined) {
      keyBinding.key = 0
    }

    keyBinding = this.keyBindings.find(k => k.name === name)
    if (keyBinding === undefined) {
      return
    }

    keyBinding.key = key
    this.pending = ''
  }

  resolutions: [number, number, number][] = [
    [ 320, 240, 1 ],
    [ 640, 480, 2 ],
    [ 800, 600, 2 ],
    [ 1024, 768, 3 ],
    [ 1400, 1050, 4 ],

    [ 426, 240, 1 ],
    [ 853, 480, 2 ],
    [ 1600, 900, 3 ],
    [ 1920, 1080, 4 ],
  ]

  resolution: [number, number, number] = [ 320, 240, 1 ]

  formatResolution(resolution: [number, number, number]): string {
    return `${resolution[0]}x${resolution[1]} (x${resolution[2]})`
  }

  renderingModes = [
    { text: 'Legacy', value: RenderingMode.Legacy },
    { text: 'WebGL', value: RenderingMode.WebGL },
  ]
  renderingMode = RenderingMode.Legacy
}
