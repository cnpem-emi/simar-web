import Vue from "vue";
import App from "./App.vue";
import vuetify from "./plugins/vuetify";
import store from "./store";

Vue.config.productionTip = false;
Vue.prototype.$msalInstance = {};

Vue.mixin({
  methods: {
    async send_command(endpoint, method = "POST", body = {}) {
      let config = {
        method: method,
        headers: { Authorization: `Bearer ${await this.get_token()}`, "Content-Type": "application/json" },
      };

      if (method === "POST") {
        config["body"] = JSON.stringify(body);
      }

      const response = await fetch(
        `https://${this.$store.state.url}/simar/api/${endpoint}`,
        config,
      );

      if (response.status == 500) {
        this.$store.commit(
          "showSnackbar",
          `A server side error has occurred! Please try again later`
        );
      }

      return response;
    },
    async get_token() {
      let token;
      try {
        token = await this.$store.state.msalInstance.acquireTokenSilent({
          scopes: ["User.Read"],
          account: this.$store.state.account,
        });
      } catch (err) {
        console.error(err);
        token = await this.$store.state.msalInstance.acquireTokenPopup({
          scopes: ["User.Read"],
          account: this.$store.state.account,
        });
      }

      return token.accessToken;
    },
    b64_uint8(b64_string) {
      const padding = "=".repeat((4 - (b64_string.length % 4)) % 4);
      const base64 = (b64_string + padding).replace(/-/g, "+").replace(/_/g, "/");

      const raw_data = window.atob(base64);
      const output_arr = new Uint8Array(raw_data.length);

      for (let i = 0; i < raw_data.length; ++i) {
        output_arr[i] = raw_data.charCodeAt(i);
      }
      return output_arr;
    }
  },
});

new Vue({
  store,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");

if (window.location.host === "vpn.cnpem.br") {
  const ipRegExp =
    /https?\/((?:(?:2(?:[0-4][0-9]|5[0-5])|[0-1]?[0-9]?[0-9])\.){3}(?:(?:2([0-4][0-9]|5[0-5])|[0-1]?[0-9]?[0-9])))\//;
  const match = ipRegExp.exec(window.location.href);
  if (match && match.length > 1) store.commit("setUrl", match[1]);
} else {
  console.log(process.env.NODE_ENV);
  if (process.env.NODE_ENV !== "development") store.commit("setUrl", window.location.host);
}