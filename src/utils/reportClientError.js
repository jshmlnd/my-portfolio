export const reportClientError = (source, error) => {
  const payload = JSON.stringify({
    source,
    message: error instanceof Error ? error.message : String(error),
    pathname: window.location.pathname,
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/client-error', new Blob([payload], { type: 'application/json' }));
    return;
  }

  void fetch('/api/client-error', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: true,
  }).catch(() => {});
};
