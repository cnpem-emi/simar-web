<template>
  <v-dialog v-model="dialog" max-width="400px">
    <template v-slot:activator="{ on, attrs }">
      <v-container style="display: inline; padding-left: 0; padding-right: 0">
        <v-btn
          text
          light
          v-bind="attrs"
          v-on="on"
          style="padding-left: 0; padding-right: 0"
          small
          plain
          ><span class="text-truncate" style="max-width: 70px">{{
            name
          }}</span></v-btn
        >
      </v-container>
    </template>
    <v-card>
      <v-card-title
        ><span class="text-h5">Change Outlet Name</span></v-card-title
      >
      <v-divider />
      <v-card-text style="padding-top: 20px; padding-bottom: 0">
        <span
          >This outlet name will be used across SIMAR's interface, only visible
          to you</span
        >
        <v-spacer />
        <v-text-field v-model="new_name" :placeholder="name" dense />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn color="grey darken-1" text @click="dialog = false">
          Close
        </v-btn>
        <v-btn
          color="blue darken-1"
          text
          @click="
            $emit('update-name', new_name);
            dialog = false;
          "
        >
          Apply
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mdiPencil } from "@mdi/js";

export default {
  props: ["name", "index"],
  data: function () {
    return {
      mdiPencil,
      new_name: name,
      dialog: false,
    };
  },
};
</script>