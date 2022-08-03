<template>
  <v-expansion-panels>
    <v-expansion-panel>
      <v-expansion-panel-header
        accordion
        class=""
        style="padding: 2px 16px; font-size: 16px"
        :disable-icon-rotate="critical"
        :expand-icon="mdiMenuDown"
      >
        Power
        <template v-slot:actions v-if="critical">
          <v-icon color="error">{{ mdiAlertCircle }}</v-icon>
        </template>
      </v-expansion-panel-header>
      <v-expansion-panel-content>
        <v-list dense style="column-count: 2">
          <v-list-item
            v-for="(key, index) in item.pvs.Current.values"
            :key="index"
            style="padding: 2px"
          >
            <v-list-item-icon
              v-if="$vuetify.breakpoint.width > 1540"
              style="margin-right: 3px"
              ><v-icon :color="get_color(index)">{{
                mdiPowerPlugOutline
              }}</v-icon></v-list-item-icon
            >
            <v-list-item-content>{{ index }}</v-list-item-content>
            <v-spacer />
            <v-chip
              :href="`https://${internal.url}/archiver-viewer/?pv=${
                item.pvs.Voltage.name
              }&pv=${get_current_pv(item.pvs.Current.name, index)}`"
              style="font-size: 10px"
              small
              :color="get_color(index)"
              text-color="white"
              target="_blank"
            >
              {{
                `${item.pvs.Voltage.value} / ${item.pvs.Current.values[index]}`
              }}
            </v-chip>
          </v-list-item>
        </v-list>
        <v-divider />
        <v-col style="margin: 12px 0 0 0">
          <v-row>
            <p>Glitches Last 5 Seconds</p>
            <v-spacer />
            <v-chip
              small
              :href="`https://${internal.url}/archiver-viewer/?pv=${item.pvs.Glitches.name}`"
              target="_blank"
              :color="get_subvalues_color('Glitches', item.pvs.Glitches.value)"
              text-color="white"
              >{{ item.pvs.Glitches.value }}</v-chip
            >
          </v-row>
          <v-row>
            <p>Power Factor</p>
            <v-spacer />
            <v-chip
              small
              :href="`https://${internal.url}/archiver-viewer/?pv=${item.pvs.PFactor.name}`"
              target="_blank"
              :color="get_subvalues_color('PFactor', item.pvs.PFactor.value)"
              text-color="white"
              >{{ item.pvs.PFactor.value }}</v-chip
            >
          </v-row>
          <v-row>
            <p>Frequency</p>
            <v-spacer />
            <v-chip
              small
              :href="`https://${internal.url}/archiver-viewer/?pv=${item.pvs.Frequency.name}`"
              target="_blank"
              :color="
                get_subvalues_color('Frequency', item.pvs.Frequency.value)
              "
              text-color="white"
              >{{ item.pvs.Frequency.value }}</v-chip
            >
          </v-row>
        </v-col>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script setup lang="ts">
import Item from "@/models/item";
import { ref } from "vue";
import { mdiAlertCircle, mdiPowerPlugOutline, mdiMenuDown } from "@mdi/js";
import { useInternalStore } from "@/stores/internal";

const internal = useInternalStore();

const props = defineProps<{
  item: Item;
  limits: { hi: "0"; lo: "0" };
}>();
const critical = ref(false);

function get_color(index: number) {
  // If at least one voltage/current value is critical, display a warning icon
  critical.value =
    (props.item.pvs.Voltage.value !== "?" &&
      props.item.pvs.Voltage.value > props.limits.hi) ||
    props.item.pvs.Voltage.value < props.limits.lo ||
    props.item.pvs.Current.values.some((current) => {
      return current !== "?" && parseFloat(current) > 20;
    }) ||
    parseInt(props.item.pvs.Glitches.value) > 2;

  if (
    props.item.pvs.Voltage.value === "?" ||
    props.item.pvs.Current.values[index] === "?"
  )
    return "gray";

  if (
    props.item.pvs.Voltage.value > props.limits.hi ||
    props.item.pvs.Voltage.value < props.limits.lo ||
    parseFloat(props.item.pvs.Current.values[index]) > 20
  )
    return "red";

  return "green";
}
function get_subvalues_color(type: string, value: string) {
  if (value === "?" || value === "") return "gray";
  const numValue = parseFloat(value);
  switch (type) {
    case "Frequency":
      if (numValue < 55 || numValue > 65) return "red";
      break;
    case "PFactor":
      return "green";
    case "Glitches":
      if (numValue > 2) return "red";
      break;
  }
  return "green";
}
function get_current_pv(name: string, index: number) {
  return name.replace("?", index.toString());
}
</script>