import Vuex from "vuex";
import Vue from "vue";

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    msalConfig: {
      auth: {
        clientId: process.env.VUE_APP_ID,
        authority: process.env.VUE_APP_AUTH,
      },
      cache: {
        cacheLocation: "localStorage",
      },
    },
    sw: undefined,
    accessToken: "",
    msalInstance: "",
    account: undefined,
    message: "",
    snackbar: false,
    url: "ais-eng-srv-la.cnpem.br",
    notifications: [],
    notification_count: 0
  },
  mutations: {
    setAccessToken(state, token) {
      state.accessToken = token;
    },
    async updateNotifications(state) {
      const token = await state.msalInstance.acquireTokenSilent({
        scopes: ["User.Read"],
        account: state.account,
      });

      let config = {
        headers: { Authorization: `Bearer ${token.accessToken}`, "Content-Type": "application/json" },
      };

      const response = await fetch(`https://${state.url}/simar/api/notification`, config);
      state.notifications = await response.json();
      state.notifications.reverse();
      state.notification_count = state.notifications.length;
    },
    setInstance(state, msalInstance) {
      state.msalInstance = msalInstance;
    },
    setAccount(state, account) {
      state.account = account;
    },
    showSnackbar(state, message) {
      state.snackbar = true;
      state.message = message;
    },
    hideSnackbar(state) {
      state.snackbar = false;
    },
    setUrl(state, url) {
      state.url = url;
    },
    setSw(state, sw) {
      state.sw = sw;
    },
  },
});

export default store;
