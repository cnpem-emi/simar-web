<template>
  <v-btn
    icon
    small
    fab
    :color="this.pv.subscribed ? 'green' : 'grey'"
    @click="toggle_subscribe"
    ><v-icon>{{ mdiBell }}</v-icon></v-btn
  >
</template>

<script>
import { mdiBell } from "@mdi/js";

export default {
  props: ["pv"],
  data() {
    return {
      mdiBell,
    };
  },
  methods: {
    async toggle_subscribe() {
      let response = this.pv.subscribed
        ? await this.unsubscribe()
        : await this.subscribe();

      if (response === 200) this.$emit("update-sub");
    },
    async subscribe() {
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
          console.error(err);
          this.$store.commit(
            "showSnackbar",
            "We couldn't set up notifications for your browser. You can still use Telegram notifications, however."
          );
        }

        subscription = subscription.toJSON();

        const pv_data = {
          pvs: [
            {
              name: this.pv.name,
            },
          ],
          endpoint: subscription.endpoint,
          auth: subscription.keys.auth,
          p256dh: subscription.keys.p256dh,
          host: window.location.host,
          user_agent: navigator.userAgent,
        };

        if (this.pv.value === "No" || this.pv.value === "Yes") {
          pv_data.pvs[0].hi_limit = 0;
          pv_data.pvs[0].lo_limit = 0;
        } else {
          pv_data.pvs[0].hi_limit = this.pv.hi_limit;
          pv_data.pvs[0].lo_limit = this.pv.lo_limit;
        }

        const response = await this.send_command(
          "pvs/subscribe",
          "POST",
          pv_data
        );

        return response.status;
      }
      return undefined;
    },
    async unsubscribe() {
      const response = await this.send_command("pvs/unsubscribe", "POST", {
        pvs: [this.pv.name],
      });
      return response.status;
    },
  },
};
</script>
