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
      v-model="internal.snackbar"
      timeout="4000"
      color="white"
      light
      dismissible
    >
      {{ internal.message }}
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
import CardIterator from "./components/CardIterator";
import ToolBar from "./components/ToolBar";
import FooterBar from "./components/FooterBar";
import { PublicClientApplication } from "@azure/msal-browser";
import { ref, onBeforeMount } from "vue";
import { useUserStore } from "./stores/user";
import { useInternalStore } from "./stores/internal";
import Settings from "./models/settings";

const user = useUserStore();
const internal = useInternalStore();

const settings = ref<Settings>({
  sort_desc: false,
  sort_by: "Name",
  search: "",
  keys: ["Name", "Temperature", "Pressure", "Rack Open", "Humidity", "Leak"],
  pvs: {},
});
function update_search(value: string) {
  settings.value.search = value;
}
function update_desc(value: boolean) {
  settings.value.sort_desc = value;
}
function update_sort(value: string) {
  settings.value.sort_by = value;
}
onBeforeMount(async () => {
  internal.setUrl();
  user.msalInstance = new PublicClientApplication(user.msalConfig);

  await user.msalInstance.handleRedirectPromise();
  const accounts = user.msalInstance.getAllAccounts();
  if (accounts.length == 0) return;

  user.account = accounts[0];
  const serviceWorker = await navigator.serviceWorker.register("./sw.js");

  internal.sw = serviceWorker;
  const channel = new BroadcastChannel("sw");
  channel.addEventListener("message", user.updateNotifications);
  user.updateNotifications();
});
</script>

<style scoped>
.v-main {
  background: rgb(1, 45, 87);
}
</style>