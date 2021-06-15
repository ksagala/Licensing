const AppCache = 'app-20210615';
const DiagramsCache = 'diagrams-20210615';

const AppUrls = [
  '/',
  '/changes.htm',
  '/downloads.htm',
  '/favicon.ico',
  '/guide.htm',
  '/manifest.json',
  '/matrix.htm',
  '/robots.txt',
  '/saved.htm',
  '/settings.htm',
  '/sitemap.xml',
  '/viewsvg.htm',
  '/css/changes.min.css',
  '/css/common.min.css',
  '/css/downloads.min.css',
  '/css/guide.min.css',
  '/css/index.min.css',
  '/css/matrix.min.css',
  '/css/saved.min.css',
  '/css/settings.min.css',
  '/css/viewsvg.min.css',
  '/js/changes.min.js',
  '/js/common.min.js',
  '/js/diagram.min.js',
  '/js/downloads.min.js',
  '/js/guide.min.js',
  '/js/index.min.js',
  '/js/matrix.min.js',
  '/js/saved.min.js',
  '/js/settings.min.js',
  '/js/svg.min.js',
  '/js/viewsvg.min.js',
  '/media/apple-touch-icon.png',
  '/media/apple-touch-icon-precomposed.png',
  '/media/bug.svg',
  '/media/by.svg',
  '/media/cc.svg',
  '/media/changes.svg',
  '/media/close.svg',
  '/media/cog.svg',
  '/media/controls.svg',
  '/media/defaults.svg',
  '/media/delete.svg',
  '/media/diagram-highlight-dark.gif',
  '/media/diagram-highlight-light.gif',
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
  '/media/image-controls-dark.gif',
  '/media/image-controls-light.gif',
  '/media/import.svg',
  '/media/link.svg',
  '/media/linkedin.svg',
  '/media/matrix.svg',
  '/media/new.svg',
  '/media/open.svg',
  '/media/page-home1-dark.png',
  '/media/page-home1-light.png',
  '/media/page-home2-dark.png',
  '/media/page-home2-light.png',
  '/media/page-matrix-dark.gif',
  '/media/page-matrix-light.gif',
  '/media/page-saved-dark.png',
  '/media/page-saved-light.png',
  '/media/page-settings-dark.png',
  '/media/page-settings-light.png',
  '/media/page-viewsvg-dark.png',
  '/media/page-viewsvg-light.png',
  '/media/paypal.svg',
  '/media/print.svg',
  '/media/save.svg',
  '/media/search.svg',
  '/media/section-top.svg',
  '/media/shortcut-changes.png',
  '/media/shortcut-cog.png',
  '/media/shortcut-downloads.png',
  '/media/shortcut-guide.png',
  '/media/shortcut-home.png',
  '/media/shortcut-matrix.png',
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
  './EMS Enterprise - Simple.htm',
  './EMS Enterprise.htm',
  './Microsoft 365 Apps for Business.htm',
  './Microsoft 365 Apps for Enterprise.htm',
  './Microsoft 365 Apps.htm',
  './Microsoft 365 Business Basic.htm',
  './Microsoft 365 Business Premium.htm',
  './Microsoft 365 Business Standard.htm',
  './Microsoft 365 Business.htm',
  './Microsoft 365 Consumer.htm',
  './Microsoft 365 Education Student Use Benefits - Simple.htm',
  './Microsoft 365 Education Student Use Benefits.htm',
  './Microsoft 365 Education.htm',
  './Microsoft 365 Enterprise - E3.htm',
  './Microsoft 365 Enterprise - E5.htm',
  './Microsoft 365 Enterprise - F1.htm',
  './Microsoft 365 Enterprise - F3.htm',
  './Microsoft 365 Enterprise - F5.htm',
  './Microsoft 365 Enterprise - Frontline.htm',
  './Microsoft 365 Enterprise - Landscape.htm',
  './Microsoft 365 Enterprise - Venn.htm',
  './Microsoft 365 Enterprise.htm',
  './Microsoft 365 Personal and Family.htm',
  './Microsoft Project.htm',
  './Microsoft Teams Rooms.htm',
  './Microsoft Teams Rooms - Premium.htm',
  './Office 365 Education - Simple.htm',
  './Office 365 Education.htm',
  './Office 365 Enterprise - E1.htm',
  './Office 365 Enterprise - F3.htm',
  './Office 365 Enterprise - Simple.htm',
  './Office 365 Enterprise.htm',
  './Office Consumer.htm',
  './Windows 10 - Enterprise.htm',
  './Windows 10 - Pro.htm',
  './Windows 10 - VL.htm',
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
