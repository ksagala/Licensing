const AppCache = 'app-20210516';
const DiagramsCache = 'diagrams-20210516';

const AppUrls = [
  '/',
  '/changes.htm',
  '/favicon.ico',
  '/guide.htm',
  '/manifest.json',
  '/robots.txt',
  '/saved.htm',
  '/settings.htm',
  '/sitemap.xml',
  '/viewsvg.htm',
  '/css/changes.min.css',
  '/css/common.min.css',
  '/css/guide.min.css',
  '/css/index.min.css',
  '/css/saved.min.css',
  '/css/settings.min.css',
  '/css/viewsvg.min.css',
  '/js/changes.min.js',
  '/js/common.min.js',
  '/js/guide.min.js',
  '/js/index.min.js',
  '/js/saved.min.js',
  '/js/settings.min.js',
  '/js/viewsvg.min.js',
  '/media/apple-touch-icon.png',
  '/media/apple-touch-icon-precomposed.png',
  '/media/bug.svg',
  '/media/by.svg',
  '/media/cc.svg',
  '/media/changes.svg',
  '/media/close.svg',
  '/media/cog.svg',
  '/media/defaults.svg',
  '/media/delete.svg',
  '/media/download.svg',
  '/media/edit-off.svg',
  '/media/edit-on.svg',
  '/media/export.svg',
  '/media/favicon.svg',
  '/media/favicon-192.png',
  '/media/favicon-192-mask.png',
  '/media/favicon-512.png',
  '/media/favicon-512-mask.png',
  '/media/feedback.svg',
  '/media/flagged.svg',
  '/media/github.svg',
  '/media/guide.svg',
  '/media/home.svg',
  '/media/import.svg',
  '/media/link.svg',
  '/media/linkedin.svg',
  '/media/new.svg',
  '/media/open.svg',
  '/media/page-home1-dark.png',
  '/media/page-home1-light.png',
  '/media/page-home2-dark.png',
  '/media/page-home2-light.png',
  '/media/page-saved-dark.png',
  '/media/page-saved-light.png',
  '/media/page-settings-dark.png',
  '/media/page-settings-light.png',
  '/media/page-viewsvg-dark.png',
  '/media/page-viewsvg-light.png',
  '/media/page-viewsvg-saved-dark.png',
  '/media/page-viewsvg-saved-light.png',
  '/media/paypal.svg',
  '/media/print.svg',
  '/media/save.svg',
  '/media/section-top.svg',
  '/media/shortcut-cog.png',
  '/media/shortcut-guide.png',
  '/media/shortcut-home.png',
  '/media/shortcut-save.png',
  '/media/summary.png',
  '/media/summary_large_image.png',
  '/media/summary_wide.png',
  '/media/theme.svg',
  '/media/top.svg',
  '/media/twitter.svg',
  '/media/unflagged.svg',
  '/media/viewsvg-menu.png',
  '/media/viewsvg-menu-edit.png',
  '/media/zoom.svg',
];
const DiagramUrls = [
  './EMS Enterprise - Simple.svg',
  './EMS Enterprise.svg',
  './Microsoft 365 Apps for Business.svg',
  './Microsoft 365 Apps for Enterprise.svg',
  './Microsoft 365 Apps.svg',
  './Microsoft 365 Business Basic.svg',
  './Microsoft 365 Business Premium.svg',
  './Microsoft 365 Business Standard.svg',
  './Microsoft 365 Business.svg',
  './Microsoft 365 Consumer.svg',
  './Microsoft 365 Education Student Use Benefits - Simple.svg',
  './Microsoft 365 Education Student Use Benefits.svg',
  './Microsoft 365 Education.svg',
  './Microsoft 365 Enterprise - E3.svg',
  './Microsoft 365 Enterprise - E5.svg',
  './Microsoft 365 Enterprise - F1.svg',
  './Microsoft 365 Enterprise - F3.svg',
  './Microsoft 365 Enterprise - F5.svg',
  './Microsoft 365 Enterprise - Frontline.svg',
  './Microsoft 365 Enterprise - Landscape.svg',
  './Microsoft 365 Enterprise - Venn.svg',
  './Microsoft 365 Enterprise.svg',
  './Microsoft 365 Personal and Family.svg',
  './Microsoft Teams Rooms.svg',
  './Microsoft Teams Rooms - Premium.svg',
  './Office 365 Education - Simple.svg',
  './Office 365 Education.svg',
  './Office 365 Enterprise - E1.svg',
  './Office 365 Enterprise - F3.svg',
  './Office 365 Enterprise - Simple.svg',
  './Office 365 Enterprise.svg',
  './Office Consumer.svg',
  './Windows 10 - Enterprise.svg',
  './Windows 10 - Pro.svg',
  './Windows 10 - VL.svg',
];

/** Service Worker Install caches core app components and diagrams. */
function swInstall(event) {
  console.log('[Service Worker] Install', AppCache, DiagramsCache);
  event.waitUntil(Promise.all([
    caches.has(AppCache).then(
      function hasAppCache(has) {
        if (!has) {
          caches.open(AppCache).then(
            function cacheCoreUrls(cache) {
              return cache.addAll(AppUrls);
            }
          );
        }
      }
    ),
    caches.has(DiagramsCache).then(
      function hasDiagramsCache(has) {
        if (!has) {
          caches.open(DiagramsCache).then(
            function cacheDiagramUrls(cache) {
              return cache.addAll(DiagramUrls);
            }
          );
        }
      }
    ),
  ]));
}

/** Service Worker Activate deletes old caches. */
function swActivate(event) {
  console.log('[Service Worker] Activate', AppCache, DiagramsCache);
  event.waitUntil(caches.keys().then(
    function forEachKey(keys) {
      keys.forEach(
        function cachesDelete(key) {
          if (key !== AppCache && key !== DiagramsCache) {
            caches.delete(key);
          }
        }
      );
    }
  ));
}

/** Service Worker Fetch goes to cache-first then network (no updates). */
function swFetch(event) {
  event.respondWith(caches.match(event.request).then(
    function cachesMatch(cachedResponse) {
      if (cachedResponse) {
        return cachedResponse;
      }

      console.log('[Service Worker] Fetch fallback', event.request.url);
      const requestClone = event.request.clone();
      return fetch(requestClone);
    }
  ));
}

self.addEventListener('install', swInstall);
self.addEventListener('activate', swActivate);
self.addEventListener('fetch', swFetch);
