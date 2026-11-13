import mongoose from 'mongoose';

let isConnected = false;

export function resolveMongoURI(): string | null {
  const envUri = (process.env.MONGODB_URI || '').trim().replace(/^["']|["']$/g, '');
  if (
    envUri &&
    (envUri.startsWith('mongodb://') || envUri.startsWith('mongodb+srv://')) &&
    !envUri.includes('<username>') &&
    !envUri.includes('<password>')
  ) {
    if (/^mongodb(?:\+srv)?:\/\/[^/]+\/?(?:\?.*)?$/.test(envUri)) {
      const [address, query] = envUri.split('?');
      return `${address.replace(/\/$/, '')}/ahk_bridal_studio?${query || 'retryWrites=true&w=majority'}`;
    }
    return envUri;
  }
  return null;
}

export async function connectToMongoDB(): Promise<boolean> {
  const uri = resolveMongoURI();

  if (!uri) {
    console.log('[MongoDB] MONGODB_URI is not set; starting without database persistence.');
    return false;
  }

  if (isConnected && mongoose.connection.readyState === 1) {
    return true;
  }

  try {
    console.log('[MongoDB] Connecting...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[MongoDB] Connected to database: ${mongoose.connection.name || 'ahk_bridal_studio'}`);
    return true;
  } catch (error: any) {
    console.error('[MongoDB] Connection error:', error?.message || error);
    isConnected = false;
    return false;
  }
}

export function getDatabaseStatus() {
  const state = mongoose.connection.readyState;
  const stateMap: { [key: number]: string } = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return {
    status: stateMap[state] || 'unknown',
    database: mongoose.connection.name || 'ahk_bridal_studio',
    host: mongoose.connection.host || 'not configured'
  };
}
