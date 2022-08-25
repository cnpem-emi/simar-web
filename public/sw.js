const channel = new BroadcastChannel("sw");

function receive_push(event) {
    const { image, tag, url, title, body } = event.data.json();

    const options = {
        data: url,
        body: body,
        icon: image,
        vibrate: [200, 100, 200],
        tag: tag,
        image: image,
    };
    channel.postMessage({ title: "Message Received" });
    console.log("Message received");

    event.waitUntil(self.registration.showNotification(title, options));
}

self.addEventListener("push", receive_push);