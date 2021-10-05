const Version = '20211006';

const CacheContent = [
  // Pages
  '/',
  '/changes.htm',
  '/compare.htm',
  '/comparing.htm',
  '/downloads.htm',
  '/guide.htm',
  '/matrix.htm',
  '/saved.htm',
  '/settings.htm',
  '/viewsvg.htm',
  // Misc
  '/favicon.ico',
  '/manifest.json',
  // '/robots.txt',
  // '/sitemap.xml',
  // Styles
  '/css/changes.min.css',
  '/css/common.min.css',
  '/css/compare.min.css',
  '/css/comparing.min.css',
  '/css/downloads.min.css',
  '/css/guide.min.css',
  '/css/index.min.css',
  '/css/matrix.min.css',
  '/css/saved.min.css',
  '/css/settings.min.css',
  '/css/viewsvg.min.css',
  // Javascript
  '/js/changes.min.js',
  '/js/common.min.js',
  '/js/compare.min.js',
  '/js/comparing.min.js',
  '/js/downloads.min.js',
  '/js/guide.min.js',
  '/js/index.min.js',
  '/js/matrix.min.js',
  '/js/saved.min.js',
  '/js/settings.min.js',
  '/js/viewsvg.min.js',
  // GIF
  '/media/diagram-highlight-dark.gif',
  '/media/diagram-highlight-light.gif',
  '/media/image-controls-dark.gif',
  '/media/image-controls-light.gif',
  '/media/page-matrix-dark.gif',
  '/media/page-matrix-light.gif',
  // PNG
  '/media/apple-touch-icon.png',
  '/media/favicon-192.png',
  '/media/favicon-192-mask.png',
  '/media/favicon-512.png',
  '/media/favicon-512-mask.png',
  '/media/page-compare-dark.png',
  '/media/page-compare-light.png',
  '/media/page-comparing-dark.png',
  '/media/page-comparing-light.png',
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
  '/media/shortcut-changes.png',
  '/media/shortcut-cog.png',
  '/media/shortcut-compare.png',
  '/media/shortcut-downloads.png',
  '/media/shortcut-guide.png',
  '/media/shortcut-home.png',
  '/media/shortcut-matrix.png',
  '/media/shortcut-save.png',
  '/media/summary.png',
  '/media/summary_large_image.png',
  '/media/summary_wide.png',
  '/media/teams-add-dark.png',
  '/media/teams-add-light.png',
  '/media/teams-app-dark.png',
  '/media/teams-app-light.png',
  '/media/teams-pin-dark.png',
  '/media/teams-pin-light.png',
  '/media/teams-upload-dark.png',
  '/media/teams-upload-light.png',
  // SVG
  '/media/favicon.svg', // favicon
  '/media/sprites.svg', // sprites
  // Diagrams
  '/Azure-AD-Premium.htm',
  '/EMS Enterprise - Simple.htm',
  '/EMS Enterprise.htm',
  '/EMS-Enterprise-E3.htm',
  '/EMS-Enterprise-E5.htm',
  '/Microsoft 365 Apps for Business.htm',
  '/Microsoft 365 Apps for Enterprise.htm',
  '/Microsoft 365 Apps.htm',
  '/Microsoft 365 Business Basic.htm',
  '/Microsoft 365 Business Premium.htm',
  '/Microsoft 365 Business Standard.htm',
  '/Microsoft 365 Business.htm',
  '/Microsoft 365 Consumer.htm',
  '/Microsoft 365 Education Student Use Benefits - Simple.htm',
  '/Microsoft 365 Education Student Use Benefits.htm',
  '/Microsoft 365 Education.htm',
  '/Microsoft-365-Education-A1-(Legacy).htm',
  '/Microsoft-365-Education-A1-for-Devices.htm',
  '/Microsoft-365-Education-A3.htm',
  '/Microsoft-365-Education-A5.htm',
  '/Microsoft 365 Enterprise - E3.htm',
  '/Microsoft 365 Enterprise - E5.htm',
  '/Microsoft 365 Enterprise - F1.htm',
  '/Microsoft 365 Enterprise - F3.htm',
  '/Microsoft 365 Enterprise - F5.htm',
  '/Microsoft 365 Enterprise - Frontline.htm',
  '/Microsoft 365 Enterprise - Landscape.htm',
  '/Microsoft 365 Enterprise - Venn.htm',
  '/Microsoft 365 Enterprise.htm',
  '/Microsoft 365 Personal and Family.htm',
  '/Microsoft-Defender-for-Endpoint.htm',
  '/Microsoft-Defender-for-Office-365.htm',
  '/Microsoft Project.htm',
  '/Microsoft Teams Rooms.htm',
  '/Microsoft Teams Rooms - Premium.htm',
  '/Office 365 Education - Simple.htm',
  '/Office 365 Education.htm',
  '/Office 365 Enterprise - E1.htm',
  '/Office 365 Enterprise - F3.htm',
  '/Office 365 Enterprise - Simple.htm',
  '/Office 365 Enterprise.htm',
  '/Office Consumer.htm',
  '/Windows 10 - Enterprise.htm',
  '/Windows 10 - Pro.htm',
  '/Windows 10 - VL.htm',
];

/** Service Worker Install caches core app components and diagrams. */
function swInstall(event) {
  console.log('[Service Worker] Install ', Version);

  self.skipWaiting();

  event.waitUntil(caches.has(Version).then(
    function hasCache(has) {
      if (!has) {
        caches.open(Version).then(
          function cacheAddAll(cache) {
            cache.addAll(CacheContent.map(
              function cacheMap(url) {
                return new Request(url, { cache: 'no-cache' });
              }
            ));
          }
        );
      }
    }
  ));
}

/** Service Worker Activate deletes old caches. */
function swActivate(event) {
  console.log('[Service Worker] Activate ', Version);
  event.waitUntil(caches.keys().then(
    function forEachKey(keys) {
      keys.forEach(
        function cachesDelete(key) {
          if (key !== Version) {
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
        const newHeaders = new Headers(cachedResponse.headers);
        newHeaders.set('cache-control', 'no-cache');

        const newResponse = new Response(cachedResponse.body, {
          status: cachedResponse.status,
          statusText: cachedResponse.statusText,
          headers: newHeaders
        });

        return newResponse;
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
