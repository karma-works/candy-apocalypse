import { Component, Prop, Vue, Watch } from 'vue-property-decorator'
import { Params } from '@/doom/doom/params'
import { Skill } from '@/doom/doom/mode'
import { fs } from '@/doom/system/fs'

@Component
export default class extends Vue {
  @Prop() value!: Partial<Params>

  @Watch('value', { immediate: true })
  valueChange(p: Partial<Params>): void {
    if (p.skill !== undefined) {
      this.skill = p.skill
      this.autoStart = true
    }
    if (p.episode !== undefined) {
      this.episode = p.episode
      this.autoStart = true
    }
    if (p.map !== undefined) {
      this.map = p.map
      this.autoStart = true
    }
    if (p.noMonsters !== undefined) {
      this.noMonsters = p.noMonsters
      this.autoStart = true
    }
    if (p.respawn !== undefined) {
      this.respawn = p.respawn
      this.autoStart = true
    }
    if (p.fast !== undefined) {
      this.fast = p.fast
      this.autoStart = true
    }

    this.iwad = p.iwad || ''
    this.pwad = p.pwads && p.pwads[0] || ''
    this.config = p.config || ''

    this.playDemo = p.playDemo || ''
    this.record = p.record || ''
  }

  autoStart = false
  skill = Skill.Medium
  skills = [
    { text: 'Baby', value: Skill.Baby },
    { text: 'Easy', value: Skill.Easy },
    { text: 'Medium', value: Skill.Medium },
    { text: 'Hard', value: Skill.Hard },
    { text: 'Nightmare', value: Skill.Nightmare },
  ]
  episode: number | string = 1
  map: number | string = 1

  noMonsters = false
  respawn = false
  fast = false

  iwad = ''
  pwad = ''
  config = 'default.cfg'

  playDemo = ''
  record = ''

  play(): void {
    const p: Partial<Params> = {}

    if (this.autoStart) {
      p.skill = this.skill
      p.episode = Number(this.episode)
      p.map = Number(this.map)

      p.noMonsters = this.noMonsters
      p.respawn = this.respawn
      p.fast = this.fast
    }

    if (this.iwad) {
      p.iwad = this.iwad
    }
    if (this.pwad) {
      p.pwads = [ this.pwad ]
    }
    if (this.config) {
      p.config = this.config
    }
    p.playDemo = this.playDemo
    p.record = this.record

    this.$emit('input', p)
  }

  async upload(file: File, input: 'playDemo' | 'iwad' | 'pwad' | 'config'): Promise<void> {
    const buf = await file.arrayBuffer()
    fs.write(file.name, buf)

    this[input] = file.name
  }
}
