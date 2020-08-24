<template>
  <v-card>
    <v-container fluid>
      <v-row justify="space-around">
        <v-col>
          <FilesTable :parent="$route.params.parent"
            @selectedChange="selected = $event" />
        </v-col>
        <div v-if="selected">
          <PatchViewer
            :wad="wad" :lump="lump" />
        </div>
      </v-row>
    </v-container>
  </v-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import FilesTable from '../components/files-table.vue'
import PatchViewer from '../components/viewers/patch-viewer.vue'
import { ExtendedFileInfo } from '@/components/files-table'

@Component({
  components: {
    FilesTable,
    PatchViewer,
  }
})
export default class FilesListing extends Vue {
  selected: ExtendedFileInfo | null = null

  get wad(): string {
    if (this.selected) {
      return this.selected.id.split('#')[0]
    }
    return ''
  }
  get lump(): number {
    if (this.selected) {
      return parseInt(this.selected.id.split('#')[1], 10)
    }
    return -1
  }
}

</script>>
