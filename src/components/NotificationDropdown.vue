<template>
  <v-col>
    <v-menu
      v-if="$store.state.account"
      bottom
      min-width="300px"
      rounded
      offset-y
    >
      <template v-slot:activator="{ on }">
        <v-badge
          :content="$store.state.notification_count"
          :value="$store.state.notification_count"
          color="red"
          overlap
          offset-x="25px"
          offset-y="25px"
        >
          <v-btn icon medium v-on="on">
            <v-icon medium>
              {{ mdiBell }}
            </v-icon>
          </v-btn>
        </v-badge>
      </template>
      <v-list width="400px" max-height="500px" class="overflow-y-auto">
        <v-list-item>
          <v-list-item-title>Notifications</v-list-item-title>
          <v-spacer />
          <v-btn color="grey" icon medium @click="clear_notifications">
            <v-icon medium>
              {{ mdiBroom }}
            </v-icon>
          </v-btn>
          <notification-dialog />
        </v-list-item>
        <v-divider />
        <v-list-item
          v-for="notification of $store.state.notifications"
          :key="notification.oid"
        >
          <v-list-item-content>
            {{ notification.message }}
            <v-list-item-subtitle>{{
              notification.date.slice(0, -3)
            }}</v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn icon @click="remove_notification(notification.oid)">
              <v-icon color="grey lighten-1">{{ mdiClose }}</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
        <v-list-item v-if="!$store.state.notification_count">
          <v-list-item-subtitle>No notifications received</v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-col>
</template>

<script>
import { mdiBell, mdiClose, mdiBroom } from "@mdi/js";
import NotificationDialog from "./NotificationDialog.vue";

export default {
  data() {
    return {
      mdiBell,
      mdiClose,
      mdiBroom,
    };
  },
  components: { NotificationDialog },
  methods: {
    async remove_notification(oid) {
      await this.send_command(`notification?oid=${oid}`, "DELETE");
      this.$store.commit("updateNotifications");
    },
    async clear_notifications() {
      await this.send_command(
        "notification?" +
          this.$store.state.notifications.map((n) => `oid=${n.oid}`).join("&"),
        "DELETE"
      );
      this.$store.commit("updateNotifications");
    },
  },
};
</script>