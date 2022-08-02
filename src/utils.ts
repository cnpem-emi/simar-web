import { useInternalStore } from "./stores/internal";
import { useUserStore } from "./stores/user";

async function sendCommand(endpoint:string, method = "POST", body = {}) {
    const user = useUserStore();
    const internal = useInternalStore();

    let accessToken = "";
    if (user.msalInstance !== undefined && user.account !== undefined) {
        try {
            const token = await user.msalInstance.acquireTokenSilent({
                scopes: ["User.Read"],
                account: user.account,
            });
            accessToken = token.accessToken;
        } catch (err) {
            console.error(err);
            const token = await user.msalInstance.acquireTokenPopup({
                scopes: ["User.Read"],
                account: user.account,
            });
            accessToken = token.accessToken;
        }
    }

    const config = {
        method: method,
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }
    };

    if (method === "POST") {
        Object.assign(config, { body: JSON.stringify(body || {}) });
    }

    const response = await fetch(
        `https://${internal.url}/simar/api/${endpoint}`,
        config,
    );

    if (response.status == 500) {
        internal.showSnackbar("A server side error has occurred! Please try again later");
    }

    return response;
}

function b64_uint8(b64_string:string) {
    const padding = "=".repeat((4 - (b64_string.length % 4)) % 4);
    const base64 = (b64_string + padding).replace(/-/g, "+").replace(/_/g, "/");

    const raw_data = window.atob(base64);
    const output_arr = new Uint8Array(raw_data.length);

    for (let i = 0; i < raw_data.length; ++i) {
        output_arr[i] = raw_data.charCodeAt(i);
    }
    return output_arr;
}

export {b64_uint8, sendCommand}