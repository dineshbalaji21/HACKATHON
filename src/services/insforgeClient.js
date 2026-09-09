import { createClient } from '@insforge/sdk';

const baseUrl = import.meta.env.VITE_INSFORGE_URL || 'https://cr4cnj6i.us-east.insforge.app';
const anonKey = import.meta.env.VITE_INSFORGE_ANON_KEY || 'anon_f83a43b0729f4a303830809009fc17a1dbf881163eae45736c43587839ef2d91';

export const insforge = createClient({
  baseUrl,
  anonKey,
});

export default insforge;
