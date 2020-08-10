import { Component, Vue, Prop, Watch } from 'vue-property-decorator'
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

  play(): void {
    const p: Partial<Params> = {}

    if (this.autoStart) {
      p.skill = this.skill
      p.episode = this.episode
      p.map = this.map
    }

    this.$emit('input', p)
  }
}
