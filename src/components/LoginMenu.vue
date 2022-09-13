<template>
  <v-col>
    <v-menu v-if="user.account" bottom min-width="300px" rounded offset-y>
      <template v-slot:activator="{ on }">
        <v-btn icon x-large v-on="on">
          <v-avatar color="indigo" size="48">
            <span class="white--text text-h6">{{
              getInitials(user.account)
            }}</span>
          </v-avatar>
        </v-btn>
      </template>
      <v-card>
        <v-list-item-content class="justify-center">
          <div class="mx-auto text-center">
            <v-avatar color="indigo" style="margin-bottom: 10px">
              <span class="white--text text-h6">{{
                getInitials(user.account)
              }}</span>
            </v-avatar>
            <h3>{{ user.account.name }}</h3>
            <p class="text-caption mt-1">{{ user.account.username }}</p>
            <v-divider class="my-3"></v-divider>
            <v-btn @click="logout" depressed text> Disconnect </v-btn>
          </div>
        </v-list-item-content>
      </v-card>
    </v-menu>
    <v-menu
      :close-on-content-click="false"
      v-else
      bottom
      min-width="200px"
      rounded
      offset-y
    >
      <template v-slot:activator="{ on }">
        <v-btn
          :disabled="!user.msalConfig.auth.authority"
          @click="login"
          icon
          x-large
          v-on="on"
        >
          <v-icon>{{ mdiLogin }}</v-icon>
        </v-btn>
      </template>
    </v-menu>
  </v-col>
</template>

<script setup lang="ts">
import { mdiLogin } from "@mdi/js";
import { AccountInfo } from "@azure/msal-browser";
import { useUserStore } from "../stores/user";
import { useInternalStore } from "../stores/internal";
import { sendCommand } from "@/utils";

const user = useUserStore();
const internal = useInternalStore();

function getInitials(account: AccountInfo) {
  if (account === undefined) return "";
  return account.name.split(" ")[0].substring(0, 1);
}

async function login() {
  await user.msalInstance
    .loginPopup({ scopes: ["User.Read"] })
    .then(() => {
      const accounts = user.msalInstance.getAllAccounts();
      user.account = accounts[0];
      internal.showSnackbar(`Logged in as ${user.account.username}`);
      window.location.reload();
    })
    .catch((error) => {
      console.error(`Error during authentication: ${error}`);
    });
}

async function logout() {
  if (internal.sw === undefined || user.msalInstance === undefined) {
    return;
  }

  let subscription = await internal.sw.pushManager.getSubscription();

  if (subscription)
    await sendCommand(`devices?endpoints=${subscription.endpoint}`, "DELETE");

  await user.msalInstance.logoutRedirect({}).catch((error) => {
    console.error(error);
  });
}
</script>