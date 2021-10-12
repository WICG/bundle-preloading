function waitUntilInstalled(registration) {
    return new Promise(function (resolve, reject) {
        if (registration.installing) {
            registration.installing.addEventListener('statechange', function (e) {
                if (e.target.state == 'installed') {
                    resolve();
                } else if (e.target.state == 'redundant') {
                    reject();
                }
            });
        } else {
            resolve();
        }
    });
}

function onInstalled() {
    console.log("Service worker installed.");

    // Preload the resources listed in <script type="bundlepreload">.
    let scripts = document.getElementsByTagName("script");
    for (let script of scripts) {
        if (script.type === 'bundlepreload') {
            console.log(`Bundle preload: ${script.textContent}`);
            var data = JSON.parse(script.textContent);
            navigator.serviceWorker.controller.postMessage({
                command: 'bundlepreload',
                source: data.source,
                resources: data.resources
            });
        }
    }
}

// Service workers require HTTPS (http://goo.gl/lq4gCo). If we're running on a real web server
// (as opposed to localhost on a custom port, which is allowed), then change the protocol to HTTPS.
if ((!location.port || location.port == "80") && location.protocol != 'https:') {
    location.protocol = 'https:';
}

if ('serviceWorker' in navigator) {
    // Callback to receive messages from the service worker.
    navigator.serviceWorker.addEventListener('message', function (event) {
        console.log(event);
        if (event.data.type === 'bundlepreload-finished') {
            console.log(`Bundle received: ${event.data.url}`);
        }
    });

    // Register up the service worker that will carry out bundle preloading.
    navigator.serviceWorker.register('./service-worker-browserified.js', { scope: './' })
        .then(waitUntilInstalled)
        .then(onInstalled)
        .catch(function (error) {
            console.log(error);
        });
} else {
    console.log("The current browser doesn't support service workers.");
}
