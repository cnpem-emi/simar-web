<template>
  <v-card>
    <v-card-title class="subheading font-weight-bold">
      {{ item.name }}
      <v-spacer />
      <v-btn icon small fab color="grey" @click="display_archiver"
        ><v-icon>{{ mdiChartAreasplineVariant }}</v-icon></v-btn
      >
      <config-dialog
        v-bind:item="item"
        @update-limit="
          (e) => {
            $emit('update-limit', e);
          }
        "
      />
    </v-card-title>

    <v-divider />

    <v-list dense>
      <v-list-item v-for="(key, index) in filtered_keys" :key="index">
        <v-list-item-content> {{ key }}: </v-list-item-content>

        <v-hover v-slot:default="{ hover }">
          <span>
            <v-slide-x-reverse-transition>
              <notification-toggler
                v-show="
                  (hover ||
                    item.pvs[key].subscribed ||
                    $vuetify.breakpoint.mobile) &&
                  item.pvs[key].value !== '?'
                "
                v-bind:pv="item.pvs[key]"
                @update-sub="$emit('update-sub', key)"
              />
            </v-slide-x-reverse-transition>
            <v-chip
              class="align-end"
              :color="get_pv_color(item, key)"
              text-color="white"
              :href="`https://${internal.url}/archiver-viewer/?pv=${item.pvs[key].name}`"
              target="_blank"
            >
              {{ item.pvs[key].value }}
            </v-chip>
          </span>
        </v-hover>
      </v-list-item>
    </v-list>
    <power-panel
      v-bind:item="item"
      v-bind:limits="{ lo: item.v_lo, hi: item.v_hi }"
    />
  </v-card>
</template>

<script setup lang="ts">
import PowerPanel from "./PowerPanel";
import ConfigDialog from "./ConfigDialog";
import NotificationToggler from "./NotificationToggler";
import { mdiChartAreasplineVariant } from "@mdi/js";
import { defineProps } from "vue";
import { useInternalStore } from "@/stores/internal";
import Item from "@/models/item";

const internal = useInternalStore();

const props = defineProps<{
  item: Item;
  filtered_keys: string[];
}>();

function get_pv_color(item: Item, key: string) {
  const value = item.pvs[key].value;

  if (value === "?") return "gray";

  const m_type = key.charAt(0).toLowerCase();
  const f_value =
    m_type !== "h"
      ? parseFloat(value.substring(0, value.indexOf(" ")))
      : parseFloat(value.substring(0, value.indexOf("%")));

  if (key === "Rack Open" || key == "Leak") {
    return value === "No" ? "green" : "orange";
  }

  if (
    f_value > item.pvs[key].hi_limit * 1.2 ||
    f_value < item.pvs[key].lo_limit * 0.8
  )
    return "red";
  else if (f_value > item.pvs[key].hi_limit || f_value < item.pvs[key].lo_limit)
    return "orange";
  else return "green";
}
function display_archiver() {
  let pv_names = [];
  for (const pv of Object.values(props.item.pvs)) {
    if (pv.name !== "") pv_names.push(pv.name);
  }

  window.open(
    `https://${internal.url}/archiver-viewer/?pv=${pv_names.join("&pv=")}`,
    "_blank"
  );
}
</script>
