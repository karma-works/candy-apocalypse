<template>
  <v-container>
    <v-simple-table>
      <template v-slot:default>
        <thead>
          <tr>
            <th>Command</th>
            <th>Keybinding</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cmd in keyBindings" :key="cmd.name"
              @dblclick="setPendingKey(cmd.name)"
              v-bind:class="{ pending: cmd.name === pending }">
            <td>{{ cmd.label }}</td>
            <td>{{ getKeyLabel(cmd.key) }}</td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>

    <v-btn
      color="success"
      @click="save"
    >save</v-btn>

  </v-container>
</template>

<script lang="ts" src="./configuration-editor"></script>

<style lang="scss" scoped>
  tr {
    user-select: none;

    &.pending {
      font-style: italic;
    }
  }
</style>