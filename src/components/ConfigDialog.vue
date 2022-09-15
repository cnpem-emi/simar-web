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
        :disabled="user.account === undefined"
        ><v-icon dark>{{ mdiCog }}</v-icon></v-btn
      >
    </template>
    <v-card>
      <v-card-title>
        <span class="text-h5">{{ item.name }}</span>
        <v-spacer />
        <a
          :href="`https://${internal.url}/bbbread/?search=${
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
                        {{ item.pvs.Current.value[key] }}</v-list-item-subtitle
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

<script setup lang="ts">
import LimitRange from "./LimitRange";
import OutletName from "./OutletName";
import {
  mdiWifi,
  mdiLanConnect,
  mdiLanDisconnect,
  mdiCog,
  mdiPowerPlugOutline,
} from "@mdi/js";
import { computed, ref, watch, getCurrentInstance } from "vue";
import { useInternalStore } from "@/stores/internal";
import { useUserStore } from "@/stores/user";
import { Item, Outlet } from "@/models/item";
import { sendCommand } from "@/utils";

const internal = useInternalStore();
const user = useUserStore();
const vue = getCurrentInstance();

const emit = defineEmits(["update-limit"]);
const props = defineProps<{
  item: Item;
}>();

const dialog = ref(false);
const status = ref("Connected");
const loading_pv = ref(true);
const outlets = ref<Array<number>>([]);
const outlet_names = ref<Array<string>>(["0", "1", "2", "3", "4", "5", "6"]);
const new_names = ref<Record<number, string>>({});
const range = ref<Record<string, Array<number>>>({
  Humidity: [0, 0],
  Temperature: [0, 0],
  Pressure: [0, 0],
  Voltage: [0, 0],
});
const load_prog = ref(0);
const parent_name = ref("");

async function update_name(name: string, id: number) {
  outlet_names.value[id] = name;
  new_names.value[id] = name;
}
async function apply_changes() {
  load_prog.value = 33;

  const pvs_to_change = [];

  for (let pv of Object.keys(props.item.pvs)) {
    if (!props.item.pvs[pv].name) continue;

    if (
      range.value[pv] !== undefined &&
      range.value[pv][0] !== range.value[pv][1] &&
      (range.value[pv][0] !== props.item.pvs[pv].lo_limit ||
        range.value[pv][1] !== props.item.pvs[pv].hi_limit)
    ) {
      pvs_to_change.push({
        name: props.item.pvs[pv].name,
        lo_limit: range.value[pv][0],
        hi_limit: range.value[pv][1],
      });
    }
  }

  await sendCommand("pvs", "POST", pvs_to_change);

  emit("update-limit", pvs_to_change);

  load_prog.value = 80;

  let newOutlets = [];

  for (let i = 0; i < outlet_names.value.length; i++) {
    newOutlets.push({
      setpoint: outlets.value.includes(i),
      name: new_names.value[i],
      id: i,
    });
  }

  if (!loading_pv.value)
    await sendCommand(`outlets/SIMAR:${parent_name.value}`, "POST", newOutlets);

  internal.showSnackbar(
    `Successfully applied settings to ${props.item.parent}!`
  );

  dialog.value = false;
  load_prog.value = 0;
}

function get_color(index: number) {
  if (
    props.item.pvs.Voltage.value === "?" ||
    props.item.pvs.Current.value[index] === "?"
  )
    return "grey";
  if (
    props.item.pvs.Voltage.value > props.item.v_hi ||
    props.item.pvs.Voltage.value < props.item.v_lo ||
    props.item.pvs.Current.value[index] > 20
  )
    return "red";

  return "green";
}

watch(dialog, async () => {
  loading_pv.value = true;
  let on_outlets = [];
  parent_name.value = props.item.parent.replace(" - ", ":");
  let data;

  try {
    data = await sendCommand(
      `beaglebones/status/${
        parent_name.value.includes(":")
          ? "BBB:" + parent_name.value
          : parent_name.value
      }`,
      "GET"
    );
    data = await data.json();

    status.value = data.status ?? "Disconnected";
  } catch (err) {
    status.value = "Disconnected";
    console.warn(err);
  }

  data = await sendCommand(`outlets/SIMAR:${parent_name.value}`, "GET");
  let outlet_data: Array<Outlet> = await data.json();

  for (let i in outlet_data) {
    outlet_names.value[i] = outlet_data[i].name;
    if (outlet_data[i].status === 1) on_outlets.push(parseInt(i));
  }

  outlets.value = on_outlets;
  loading_pv.value = outlet_data.length < 1;
});

const columns = computed(() => {
  const column_count = vue.proxy.$vuetify.breakpoint.mobile ? 1 : 3;
  let columns = [];
  let mid = Math.ceil(7 / column_count);
  for (let col = 0; col < column_count; col++) {
    columns.push([...Array(7).keys()].slice(col * mid, col * mid + mid));
  }
  return columns;
});
</script>

<style scoped>
.show-edit {
  color: rgba(0, 0, 0, 0.54) !important;
}
</style>