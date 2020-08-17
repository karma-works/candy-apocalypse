<template>
  <v-card>
    <ConfigurationEditor :name="$route.params.name" />
  </v-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import ConfigurationEditor from '../components/configuration-editor.vue'

@Component({
  components: {
    ConfigurationEditor,
  }
})
export default class Configuration extends Vue { }

</script>>
