const wbn = require('wbn');
var Buffer = require('buffer').Buffer;

var CACHE_VERSION = 1;
var CACHE_NAME = 'bundle-prototype-cache-v' + CACHE_VERSION;

self.addEventListener('install', function (event) {
    event.waitUntil(self.skipWaiting());

    console.log('Install event: ', event);
});

self.addEventListener('activate', function (event) {
    console.log('Activate event: ', event);

    event.waitUntil(self.skipWaiting());

    // delete old caches
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.map(function (cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting out of date cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(function () {
            return clients.claim();
        }).then(function () {
            console.log('Service worker activated, clients claimed');

            // notify the clients
            return self.clients.matchAll().then((clients) => {
                return Promise.all(clients.map((client) => {
                    return client.postMessage({ type: "activated" });
                }));
            });
        })
    );
});

// returns a Promise that resolves to an array containing the resources not already in the cache
async function computeResourcesToPreload(resources, cache) {
    console.log('computing the list of resources to preload');
    if (resources) {
        var promises = [];
        for (let resource of resources) {
            let resourcePromise = cache.match(resource).then((response) => {
                if (response) {
                    return null;
                } else {
                    return resource;
                }
            });
            promises.push(resourcePromise);
        }
        return Promise.all(promises).then((values) => values.filter(Boolean));
    } else {
        return [];
    }
}

self.addEventListener('message', function (event) {
    console.log('Message event', event.data);

    switch (event.data.command) {
        case 'bundlepreload':
            event.waitUntil(
                caches.open(CACHE_NAME).then(async (cache) => {
                    let wasNotEmpty = (event.data.resources && event.data.resources.length > 0);
                    let resources = await computeResourcesToPreload(event.data.resources, cache);
                    console.log(`resources to preload: ${wasNotEmpty ? resources : 'all'}`);

                    var headers = {};
                    if (wasNotEmpty) {
                        if (resources && resources.length > 0) {
                            headers['bundle-preload'] = resources.join(' ');
                        } else {
                            console.log('all the resources were already in cache, we are done');
                            return self.clients.matchAll().then((clients) => {
                                clients.forEach((client) => {
                                    client.postMessage({
                                        type: "bundlepreload-finished",
                                        url: event.data.source
                                    });
                                });
                            });
                        }
                    }
                    // else we will fetch the whole bundle

                    var request = new Request(event.data.source, { headers: new Headers(headers) });
                    const response = await fetch(request);

                    if (response.ok) {
                        // process the bundle
                        let buf = await response.arrayBuffer();
                        var buffer = Buffer.from(buf);
                        const bundle = new wbn.Bundle(buffer);

                        console.log('bundle received', bundle);

                        var promises = [];
                        for (const resource of bundle.urls) {
                            console.log('cache bundled resource: ' + resource);
                            let bundledResponse = bundle.getResponse(resource);
                            let responseToCache =
                                new Response(bundledResponse.body, { headers: bundledResponse.headers });
                            promises.push(cache.put(resource, responseToCache));
                        }

                        return Promise.all(promises).then(
                            self.clients.matchAll().then((clients) => {
                                clients.forEach((client) => {
                                    client.postMessage({
                                        type: "bundlepreload-finished",
                                        url: event.data.source
                                    });
                                });
                            }));
                    } else {
                        console.log('fetch failed', response);
                    }
                }));
            break;
        // do nothing
        default:
            console.log(`message: unknown command ${event.data.command}`);
    }
});

self.addEventListener('fetch', function (event) {
    console.log(`fetch: ${event.request.url}`);
    event.respondWith(
        caches.match(event.request)
            .then(function (response) {
                // Cache hit - return response
                if (response) {
                    console.log(`in cache: ${event.request.url}`);
                    return response;
                }

                // TODO if the resource is being fetched as part of a bundle, wait until it arrives

                return fetch(event.request).then(
                    function (response) {
                        // check if we got an invalid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            console.log(`error fetching: ${event.request.url}`, response);
                            return response;
                        }

                        // The response is a stream, we need to clone it
                        // so both the cache and the browser can consume it.
                        var responseToCache = response.clone();

                        event.waitUntil(caches.open(CACHE_NAME).then(function (cache) {
                            console.log(`fetched and cached: ${event.request.url}`);
                            cache.put(event.request, responseToCache);
                        }));

                        return response;
                    }
                ).catch((error) => console.log(error));
            })
    );
});

