<template>
  <v-app>
    <v-main fluid>
      <ToolBar
        @sort="update_sort"
        @desc="update_desc"
        @search="update_search"
        v-bind:settings="settings"
      />
      <CardIterator v-bind:settings="settings" />
    </v-main>
    <FooterBar />

    <v-snackbar
      v-model="$store.state.snackbar"
      timeout="4000"
      color="white"
      light
      dismissible
    >
      {{ $store.state.message }}
    </v-snackbar>
  </v-app>
</template>

<script>
import CardIterator from "./components/CardIterator";
import ToolBar from "./components/ToolBar";
import FooterBar from "./components/FooterBar";
import { PublicClientApplication } from "@azure/msal-browser";
import { mdiClose } from "@mdi/js";
function getInitials(account) {
  return account.name.split(" ")[0].substring(0, 1);
}
export default {
  name: "SIMAR",
  components: {
    ToolBar,
    CardIterator,
    FooterBar,
  },
  data: () => ({
    settings: {
      sort_desc: false,
      sort_by: "Name",
      search: "",
      keys: [
        "Name",
        "Temperature",
        "Pressure",
        "Rack Open",
        "Humidity",
        "Leak",
      ],
      pvs: {},
    },
    mdiClose,
  }),
  methods: {
    update_search: function (value) {
      this.settings.search = value;
    },
    update_desc: function (value) {
      this.settings.sort_desc = value;
    },
    update_sort: function (value) {
      this.settings.sort_by = value;
    },
  },
  async created() {
    const msalInstance = new PublicClientApplication(
      this.$store.state.msalConfig
    );
    this.$store.commit("setInstance", msalInstance);
    const accounts = this.$store.state.msalInstance.getAllAccounts();
    if (accounts.length == 0) return;
    accounts[0].initials = getInitials(accounts[0]);
    this.$store.commit("setAccount", accounts[0]);
    const serviceWorker = await navigator.serviceWorker.register("./sw.js");
    this.$store.commit("setSw", serviceWorker);
    const channel = new BroadcastChannel("sw");
    channel.addEventListener(
      "message",
      this.$store.commit("updateNotifications")
    );
  },
};
</script>

<style scoped>
.v-main {
  background: rgb(1, 45, 87);
}
</style>