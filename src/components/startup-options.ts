import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
import { fs } from '@/doom/system/fs'
import { Skill } from '@/doom/doom/mode'
import { Params } from '@/doom/doom/params'

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

    this.wad = p.wad || ''

    this.playDemo = p.playDemo || ''
  }

  autoStart = false
  skill = Skill.Medium
  skills = [
    { text: 'Baby', value: Skill.Baby },
    { text: 'Easy', value: Skill.Easy },
    { text: 'Medium', value: Skill.Medium },
    { text: 'Hard', value: Skill.Hard },
    { text: 'Nightmare', value: Skill.Nightmare }
  ]
  episode = 1
  map = 1

  noMonsters = false
  respawn = false
  fast = false

  wad = ''

  playDemo = ''
  record = ''

  play(): void {
    const p: Partial<Params> = {}

    if (this.autoStart) {
      p.skill = this.skill
      p.episode = this.episode
      p.map = this.map

      p.noMonsters = this.noMonsters
      p.respawn = this.respawn
      p.fast = this.fast
    }

    if (this.wad) {
      p.wad = this.wad
    }
    p.playDemo = this.playDemo

    this.$emit('input', p)
  }

  async upload(file: File, input: 'playDemo' | 'wad'): Promise<void> {
    const buf = await file.arrayBuffer()
    fs.write(file.name, buf)

    this[input] = file.name
  }
}
