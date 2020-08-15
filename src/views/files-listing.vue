<template>
  <v-card>
    <FilesTable :parent="$route.params.parent" />
  </v-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import FilesTable from '../components/files-table.vue'

@Component({
  components: {
    FilesTable,
  }
})
export default class FilesListing extends Vue { }

</script>>
