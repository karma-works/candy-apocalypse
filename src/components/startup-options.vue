<template>
  <v-form>
    <v-container>
      <v-row>
        <v-col cols="12" md="3">
          <v-switch v-model="autoStart" label="Auto-start"></v-switch>
        </v-col>

        <v-col cols="12" md="3">
          <v-select
            v-model="skill"
            :disabled="!autoStart"
            :items="skills"
            label="Skill"
          ></v-select>
        </v-col>

        <v-col cols="12" md="3">
          <v-text-field
            v-model="episode"
            :disabled="!autoStart"
            type="number"
            inputmode="numeric"
            label="Episode"
          ></v-text-field>
        </v-col>

        <v-col cols="12" md="3">
          <v-text-field
            v-model="map"
            :disabled="!autoStart"
            type="number"
            inputmode="numeric"
            label="Map"
          ></v-text-field>
        </v-col>
      </v-row>

      <v-btn
        color="success"
        @click="play"
      >Play</v-btn>
    </v-container>
  </v-form>
</template>

<script lang="ts" src="./startup-options"></script>
