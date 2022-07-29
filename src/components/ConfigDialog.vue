<template>
  <v-dialog v-model="dialog" max-width="700px">
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        icon
        small
        fab
        color="grey"
        v-bind="attrs"
        v-on="on"
        :disabled="$store.state.account === undefined"
        ><v-icon dark>{{ mdiCog }}</v-icon></v-btn
      >
    </template>
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ item.name }}</span>
        <v-spacer />
        <a
          :href="`https://${$store.state.url}/bbbread/?search=${
            parent_name.split(':')[0]
          }`"
          target="_blank"
        >
          <v-icon
            v-if="item.parent.includes('10.15') || !item.parent.includes(' - ')"
            style="margin-right: 10px"
            color="grey"
            >{{ mdiWifi }}</v-icon
          >
          <v-icon v-if="status === 'Connected'" color="green">{{
            mdiLanConnect
          }}</v-icon>
          <v-icon v-else color="red">{{ mdiLanDisconnect }}</v-icon>
        </a>
      </v-card-title>
      <v-card-subtitle style="padding-bottom: 5px">
        {{ item.parent }}
      </v-card-subtitle>
      <v-divider />
      <v-list
        v-for="name in ['Temperature', 'Pressure', 'Humidity', 'Voltage']"
        :key="name"
      >
        <limit-range
          :name="name"
          v-bind:item="item"
          @change="range[name] = $event"
        />
      </v-list>
      <v-container>
        <v-row>
          <v-col v-for="(column, index) in columns" :key="index">
            <v-list dense>
              <v-list-item v-for="(key, index) in column" :key="index">
                <v-list-item-content>
                  <v-row>
                    <v-col>
                      <v-list-item-title
                        ><v-icon :color="get_color(index)">{{
                          mdiPowerPlugOutline
                        }}</v-icon
                        ><outlet-name
                          @update-name="update_name($event, key)"
                          v-bind:index="key"
                          v-bind:name="outlet_names[key]" /></v-list-item-title
                      ><v-list-item-subtitle style="text-align: center">
                        {{ item.pvs.Voltage.value }}</v-list-item-subtitle
                      >
                      <v-list-item-subtitle style="text-align: center">
                        {{ item.pvs.Current.values[key] }}</v-list-item-subtitle
                      >
                    </v-col>
                    <v-col>
                      <v-switch
                        v-model="outlets"
                        :value="key"
                        color="green"
                        inset
                        :disabled="loading_pv"
                      />
                    </v-col>
                  </v-row>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-col>
        </v-row>
      </v-container>
      <v-card-actions>
        <v-spacer />
        <v-btn color="grey darken-1" text @click="dialog = false">
          Close
        </v-btn>
        <v-btn color="blue darken-1" text @click="apply_changes"> Apply </v-btn>
      </v-card-actions>
      <v-progress-linear
        :active="load_prog !== 0"
        :value="load_prog"
        absolute
        bottom
        color="blue accent-4"
      ></v-progress-linear>
    </v-card>
  </v-dialog>
</template>

<script>
import LimitRange from "./LimitRange";
import OutletName from "./OutletName";
import {
  mdiWifi,
  mdiLanConnect,
  mdiLanDisconnect,
  mdiCog,
  mdiPowerPlugOutline,
} from "@mdi/js";

export default {
  components: { LimitRange, OutletName },
  props: ["item"],
  data: function () {
    return {
      dialog: false,
      status: "Connected",
      loading_pv: true,
      outlets: [],
      outlet_names: ["0", "1", "2", "3", "4", "5", "6"],
      new_names: {},
      autotemp: false,
      range: {
        Humidity: [0, 0],
        Temperature: [0, 0],
        Pressure: [0, 0],
        Voltage: [0, 0],
      },
      load_prog: 0,
      parent_name: "",
      mdiCog,
      mdiPowerPlugOutline,
      mdiWifi,
      mdiLanConnect,
      mdiLanDisconnect,
    };
  },
  methods: {
    async update_name(name, id) {
      this.$set(this.outlet_names, id, name);
      this.new_names[id] = name;
    },
    async apply_changes() {
      this.load_prog = 33;

      const pvs_to_change = [];

      for (let pv of Object.keys(this.item.pvs)) {
        if (!this.item.pvs[pv].name) continue;

        if (
          this.range[pv] !== undefined &&
          this.range[pv][0] !== this.range[pv][1] &&
          (this.range[pv][0] !== this.item.pvs[pv].lo_limit ||
            this.range[pv][1] !== this.item.pvs[pv].hi_limit)
        ) {
          pvs_to_change.push({
            name: this.item.pvs[pv].name,
            lo_limit: this.range[pv][0],
            hi_limit: this.range[pv][1],
          });
          console.log(pvs_to_change);
        }
      }

      await this.send_command("pvs", "POST", pvs_to_change);

      this.$emit("update-limit", pvs_to_change);

      this.load_prog = 80;

      let outlets = [];

      for (let i = 0; i < this.outlet_names.length; i++) {
        outlets.push({
          setpoint: this.outlets.includes(i),
          name: this.new_names[i],
          id: i,
        });
      }

      await this.send_command(
        `outlets/SIMAR:${this.parent_name}`,
        "POST",
        outlets
      );

      this.$store.commit(
        "showSnackbar",
        `Successfully applied settings to ${this.item.parent}!`
      );

      this.dialog = false;
      this.load_prog = 0;
    },
    get_color(index) {
      if (
        this.item.pvs.Voltage.value === "?" ||
        this.item.pvs.Current.values[index] === "?"
      )
        return "grey";
      if (
        this.item.pvs.Voltage.value > this.item.v_hi ||
        this.item.pvs.Voltage.value < this.item.v_lo ||
        this.item.pvs.Current.values[index] > 20
      )
        return "red";

      return "green";
    },
  },
  watch: {
    async dialog() {
      this.loading_pv = true;
      let on_outlets = [];
      this.parent_name = this.item.parent.replace(" - ", ":");
      let data;

      try {
        data = await this.send_command(
          `/beaglebones/status/${
            this.parent_name.includes(":")
              ? "BBB:" + this.parent_name
              : this.parent_name
          }`,
          "GET"
        );
        data = await data.json();

        this.status = data.status ?? "Disconnected";
      } catch (err) {
        this.status = "Disconnected";
        console.warn(err);
      }

      data = await this.send_command(
        `outlets/SIMAR:${this.parent_name}`,
        "GET"
      );
      data = await data.json();

      for (let i in data) {
        this.outlet_names[i] = data[i].name;
        if (data[i].status === 1) on_outlets.push(parseInt(i));
      }

      this.outlets = on_outlets;
      this.loading_pv = data.length < 1;
    },
  },
  computed: {
    columns() {
      const column_count = this.$vuetify.breakpoint.mobile ? 1 : 3;
      let columns = [];
      let mid = Math.ceil(7 / column_count);
      for (let col = 0; col < column_count; col++) {
        columns.push([...Array(7).keys()].slice(col * mid, col * mid + mid));
      }
      return columns;
    },
  },
};
</script>

<style scoped>
.show-edit {
  color: rgba(0, 0, 0, 0.54) !important;
}
</style>