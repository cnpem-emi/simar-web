<template>
  <v-range-slider
    v-model="range"
    :max="max"
    :min="0"
    :label="name"
    hide-details
    class="align-center"
    style="width: 90%; margin: auto"
  >
    <template v-slot:append>
      <v-text-field
        :value="range[0]"
        class="mt-0 pt-0"
        hide-details
        single-line
        type="number"
        style="width: 60px"
        @input="update_range($event, 'lo')"
      ></v-text-field>
      <v-text-field
        :value="range[1]"
        class="mt-0 pt-0"
        hide-details
        single-line
        type="number"
        style="width: 60px; margin-left: 10px"
        @input="update_range($event, 'hi')"
      ></v-text-field>
    </template>
  </v-range-slider>
</template>

<script setup lang="ts">
import Item from "@/models/item";
import { ref, onMounted, computed } from "vue";

const emit = defineEmits(["change"]);
const props = defineProps<{
  item: Item;
  name: string;
}>();

let lo = ref(0);
let hi = ref(0);
let min = ref(-100);
let max = ref(80);

const range = computed({
  get(): number[] {
    return [lo.value, hi.value];
  },
  set(input: number[]): void {
    range.value[0] = input[0];
    range.value[1] = input[1];

    emit("change", input);
  },
});

function update_range(e: number, type: string) {
  switch (type) {
    case "lo":
      lo.value = e;
      break;
    case "hi":
      hi.value = e;
      break;
  }

  emit("change", range.value);
}

onMounted(() => {
  lo.value = props.item.pvs[props.name].lo_limit;
  hi.value = props.item.pvs[props.name].hi_limit;

  switch (props.name) {
    case "Voltage":
      max.value = 1000;
      break;
    case "Humidity":
      max.value = 100;
      break;
    case "Pressure":
      max.value = 1200;
      min.value = 0;
      break;
  }
});
</script>
