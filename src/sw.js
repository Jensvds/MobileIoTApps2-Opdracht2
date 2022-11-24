import { precacheAndRoute } from 'workbox-precaching';
// Optional: use the injectManifest mode of one of the Workbox
// build tools to precache a list of URLs, including fallbacks.
precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('push', (event) => {
    console.log(`Push received with this data: "${event.data.text()}"`);

    clients.matchAll({ "includeUncontrolled": true }).then(clients => clients.forEach(client => {
        client.postMessage(event.data.text());
    }))

});

self.addEventListener('message', (event) => { console.log("SW Received Message:" + event.data); })