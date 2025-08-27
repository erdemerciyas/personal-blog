export async function register() {
  try {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
      // Server-side configuration
      const { register: registerServer } = await import('./instrumentation-server');
      registerServer();
    }

    if (process.env.NEXT_RUNTIME === 'edge') {
      // Edge runtime configuration
      const { register: registerEdge } = await import('./instrumentation-edge');
      registerEdge();
    }

    if (process.env.NEXT_RUNTIME === 'browser') {
      // Client-side configuration
      const { register: registerClient } = await import('./instrumentation-client');
      registerClient();
    }
  } catch (error) {
    console.warn('Instrumentation setup failed:', error);
  }
}