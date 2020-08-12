<template>
  <v-form>
    <v-container>
      <v-row justify="space-around">
        <v-col cols="12">
          <header> Auto-start </header>
        </v-col>

        <v-switch class="mx-2"
          v-model="autoStart">
        </v-switch>

        <v-text-field class="mx-2"
          v-model="episode"
          @change="autoStart = true"
          type="number"
          inputmode="numeric"
          label="Episode"
        ></v-text-field>
        <v-text-field class="mx-2"
          v-model="map"
          @change="autoStart = true"
          type="number"
          inputmode="numeric"
          label="Map"
        ></v-text-field>

        <v-col cols="12">
          <header> Difficulty </header>
        </v-col>

        <v-select class="mx-2"
          v-model="skill"
          @change="autoStart = true"
          :items="skills"
          label="Skill"
        ></v-select>

        <v-switch class="mx-2"
          v-model="noMonsters"
          @change="autoStart = true"
          label="No monsters"
        ></v-switch>

        <v-switch class="mx-2"
          v-model="respawn"
          @change="autoStart = true"
          :disabled="true"
          label="Respawn monsters"
        ></v-switch>

        <v-switch class="mx-2"
          v-model="fast"
          @change="autoStart = true"
          label="Fast monster"
        ></v-switch>

        <v-col cols="12">
          <header> Version </header>
        </v-col>

        <v-text-field class="mx-2"
          v-model="wad"
          label="WAD file"
        ></v-text-field>

        <v-file-input class="mx-2"
          hide-input
          @change="upload($event, 'wad')">
        </v-file-input>

        <v-col cols="12">
          <header> Demo </header>
        </v-col>
      
        <v-text-field class="mx-2"
          v-model="playDemo"
          label="Play demo"
        ></v-text-field>

        <v-file-input class="mx-2"
          hide-input
          @change="upload($event, 'playDemo')">
        </v-file-input>

        <v-text-field class="mx-2"
          @change="autoStart = true"
          :disabled="true"
          v-model="record"
          label="Record demo"
        ></v-text-field>

      </v-row>

      <v-btn
        color="success"
        @click="play"
      >Play</v-btn>
    </v-container>
  </v-form>
</template>

<script lang="ts" src="./startup-options"></script>
