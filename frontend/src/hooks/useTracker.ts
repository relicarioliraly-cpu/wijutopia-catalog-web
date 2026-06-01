import { API_URL } from '@/lib/api';

export const useTracker = () => {
  const trackClick = async (elementId: string): Promise<void> => {
    try {
      await fetch(`${API_URL}/api/metrics/track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ elementId }),
        keepalive: true
      });
    } catch (error) {
      console.warn(`No se pudo registrar el evento: ${elementId}`, error);
    }
  };

  return { trackClick };
};
