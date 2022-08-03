<template>
  <v-dialog v-model="dialog" max-width="800px">
    <template v-slot:activator="{ on, attrs }">
      <v-btn v-on="on" v-bind="attrs" icon color="grey">
        <v-icon>{{ mdiCog }}</v-icon></v-btn
      >
    </template>
    <v-card>
      <v-card-title>
        <span class="text-h5">Notification Settings</span>
      </v-card-title>
      <v-divider />
      <v-card-text>
        <v-container>
          <v-card-title class="text-h5 action-title">
            Connected Devices</v-card-title
          >

          <v-card-subtitle
            >View or unlink all devices that receive event
            notifications.</v-card-subtitle
          >
          <v-card-text>
            <v-data-table
              :items="items"
              :headers="headers"
              dense
              hide-default-footer
              disable-sort
            >
              <template v-slot:[`item.actions`]="{ item }">
                <v-icon small @click="delete_device(item)">
                  {{ mdiLinkVariantRemove }}
                </v-icon>
              </template>
            </v-data-table>
            <h5 style="margin-top: 12px">
              Telegram ID: {{ telegram_id }}
              <v-btn icon x-small @click="delete_telegram()"
                ><v-icon>{{ mdiLinkVariantRemove }}</v-icon></v-btn
              >
            </h5>
          </v-card-text>
          <v-divider />
          <v-row>
            <v-col cols="12" sm="9">
              <v-card-title class="text-h5 action-title">
                Link Device</v-card-title
              >

              <v-card-subtitle
                >Setup this device to receive browser notifications whenever an
                event occurs.</v-card-subtitle
              >
            </v-col>
            <v-col class="d-flex justify-end align-center" cols="12" sm="3">
              <v-btn @click="add_device" depressed dark color="blue"
                >Link Device</v-btn
              >
            </v-col>
          </v-row>
          <v-row style="margin-top: 0">
            <v-col cols="12" sm="9" class="dense-col">
              <v-card-title class="text-h5 action-title">
                Link Telegram Account
              </v-card-title>

              <v-card-subtitle dense
                >Link your Telegram account to SIMAR to receive notifications
                through
                <a href="https://t.me/controlsgroupinfobot">EPICSTel</a
                >.</v-card-subtitle
              >
            </v-col>
            <v-col
              class="d-flex justify-end align-center dense-col"
              cols="12"
              sm="3"
            >
              <telegram-dialog />
            </v-col>
          </v-row>
          <v-divider />
          <v-row>
            <v-col cols="12" sm="9">
              <v-card-title class="text-h5 action-title">
                Reset Notification Settings
              </v-card-title>

              <v-card-subtitle
                >Reset your notification settings to their defaults,
                <b
                  >wiping out all custom settings and linked devices
                  permanently</b
                >.</v-card-subtitle
              >
            </v-col>
            <v-col class="d-flex justify-end align-center" cols="12" sm="3">
              <v-btn @click="unsubscribe_all" depressed dark color="red"
                >Reset</v-btn
              >
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import TelegramDialog from "./TelegramDialog";
import { mdiLinkVariantRemove, mdiCog } from "@mdi/js";

export default {
  data: function () {
    return {
      dialog: false,
      headers: [
        {
          value: "host",
          text: "Host",
        },
        {
          value: "user_agent",
          text: "User Agent",
        },
        { value: "actions", sortable: false },
      ],
      telegram_id: "Unknown",
      mdiLinkVariantRemove,
      mdiCog,
      items: [],
    };
  },
  components: { TelegramDialog },
  methods: {
    async unsubscribe_all() {
      const subscription =
        await this.$store.state.sw.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }

      await this.send_command("pvs", "DELETE");
      window.location.reload();
    },
    async update_devices() {
      const response = await this.send_command("devices", "GET");
      const data = await response.json();
      this.items = data.devices;
      this.telegram_id = data.telegram_id || "Unknown";
    },
    async delete_device(item) {
      await this.send_command(`devices?endpoints=${item.endpoint}`, "DELETE");
      this.update_devices();
    },
    async add_device() {
      if ("granted" === (await Notification.requestPermission())) {
        let subscription = {};
        try {
          await this.$store.state.sw.ready;

          subscription =
            await this.$store.state.sw.pushManager.getSubscription();
          if (!subscription) {
            subscription = await this.$store.state.sw.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: this.b64_uint8(
                process.env.VUE_APP_PUSH_KEY
              ),
            });
          }
        } catch (err) {
          this.$store.commit(
            "showSnackbar",
            "A certificate error has occurred and we couldn't set up notifications for your browser. You can enable browser notifications by allowing insecure content in the site's permissions."
          );
        }
        subscription = subscription.toJSON();

        await this.send_command("subscribe", "POST", {
          endpoint: subscription.endpoint,
          auth: subscription.keys.auth,
          p256dh: subscription.keys.p256dh,
          host: window.location.host,
          user_agent: navigator.userAgent,
        });
        await this.update_devices();
      }
    },
    async delete_telegram() {
      await this.send_command(`telegram/${this.telegram_id}`, "DELETE");
      await this.update_devices();
    },
  },
  watch: {
    dialog() {
      this.update_devices();
    },
  },
};
</script>

<style scoped>
.dense-col {
  padding-top: 0;
}

.action-title {
  color: #292929;
}

.action-button {
  text-align: right;
}
</style>