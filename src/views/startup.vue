<template>
  <v-card>
    <StartupOptions :value="params" @input="restartDoom($event)"/>
  </v-card>
</template>

<script lang="ts">
import { Component, Inject, Vue, Watch } from 'vue-property-decorator'
import StartupOptions from '@/components/startup-options.vue';
import Doom from './doom.vue';
import { Params } from '@/doom/doom/params';
import { Route } from 'vue-router';

@Component({
  components: {
    StartupOptions,
  },
})
export default class extends Vue {
  @Inject('doomGetter') doomGetter!: () => Doom

  @Watch('$route') routeChange(r: Route): void {
    this.updateParams()
  }

  mounted(): void {
    this.updateParams()
  }

  params: Partial<Params> = {}
  updateParams(): void {
    this.params = {
      ...this.doomGetter().params,
      ...this.$route.query,
    }
  }

  restartDoom(p: Partial<Params>): void {
    const d = this.doomGetter()

    d.params = { ...p }
    d.restart()
  }

}


</script>
