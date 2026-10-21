export const getTurnstileToken = (turnstile, widgetId, fallback = '') => {
  const response = widgetId !== null ? turnstile?.getResponse?.(widgetId) : '';
  return response || fallback;
};
