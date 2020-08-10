<template>
  <v-card>
    <StartupOptions :value="params" @input="restartDoom($event)"/>
  </v-card>
</template>

<script lang="ts">
import { Component, Inject, Vue } from 'vue-property-decorator'
import StartupOptions from '@/components/startup-options.vue';
import Doom from './doom.vue';
import { Params } from '@/doom/doom/params';

@Component({
  components: {
    StartupOptions,
  },
})
export default class extends Vue {
  params: Partial<Params> = {}

  @Inject('doomGetter') doomGetter!: () => Doom

  restartDoom(p: Partial<Params>): void {
    this.params = p

    const d = this.doomGetter()

    d.restart(p)
  }

}


</script>
