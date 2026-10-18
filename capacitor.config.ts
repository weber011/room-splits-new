import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.roomsplits.app",
  appName: "RoomSplits",
  webDir: "public",
  server: {
    // Live remote URL for RoomSplits (Next.js 15 App Router with SSR & Server Actions)
    url: process.env.CAPACITOR_SERVER_URL || "https://room-splits-new.vercel.app",
    cleartext: false,
    androidScheme: "https",
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
  },
};

export default config;
