<template>
  <v-btn
    icon
    small
    fab
    :color="props.pv.subscribed ? 'green' : 'grey'"
    @click="toggle_subscribe"
    ><v-icon>{{ mdiBell }}</v-icon></v-btn
  >
</template>

<script setup lang="ts">
import { useInternalStore } from "@/stores/internal";
import { b64_uint8, sendCommand } from "@/utils";
import { mdiBell } from "@mdi/js";

const internal = useInternalStore();

const emit = defineEmits(["update-sub"]);
const props = defineProps<{
  pv: any;
}>();

async function toggle_subscribe() {
  let response = props.pv.subscribed ? await unsubscribe() : await subscribe();

  if (response === 200) emit("update-sub");
}

async function subscribe() {
  if (internal.sw === undefined) return;

  if ("granted" === (await Notification.requestPermission())) {
    let raw_sub: PushSubscription | null;

    try {
      await internal.sw.ready;

      raw_sub = await internal.sw.pushManager.getSubscription();

      if (!raw_sub) {
        raw_sub = await internal.sw.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: b64_uint8(process.env.VUE_APP_PUSH_KEY),
        });
      }
    } catch (err) {
      console.error(err);
      internal.showSnackbar(
        "We couldn't set up notifications for your browser. You can still use Telegram notifications, however."
      );
      return;
    }

    let subscription = raw_sub.toJSON();

    if (subscription.keys === undefined) {
      return;
    }

    const pv_data = {
      pvs: [
        {
          name: props.pv.name,
          hi_limit: 0,
          lo_limit: 0,
        },
      ],
      endpoint: subscription.endpoint,
      auth: subscription.keys.auth,
      p256dh: subscription.keys.p256dh,
      host: window.location.host,
      user_agent: navigator.userAgent,
    };

    if (props.pv.value !== "No" && props.pv.value !== "Yes") {
      pv_data.pvs[0].hi_limit = props.pv.hi_limit;
      pv_data.pvs[0].lo_limit = props.pv.lo_limit;
    }

    const response = await sendCommand("pvs/subscribe", "POST", pv_data);

    return response.status;
  }
  return undefined;
}

async function unsubscribe() {
  const response = await sendCommand("pvs/unsubscribe", "POST", {
    pvs: [props.pv.name],
  });
  return response.status;
}
</script>
