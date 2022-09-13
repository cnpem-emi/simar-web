<template>
  <v-container fluid>
    <v-data-iterator
      :items="filter_valid"
      :items-per-page.sync="items_per_page"
      :page.sync="page"
      :sort-by="settings.sort_by"
      :sort-desc="settings.sort_desc"
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
              :href="`https://${internal.url}/archiver-viewer/?pv=${external_sensor.pvs.Temperature.name}`"
              ><v-icon dark>{{ mdiThermometer }}</v-icon
              >{{ external_sensor.pvs.Temperature.value }}</v-btn
            >
            <v-btn
              plain
              class="amb-val"
              :href="`https://${internal.url}/archiver-viewer/?pv=${external_sensor.pvs.Pressure.name}`"
              ><v-icon dark>{{ mdiGauge }}</v-icon
              >{{ external_sensor.pvs.Pressure.value }}</v-btn
            >
            <v-btn
              plain
              class="amb-val"
              :href="`https://${internal.url}/archiver-viewer/?pv=${external_sensor.pvs.Humidity.name}`"
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

<script setup lang="ts">
import * as consts from "../assets/constants";
import * as e2w from "../assets/epics2web";
import RackCard from "./RackCard";
import { useInternalStore } from "@/stores/internal";
import {
  mdiChevronRight,
  mdiChevronLeft,
  mdiChevronDown,
  mdiThermometer,
  mdiWaterPercent,
  mdiGauge,
} from "@mdi/js";
import { computed, ref, onMounted } from "vue";
import { Item } from "../models/item";
import Settings from "@/models/settings";
import { sendCommand } from "../utils";

const internal = useInternalStore();

const page = ref(1);
const items_per_page = ref(8);
const items = ref<Array<Item>>([]);
let con: e2w.jlab.epics2web.ClientConnection;
const external_sensor = ref<Item>({
  pvs: consts.EMPTY_PVS,
  name: "",
  parent: "",
});

async function parse_json() {
  return new Promise((resolve) => {
    setTimeout(async () => {
      const response = await fetch("config.json");
      const data = await response.json();
      let pvs: string[] = [];
      for (const [parent, children] of Object.entries(data.items)) {
        for (const sensor of children) {
          let pv_names = [];

          for (let pv of Object.keys(sensor.pvs)) {
            if (pv !== "Current") {
              pv_names.push(sensor.pvs[pv].name);
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

          for (let pv in consts.EMPTY_PVS) {
            if (!(pv in sensor.pvs)) {
              sensor.pvs[pv] = consts.EMPTY_PVS[pv];
            }
            sensor.pvs[pv].value = consts.EMPTY_PVS[pv].value.slice();
          }

          items.value.push({
            parent: parent,
            name: sensor.name,
            pvs: sensor.pvs,
          });
          pvs = pvs.concat(pv_names);
        }
      }
      resolve(pvs);
    }, 100);
  });
}

function get_type(pv: string) {
  const pv_type = pv.split(":")[2];
  for (const probable_type of Object.keys(consts.EMPTY_PVS)) {
    if (pv_type.includes(probable_type)) return probable_type;
    if (pv_type.includes("Temp")) return "Temperature";
    if (pv_type.includes("RackOpen")) return "Rack Open";
    if (pv_type.includes("PwrFactor")) return "PFactor";
    if (pv_type.includes("Glitch")) return "Glitches";
  }
  return "Temperature";
}

const props = defineProps<{
  settings: Settings;
}>();

const number_pages = computed(() => {
  return Math.ceil(filter_valid.value.length / items_per_page.value);
});

const filtered_keys = computed(() => {
  return props.settings.keys.filter((key) => key !== "Name");
});

const filter_valid = computed(() => {
  return items.value.filter((i) => i.name.includes(props.settings.search));
});

function num_sort(items: Item[], index: string) {
  items.sort((a, b) => {
    let sort_val: number;
    if (index[0] === "Name") {
      sort_val = b.name > a.name ? -1 : 1;
    } else {
      sort_val = b.pvs[index[0]].value > a.pvs[index[0]].value ? -1 : 1;
    }

    return sort_val * (props.settings.sort_desc ? -1 : 1);
  });
  return items;
}

async function get_pv_info() {
  const response = await sendCommand("pvs", "GET");
  return await response.json();
}

async function update_sub(item: Item, key: string) {
  item.pvs[key].subscribed = !item.pvs[key].subscribed;
}

async function update_limit(item: Item, pvs) {
  for (let pv of pvs) {
    const pv_type = Object.keys(item.pvs).find(
      (k) => item.pvs[k].name === pv.name
    );

    if (!pv_type) {
      return;
    }

    item.pvs[pv_type].hi_limit = pv.hi_limit;
    item.pvs[pv_type].lo_limit = pv.lo_limit;
  }
}

const onUpdate = (e) => {
  const pv_type = get_type(e.detail.pv);
  let pv_name = e.detail.pv;

  if (pv_type === "Current") pv_name = pv_name.replace(/CH[0-9]/, "CH?");

  let index = items.value.findIndex((i) => i.pvs[pv_type].name === pv_name);

  if (pv_type === "Rack Open" || pv_type === "Leak") {
    // Rack door status
    items.value[index].pvs[pv_type].value = e.detail.value === 0 ? "No" : "Yes";
  } else if (pv_type === "Current") {
    items.value[index].pvs.Current.value[
      parseInt(e.detail.pv.charAt(e.detail.pv.indexOf("CH") + 2))
    ] = e.detail.value.toFixed(2) + consts.SYMBOLS[pv_type];
  } else {
    items.value[index].pvs[pv_type].value =
      e.detail.value.toFixed(2) + consts.SYMBOLS[pv_type];
  }
};

onMounted(async () => {
  var options = {
    url: `wss://${internal.url}/epics2web/monitor`,
  };
  con = new e2w.jlab.epics2web.ClientConnection(options);

  con.onopen = con.monitorPvs(await parse_json());
  con.onupdate = onUpdate;

  //try {
  for (let pv of await get_pv_info()) {
    const pv_type = get_type(pv.name);
    const i = items.value.findIndex((i) => i.pvs[pv_type].name === pv.name);
    if (i > -1) {
      items.value[i].pvs[pv_type].subscribed = pv.subbed;
      items.value[i].pvs[pv_type].hi_limit = pv.hi_limit;
      items.value[i].pvs[pv_type].lo_limit = pv.lo_limit;
    }
  }

  external_sensor.value = items.value.find((e) => e.name === "B, 15") || {
    pvs: consts.EMPTY_PVS,
  };
});
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
