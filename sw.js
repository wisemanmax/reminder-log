const CACHE_NAME='reminderlog-v4';
const ASSETS=[
  '/',
  '/index.html',
  '/icon.svg',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap'
];
const CDN_ASSETS=[
  'https://cdn.jsdelivr.net/npm/react@18.3.1/umd/react.production.min.js',
  'https://cdn.jsdelivr.net/npm/react-dom@18.3.1/umd/react-dom.production.min.js',
  'https://cdn.jsdelivr.net/npm/recharts@2.12.7/umd/Recharts.js',
  'https://cdn.jsdelivr.net/npm/@babel/standalone@7.26.0/babel.min.js'
];
self.addEventListener('install',e=>{
  e.waitUntil(
    caches.open(CACHE_NAME).then(c=>{
      return c.addAll(ASSETS).catch(()=>{}).then(()=>{
        return Promise.all(CDN_ASSETS.map(url=>
          fetch(url,{mode:'cors'}).then(res=>{
            if(res&&(res.status===200||res.type==='opaque')){
              return c.put(url,res);
            }
          }).catch(()=>{})
        ));
      });
    })
  );
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const isCDN=CDN_ASSETS.some(url=>e.request.url===url);
  if(isCDN){
    e.respondWith(
      caches.match(e.request).then(cached=>{
        if(cached)return cached;
        return fetch(e.request).then(res=>{
          if(res&&(res.status===200||res.type==='opaque')){
            const clone=res.clone();
            caches.open(CACHE_NAME).then(c=>c.put(e.request,clone));
          }
          return res;
        });
      })
    );
  }else{
    e.respondWith(
      fetch(e.request).then(res=>{
        if(res&&(res.status===200||res.type==='opaque')){
          const clone=res.clone();
          caches.open(CACHE_NAME).then(c=>c.put(e.request,clone));
        }
        return res;
      }).catch(()=>caches.match(e.request))
    );
  }
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  e.waitUntil(clients.matchAll({type:'window'}).then(cl=>{
    if(cl.length>0){cl[0].focus();return;}
    return clients.openWindow('/');
  }));
});
