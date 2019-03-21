importScripts("lib/cache-polyfill.js")

var CACHE_VERSION = 'app-v0a';
var CACHE_FILES = [
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_VERSION)
        .then(function(cache) {
            var k = cache.addAll(CACHE_FILES);
            return k
        })
        .catch(function(e,d){
        })
    );
});
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.open(CACHE_VERSION).then(function(cache) {
            return cache.match(event.request, {'ignoreSearch': true} ).then(function(response) {
                return response || fetch(event.request).then(function(response) {
                    return response;
                }).catch(function(e){
                    return "not found";
                });
            });
        })
    );
});

function requestBackend(event) {
    var url = event.request.clone();
    return fetch(url).then(function(res) {
        //if not a valid response send the error
        if (!res || res.status !== 200 || res.type !== 'basic') {
            return res;
        }
        var response = res.clone();

        caches.open(CACHE_VERSION).then(function(cache) {
            cache.put(event.request, response);
        });

        return res;
    })
}

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(keys) {
            return Promise.all(keys.map(function(key, i) {
                if (key !== CACHE_VERSION) {
                    return caches.delete(keys[i]);
                }
            }))
        })
    )
});

self.addEventListener('message', function(event) {
    console.log("get message", event)
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});
