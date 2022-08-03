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
              :href="`https://${$store.state.url}/archiver-viewer/?pv=${
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
              :href="`https://${$store.state.url}/archiver-viewer/?pv=${item.pvs.Glitches.name}`"
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
              :href="`https://${$store.state.url}/archiver-viewer/?pv=${item.pvs.PFactor.name}`"
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
              :href="`https://${$store.state.url}/archiver-viewer/?pv=${item.pvs.Frequency.name}`"
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

<script>
import { mdiAlertCircle, mdiPowerPlugOutline, mdiMenuDown } from "@mdi/js";

export default {
  props: ["item", "limits"],
  data: function () {
    return {
      critical: false,
      mdiAlertCircle,
      mdiPowerPlugOutline,
      mdiMenuDown,
    };
  },
  methods: {
    get_color(index) {
      // If at least one voltage/current value is critical, display a warning icon
      this.critical =
        (this.item.pvs.Voltage.value !== "?" &&
          this.item.pvs.Voltage.value > this.limits.hi) ||
        this.item.pvs.Voltage.value < this.limits.lo ||
        this.item.pvs.Current.values.some((current) => {
          return current !== "?" && current > 20;
        }) ||
        this.item.pvs.Glitches > 2;

      if (
        this.item.pvs.Voltage.value === "?" ||
        this.item.pvs.Current.values[index] === "?"
      )
        return "gray";

      if (
        this.item.pvs.Voltage.value > this.limits.hi ||
        this.item.pvs.Voltage.value < this.limits.lo ||
        this.item.pvs.Current.values[index] > 20
      )
        return "red";

      return "green";
    },
    get_subvalues_color(type, value) {
      if (value === "?" || value === "") return "gray";
      switch (type) {
        case "Frequency":
          if (value < 55 || value > 65) return "red";
          break;
        case "PFactor":
          return "green";
        case "Glitches":
          if (value > 2) return "red";
          break;
      }
      return "green";
    },
    get_current_pv(name, index) {
      return name.replace("?", index);
    },
  },
};
</script>