<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title>Doom</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn icon v-on:click="toggleSound">
        <v-icon>mdi-volume-source</v-icon>
      </v-btn>

      <v-btn icon v-bind:href="sourceUrl">
        <v-icon>mdi-gitlab</v-icon>
      </v-btn>

    </v-app-bar>

    <v-main>
      <v-container fluid>
        <router-view/>
      </v-container>
    </v-main>

    <Doom ref="doomInst"></Doom>
  </v-app>
</template>

<script lang="ts">
import { Component, Provide, Vue } from 'vue-property-decorator'
import Doom from './views/doom.vue'

@Component({
  components: {
    Doom,
  }
})
export default class extends Vue {
  $refs!: {
    doomInst: Doom
  }

  @Provide('doomGetter') getDoom(): Doom {
    return this.$refs.doomInst
  }

  sourceUrl = process.env.VUE_APP_PROJECT_URL || ''

  toggleSound(): void {
    this.getDoom().toggleSound()
  }
}
</script>