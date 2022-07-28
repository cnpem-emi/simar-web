<template>
  <v-container fluid>
    <v-data-iterator
      :items="filter_valid"
      :items-per-page.sync="items_per_page"
      :page.sync="page"
      :search="this.settings.search"
      :sort-by="this.settings.sort_by"
      :sort-desc="this.settings.sort_desc"
      :custom-sort="num_sort"
      loading="true"
      hide-default-footer
    >
      <template v-slot:default="props">
        <v-row>
          <v-col
            v-for="item in props.items"
            :key="item.name"
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <rack-card
              :key="item.name"
              v-bind:item="item"
              v-bind:keys="settings.keys"
              v-bind:filtered_keys="filtered_keys"
              @update-sub="update_sub(item, $event)"
              @update-limit="update_limit(item, $event)"
            />
          </v-col>
        </v-row>
      </template>
      <template v-slot:loading>
        <v-row>
          <v-col v-for="item in 8" :key="item" cols="12" sm="6" md="4" lg="3">
            <v-skeleton-loader
              type="card-heading, image, list-item"
            ></v-skeleton-loader>
          </v-col>
        </v-row>
      </template>
      <template v-slot:footer>
        <v-row class="mt-2 no-margin" align="center" justify="center">
          <span class="text-button white--text">Items per page</span>
          <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                dark
                text
                color="white"
                class="ml-2 blue-background"
                v-bind="attrs"
                v-on="on"
              >
                {{ items_per_page }}
                <v-icon>{{ mdiChevronDown }}</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item
                v-for="(number, index) in [8, 12, 16, 20]"
                :key="index"
                @click="items_per_page = number"
              >
                <v-list-item-title>{{ number }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>

          <v-spacer />

          <v-layout
            v-if="items.length && external_sensor.pvs !== undefined"
            align-center
            justify-center
            class="hidden-sm-and-down"
          >
            <div class="text-button amb-val">Ambient</div>
            <v-btn
              plain
              class="amb-val"
              :href="`https://${$store.state.url}/archiver-viewer/?pv=${external_sensor.pvs.Temperature.name}`"
              ><v-icon dark>{{ mdiThermometer }}</v-icon
              >{{ external_sensor.pvs.Temperature.value }}</v-btn
            >
            <v-btn
              plain
              class="amb-val"
              :href="`https://${$store.state.url}/archiver-viewer/?pv=${external_sensor.pvs.Pressure.name}`"
              ><v-icon dark>{{ mdiGauge }}</v-icon
              >{{ external_sensor.pvs.Pressure.value }}</v-btn
            >
            <v-btn
              plain
              class="amb-val"
              :href="`https://${$store.state.url}/archiver-viewer/?pv=${external_sensor.pvs.Humidity.name}`"
              ><v-icon dark>{{ mdiWaterPercent }}</v-icon
              >{{ external_sensor.pvs.Humidity.value }}</v-btn
            >
          </v-layout>

          <v-spacer />

          <span class="text-button mr-4 white--text">
            Page {{ page }} of {{ number_pages }}
          </span>
          <v-btn
            dark
            color="blue darken-3"
            class="mr-1"
            @click="if (page - 1 >= 1) page -= 1;"
          >
            <v-icon>{{ mdiChevronLeft }}</v-icon>
          </v-btn>
          <v-btn
            dark
            color="blue darken-3"
            class="ml-1"
            @click="if (page + 1 <= number_pages) page += 1;"
          >
            <v-icon>{{ mdiChevronRight }}</v-icon>
          </v-btn>
        </v-row>
      </template>
    </v-data-iterator>
  </v-container>
</template>

<script>
import * as consts from "../assets/constants.js";
import * as e2w from "../assets/epics2web.js";
import RackCard from "./RackCard";
import {
  mdiChevronRight,
  mdiChevronLeft,
  mdiChevronDown,
  mdiThermometer,
  mdiWaterPercent,
  mdiGauge,
} from "@mdi/js";

async function parse_json(self) {
  let pv_info = [];

  try {
    pv_info = await self.get_pv_info();
  } catch {
    console.warn("Notifications are not available");
  }
  return new Promise((resolve) => {
    setTimeout(async () => {
      const response = await fetch("config.json");
      const data = await response.json();
      let pvs = [];
      for (const [parent, children] of Object.entries(data.items)) {
        for (const sensor of children) {
          let pv_names = [];

          for (let pv of Object.keys(sensor.pvs)) {
            if (pv !== "Current") {
              pv_names.push(sensor.pvs[pv].name);
            }
            const i = pv_info.findIndex((i) => i.name === sensor.pvs[pv].name);

            if (i > -1) {
              sensor.pvs[pv].subscribed = pv_info[i].subbed;
              sensor.pvs[pv].hi_limit = pv_info[i].hi_limit;
              sensor.pvs[pv].lo_limit = pv_info[i].lo_limit;
            }
          }

          if (sensor.pvs.Current) {
            const current_pv_names = [];

            const current_name = sensor.pvs.Current.name;

            for (let i = 0; i < 7; i++) {
              current_pv_names.push(current_name.replace("?", i));
            }

            pv_names = pv_names.concat(current_pv_names);
          }

          self.items.push({
            parent: parent,
            name: sensor.name,
            pvs: fill_template(sensor.pvs),
          });
          pvs = pvs.concat(pv_names);
        }
      }
      resolve(pvs);
    }, 100);
  });
}

function get_type(pv) {
  const pv_type = pv.split(":")[2];
  for (const probable_type of Object.keys(consts.EMPTY_PVS)) {
    if (pv_type.includes(probable_type)) return probable_type;
    if (pv_type.includes("Temp")) return "Temperature";
    if (pv_type.includes("RackOpen")) return "Rack Open";
    if (pv_type.includes("PwrFactor")) return "PFactor";
    if (pv_type.includes("Glitch")) return "Glitches";
  }
}

function fill_template(pvs) {
  let filled = JSON.parse(JSON.stringify(consts.EMPTY_PVS)); // Deep copy needs to be made

  for (let type_key of Object.keys(pvs)) {
    for (let value of Object.keys(pvs[type_key]))
      filled[type_key][value] = pvs[type_key][value];
  }

  return filled;
}

export default {
  components: {
    RackCard,
  },
  props: ["settings"],
  data() {
    return {
      filter: {},
      page: 1,
      items_per_page: 8,
      headers: [],
      items: [],
      con: undefined,
      loading_pv: true,
      external_sensor: {},
      mdiChevronRight,
      mdiChevronLeft,
      mdiChevronDown,
      mdiThermometer,
      mdiGauge,
      mdiWaterPercent,
    };
  },
  computed: {
    number_pages() {
      return Math.ceil(this.items.length / this.items_per_page);
    },
    filtered_keys() {
      return this.settings.keys.filter((key) => key !== "Name");
    },
    filter_valid() {
      return this.items.filter((i) => i.pvs.Pressure.value !== "0 hPa");
    },
  },
  methods: {
    num_sort(items, index) {
      items.sort((a, b) => {
        if (index[0] === "Name")
          return this.settings.sort_desc ? b.name > a.name : a.name > b.name;

        const is_first = a.pvs[index[0]].value > b.pvs[index[0]].value;
        return this.settings.sort_desc ? !is_first : is_first;
      });
      return items;
    },
    async get_pv_info() {
      const response = await this.send_command("pvs", "GET");
      return await response.json();
    },
    async update_sub(item, key) {
      item.pvs[key].subscribed = !item.pvs[key].subscribed;
    },
    async update_limit(item, pvs) {
      for (let pv of pvs) {
        const pv_type = Object.keys(item.pvs).find(
          (k) => item.pvs[k].name === pv.name
        );
        item.pvs[pv_type].hi_limit = pv.hi_limit;
        item.pvs[pv_type].lo_limit = pv.lo_limit;
      }
    },
    on_update(e) {
      const pv_type = get_type(e.detail.pv);
      let pv_name = e.detail.pv;

      if (pv_type === "Current") pv_name = pv_name.replace(/CH[0-9]/, "CH?");

      let index = this.items.findIndex((i) => i.pvs[pv_type].name === pv_name);

      if (pv_type === "Rack Open" || pv_type === "Leak") {
        // Rack door status
        this.items[index].pvs[pv_type].value =
          e.detail.value === 0 ? "No" : "Yes";
      } else if (pv_type === "Current") {
        this.items[index].pvs.Current.values[
          parseInt(e.detail.pv.charAt(e.detail.pv.indexOf("CH") + 2))
        ] = e.detail.value.toFixed(2) + consts.SYMBOLS[pv_type];
      } else {
        this.items[index].pvs[pv_type].value =
          e.detail.value.toFixed(2) + consts.SYMBOLS[pv_type];
      }

      this.$forceUpdate();
    },
  },
  async created() {
    var options = {
      url: "wss://" + this.$store.state.url + "/epics2web/monitor",
    };
    this.con = new e2w.jlab.epics2web.ClientConnection(options);

    this.con.onopen = this.con.monitorPvs(await parse_json(this));
    this.con.onupdate = this.on_update;

    this.external_sensor = this.items.find((e) => e.name === "B, 15");
  },
};
</script>

<style scoped>
.no-margin {
  margin: 0;
}

.blue-background {
  background: rgb(21, 101, 192);
}

div:first-child .v-data-iterator {
  color: white;
}

.amb-val {
  color: white;
  padding: 0 16px;
}

.amb-val i {
  padding-right: 5px;
}
</style>
