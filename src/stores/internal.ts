import { defineStore } from 'pinia'

interface State {
  message: string,
  snackbar: boolean,
  url: string,
  sw?: ServiceWorkerRegistration,
}

export const useInternalStore = defineStore('internal', {
  state: (): State => ({
    message: "",
    snackbar: false,
    url: "ais-eng-srv-la.cnpem.br",
    sw: undefined,
  }),
  actions: {
    showSnackbar(message: string) {
      this.snackbar = true;
      this.message = message;
    },
    setUrl() {
      if (window.location.host === "vpn.cnpem.br") {
        const ipRegExp =
          /https?\/((?:(?:2(?:[0-4][0-9]|5[0-5])|[0-1]?[0-9]?[0-9])\.){3}(?:(?:2([0-4][0-9]|5[0-5])|[0-1]?[0-9]?[0-9])))\//;
        const match = ipRegExp.exec(window.location.href);
        if (match && match.length > 1) this.url = match[1];
      } else {
        console.log(process.env.NODE_ENV);
        if (process.env.NODE_ENV !== "development") this.url = window.location.host;
      }
    }
  }
})