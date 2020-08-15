<template>
  <v-card>
    <StartupOptions :value="$route.query" @input="restartDoom($event)"/>
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
  @Inject('doomGetter') doomGetter!: () => Doom

  restartDoom(p: Partial<Params>): void {
    const d = this.doomGetter()

    d.restart(p)
  }

}


</script>
