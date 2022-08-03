<template>
  <v-container fluid>
    <v-toolbar src="@/assets/back.png" dark color="blue darken-3" class="mb-1">
      <template v-if="$vuetify.breakpoint.smAndDown">
        <v-btn icon v-on:click="dropdown = !dropdown">
          <v-icon>{{ mdiMenu }}</v-icon>
        </v-btn>
      </template>
      <v-text-field
        v-on:input="$emit('search', $event)"
        clearable
        flat
        solo-inverted
        hide-details
        :prepend-inner-icon="mdiMagnify"
        label="Search"
      ></v-text-field>
      <template v-if="$vuetify.breakpoint.mdAndUp">
        <v-spacer />
        <v-select
          v-on:change="$emit('sort', $event)"
          flat
          solo-inverted
          hide-details
          :items="props.settings.keys"
          :prepend-inner-icon="mdiSort"
          label="Sort by"
        ></v-select>
        <v-spacer />
        <v-btn-toggle v-on:change="$emit('desc', $event)" mandatory>
          <v-btn large depressed color="blue" :value="false" align="start">
            <v-icon>{{ mdiTrendingUp }}</v-icon>
          </v-btn>
          <v-btn large depressed color="blue" :value="true">
            <v-icon>{{ mdiTrendingDown }}</v-icon>
          </v-btn>
        </v-btn-toggle>
      </template>
      <v-spacer />
      <NotificationDropdown style="flex-grow: 0" />
      <LoginMenu style="flex-grow: 0" v-on="$listeners" />
    </v-toolbar>
    <v-toolbar
      v-if="dropdown && $vuetify.breakpoint.smAndDown"
      dark
      color="blue darken-3"
      class="mb-1"
    >
      <v-select
        v-on:change="$emit('sort', $event)"
        flat
        solo-inverted
        hide-details
        :items="props.settings.keys"
        :prepend-inner-icon="mdiMagnify"
        label="Sort by"
      ></v-select>
      <v-spacer />
      <v-btn
        large
        depressed
        color="blue"
        v-show="!props.settings.sort_desc"
        v-on:click="$emit('desc', true)"
      >
        <v-icon>{{ mdiTrendingDown }}</v-icon>
      </v-btn>
      <v-btn
        large
        depressed
        color="blue"
        v-show="props.settings.sort_desc"
        align="start"
        v-on:click="$emit('desc', false)"
      >
        <v-icon>{{ mdiTrendingUp }}</v-icon>
      </v-btn>
    </v-toolbar>
  </v-container>
</template>

<script setup lang="ts">
import LoginMenu from "./LoginMenu";
import NotificationDropdown from "./NotificationDropdown";

import {
  mdiTrendingUp,
  mdiTrendingDown,
  mdiMagnify,
  mdiSort,
  mdiMenu,
} from "@mdi/js";
import { ref } from "vue";
import Settings from "@/models/settings";

const props = defineProps<{
  settings: Settings;
}>();

const dropdown = ref(false);
</script>
