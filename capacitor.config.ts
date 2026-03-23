import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.europeek.app',
  appName: 'EuroPeek',
  webDir: 'build',
  server: {
    url: 'https://englishpeak.duckdns.org',
    cleartext: false
  }
};

export default config;