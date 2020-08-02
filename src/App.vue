<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title>Doom</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn icon v-bind:href="sourceUrl">
        <v-icon>mdi-gitlab</v-icon>
      </v-btn>

    </v-app-bar>

    <v-main>
      <router-view/>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class extends Vue {
  sourceUrl = process.env.CI_PROJECT_URL
}
</script>