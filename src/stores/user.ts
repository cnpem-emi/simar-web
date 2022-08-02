import { defineStore } from 'pinia'
import { AccountInfo, PublicClientApplication } from "@azure/msal-browser";
import { useInternalStore } from "./internal";
import PushNotification from '@/models/notification';

interface State {
  msalConfig: {
    auth: {
      clientId: string,
      authority: string
    },
    cache: {
      cacheLocation: string
    }
  },
  msalInstance?: PublicClientApplication,
  account?: AccountInfo,
  notifications: PushNotification[]
}

export const useUserStore = defineStore('auth/user', {
  state: (): State => ({
    msalConfig: {
      auth: {
        clientId: process.env.VUE_APP_ID,
        authority: process.env.VUE_APP_AUTH,
      },
      cache: {
        cacheLocation: "localStorage",
      },
    },
    account: undefined,
    notifications: []
  }),
  getters: {
    notificationCount: (state) => state.notifications.length
  },
  actions: {
    async updateNotifications() {
      const internal = useInternalStore();
      if (this.msalInstance !== undefined) {
        const token = await this.msalInstance.acquireTokenSilent({
          scopes: ["User.Read"],
          account: this.account,
        });

        const config = {
          headers: { Authorization: `Bearer ${token.accessToken}`, "Content-Type": "application/json" },
        };

        const response = await fetch(`https://${internal.url}/simar/api/notification`, config);
        this.notifications = await response.json();
        this.notifications.reverse();
      }
    },
  }
})