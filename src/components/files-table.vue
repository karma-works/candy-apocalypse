<template>
  <v-data-table
    :headers="headers"
    :items="files">
    <template v-slot:[`item.size`]="{ item }">
      {{ formatSize(item.size) }}
    </template>
  </v-data-table>
</template>

<script lang="ts" src="./files-table"></script>
