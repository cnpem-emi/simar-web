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

<script>
export default {
  props: ["item", "name"],
  data: function () {
    return {
      lo: "",
      hi: "",
      min: -100,
      max: 80,
    };
  },
  computed: {
    range: {
      get() {
        return [this.lo, this.hi];
      },
      set(input) {
        this.range[0] = input[0];
        this.range[1] = input[1];

        this.$emit("change", input);
      },
    },
  },
  methods: {
    update_range(e, type) {
      this[type] = e;
      this.$emit("change", this.range);
    },
  },
  mounted() {
    this.lo = this.item.pvs[this.name].lo_limit;
    this.hi = this.item.pvs[this.name].hi_limit;

    switch (this.name) {
      case "Voltage":
        this.max = 1000;
        break;
      case "Humidity":
        this.max = 100;
        break;
      case "Pressure":
        this.max = 1200;
        this.min = 0;
        break;
    }
  },
};
</script>
