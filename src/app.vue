<template>
  <v-app>
    <v-navigation-drawer app
      :expand-on-hover="true"
      :mini-variant="true"
      :mobile-breakpoint="0">
      <v-list
        dense
        nav>
        <v-list-item link to="/">
          <v-list-item-icon><v-icon>mdi-play</v-icon></v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Play parameters</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item link to="/files-listing">
          <v-list-item-icon><v-icon>mdi-file-multiple</v-icon></v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Files listing</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-list-item link to="/configuration/default.cfg">
          <v-list-item-icon><v-icon>mdi-cog</v-icon></v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Configuration</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

      </v-list>
    </v-navigation-drawer>

    <v-app-bar app>
      <v-toolbar-title>Doom</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn icon v-on:click="sound = !sound">
        <v-icon>
          {{ sound ? 'mdi-volume-high' : 'mdi-volume-off' }}
        </v-icon>
      </v-btn>

      <v-btn icon v-bind:href="sourceUrl">
        <v-icon>mdi-gitlab</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <router-view/>
      </v-container>

      <Doom ref="doomInst"
        :sound="sound"
        @soundChange="sound = $event"
      ></Doom>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Component, Provide, Vue } from 'vue-property-decorator'
import Doom from './views/doom.vue'

@Component({
  components: {
    Doom,
  },
})
export default class extends Vue {
  $refs!: {
    doomInst: Doom
  }

  @Provide('doomGetter') getDoom(): Doom {
    return this.$refs.doomInst
  }

  sourceUrl = process.env.VUE_APP_PROJECT_URL || ''

  sound = false
}
</script>