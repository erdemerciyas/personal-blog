export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Server-side configuration
    await import('./instrumentation-server');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    // Edge runtime configuration
    await import('./instrumentation-edge');
  }
}