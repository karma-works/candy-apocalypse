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
      <Doom ref="doomInst"></Doom>

      <router-view/>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Doom from './views/Doom.vue'

@Component({
  components: {
    Doom,
  }
})
export default class extends Vue {
  $refs!: {
    doomInst: Doom
  }

  sourceUrl = process.env.VUE_APP_PROJECT_URL

  toggleSound(): void {
    this.$refs.doomInst.toggleSound()
  }
}
</script>