<template>
  <v-container>
    <v-select
      v-model="resolution"
      :items="resolutions"
      :item-text="formatResolution"
      :item-value="[]"
      label="Resolution"
    ></v-select>

    <v-select
      v-model="renderingMode"
      :items="renderingModes"
      label="Rendering mode"
    ></v-select>

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


    <v-snackbar app v-model="savedWarning">
      Please restart the game to apply the settings
    </v-snackbar>
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