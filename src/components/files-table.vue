<template>
  <v-data-table
    :headers="headers"
    :items="files">
    <template v-slot:[`item.size`]="{ item }">
      {{ formatSize(item.size) }}
    </template>

    <template v-slot:[`item.type`]="{ item }">
      {{ getLabel(item) }}
    </template>

    <template v-slot:[`item.actions`]="{ item }">
      <v-btn icon
        v-if="canPlay(item)"
        link :to="{ path: '/', query: getParam(item)}"
      ><v-icon>mdi-play</v-icon></v-btn>

      <v-btn icon
        v-if="canBrowse(item)"
        link :to="{ params: { parent: item.name }}"
      ><v-icon>mdi-folder-open</v-icon></v-btn>

      <v-btn icon
        @click="download(item)"
      ><v-icon>mdi-download</v-icon></v-btn>

      <v-btn icon
        v-if="canRemove(item)"
        @click="remove(item)"
      ><v-icon>mdi-delete-forever</v-icon></v-btn>
    </template>
  </v-data-table>
</template>

<script lang="ts" src="./files-table"></script>
