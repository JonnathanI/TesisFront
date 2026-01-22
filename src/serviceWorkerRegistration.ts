// src/serviceWorkerRegistration.ts

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);

export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        navigator.serviceWorker.ready.then(() => {
          console.log('Service Worker activo (localhost)');
        });
      } else {
        navigator.serviceWorker
          .register(swUrl)
          .then(() => {
            console.log('Service Worker registrado');
          })
          .catch(error => {
            console.error('Error SW:', error);
          });
      }
    });
  }
}
