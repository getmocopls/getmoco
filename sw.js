const staticCache = "static-cache";
const dynamicCache = "dynamic-cache";
const assets = [
  "/",
  "/index.html",
  "/pages/home.html",
  "/pages/driver.html",
  "/pages/admin.html",
  "/pages/fallback.html",
  "/pages/error.html",
  "/js/app.js",
  "/js/db.js",
  "/js/ui.js",
  "/js/materialize.min.js",
  "/css/materialize.min.css",
  "/img/getmoco.png",
  "/img/getmoco_logo.png",
  "/img/default-user.jpg",
  "https://fonts.googleapis.com/icon?family=Material+Icons",
];

const limitNumCache = (cacheName, num) => {
  caches.open(cacheName).then((cache) => {
    cache.keys().then((keys) => {
      if (keys.length > num) {
        cache.delete(keys[0]).then(limitNumCache(cacheName, num));
      }
    });
  });
};

// install process
self.addEventListener("install", (e) => {
  //console.log("sw is installed");

  e.waitUntil(
    caches.open(staticCache).then((cache) => {
      cache.addAll(assets);
    })
  );
});

// activate process
self.addEventListener("activate", (e) => {
  //console.log("sw is activated");

  // The activate handler takes care of cleaning up old caches.
  const currentCaches = [staticCache, dynamicCache];
  e.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return cacheNames.filter(
          (cacheName) => !currentCaches.includes(cacheName)
        );
      })
      .then((cachesToDelete) => {
        return Promise.all(
          cachesToDelete.map((cacheToDelete) => {
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// fetch process
self.addEventListener("fetch", (e) => {
  //console.log("sw fetch event", e);

  if (e.request.url.indexOf("firestore.googleapis.com") === -1) {
    e.respondWith(
      caches
        .match(e.request)
        .then((staticRes) => {
          return (
            staticRes ||
            fetch(e.request).then((dynamicRes) => {
              return caches.open(dynamicCache).then((cache) => {
                cache.put(e.request.url, dynamicRes.clone());
                limitNumCache(dynamicCache, 2);
                return dynamicRes;
              });
            })
          );
        })
        .catch(() => caches.match("/pages/fallback.html"))
    );
  }
});
