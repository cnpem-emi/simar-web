interface PushNotification {
    date: string,
    message: string,
    oid: string
}

interface Device {
    endpoint: string,
    user_agent: string,
    host: string,
    auth: string,
    p256dh: string
}

export { Device, PushNotification };