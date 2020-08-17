import { Component, Prop, Vue } from 'vue-property-decorator'
import { AgnosticDefaults } from '@/doom/misc/defaults'
import { ScanCode } from '@/doom/interfaces/scancodes'

interface KeyBinding {
  name: string
  label: string
  key: number
}

@Component
export default class FilesTable extends Vue {
  @Prop() name!: string

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
      if (keyBinding) {
        keyBinding.key = this.defaults.get(k)
      }
    })
  }

  async save(): Promise<void> {
    this.keyBindings.forEach(k => {
      this.defaults.set(k.name, k.key)
    })
    await this.defaults.save()
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

}
