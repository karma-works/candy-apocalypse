<template>
  <div id="app">
    <Doom />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Doom from './doom/Doom.vue'

@Component({
  components: {
    Doom,
  },
})
export default class App extends Vue {
}
</script>

<style lang="scss">
#app {
  display: flex;
  justify-content: center;
  height: 100%;
  align-items: center;
}
</style>
