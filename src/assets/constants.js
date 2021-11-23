export const EMPTY_PVS = {
    Temperature: {
        name: "",
        value: "?",
        hi_limit: 30,
        lo_limit: 10,
        subscribed: false,
    },
    Pressure: {
        name: "",
        value: "?",
        hi_limit: 1000,
        lo_limit: 800,
        subscribed: false,
    },
    "Rack Open": {
        name: "",
        value: "?",
        hi_limit: "",
        lo_limit: "",
        subscribed: false,
    },
    Humidity: {
        name: "",
        value: "?",
        hi_limit: 70,
        lo_limit: 30,
        subscribed: false,
    },
    Voltage: {
        name: "",
        value: "?",
        hi_limit: 90,
        lo_limit: 340,
        subscribed: false,
    },
    Current: {
        name: "",
        values: ["?", "?", "?", "?", "?", "?", "?"],
        hi_limit: 0,
        lo_limit: 20,
        subscribed: [false, false, false, false, false, false, false],
    },
    Glitches: {
        name: "",
        value: "?",
        hi_limit: 90,
        lo_limit: 0,
        subscribed: false,
    },
    PFactor: {
        name: "",
        value: "?",
        hi_limit: 0.1,
        lo_limit: 0.9,
        subscribed: false,
    },
    Frequency: {
        name: "",
        value: "?",
        hi_limit: 70,
        lo_limit: 50,
        subscribed: false,
    }
};

export const SYMBOLS = {
    Temperature: " C",
    Humidity: "%",
    Pressure: " hPa",
    "Fan Speed": "RPM",
    Voltage: " V",
    Current: " A",
    Frequency: " Hz",
    PFactor: "",
    Glitches: ""
};

export const SHORTHAND_TYPES = {
    t: "Temperature",
    h: "Humidity",
    p: "Pressure",
    v: "Voltage",
};