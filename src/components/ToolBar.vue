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
          v-model="sort_by"
          :items="this.settings.keys"
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
      <notification-dropdown style="flex-grow: 0"/>
      <login-menu style="flex-grow: 0" v-on="$listeners" />
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
        :items="this.settings.keys"
        :prepend-inner-icon="mdiMagnify"
        label="Sort by"
      ></v-select>
      <v-spacer />
      <v-btn
        large
        depressed
        color="blue"
        v-show="!this.settings.sort_desc"
        v-on:click="$emit('desc', true)"
      >
        <v-icon>{{ mdiTrendingDown }}</v-icon>
      </v-btn>
      <v-btn
        large
        depressed
        color="blue"
        v-show="this.settings.sort_desc"
        align="start"
        v-on:click="$emit('desc', false)"
      >
        <v-icon>{{ mdiTrendingUp }}</v-icon>
      </v-btn>
    </v-toolbar>
  </v-container>
</template>

<script>
import LoginMenu from "./LoginMenu";
import NotificationDropdown from "./NotificationDropdown";

import {
  mdiTrendingUp,
  mdiTrendingDown,
  mdiMagnify,
  mdiSort,
  mdiMenu,
} from "@mdi/js";

export default {
  components: { LoginMenu, NotificationDropdown },
  props: ["settings"],
  data() {
    return {
      filter: {},
      dropdown: false,
      logged: true,
      sort_by: this.settings.sort_by,
      mdiTrendingUp,
      mdiTrendingDown,
      mdiMagnify,
      mdiSort,
      mdiMenu,
    };
  },
};
</script>
