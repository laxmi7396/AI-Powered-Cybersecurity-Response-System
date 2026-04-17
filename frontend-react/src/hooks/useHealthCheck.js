/**
 * useHealthCheck.js
 * Polls GET /health every 10 s until the model is loaded.
 * Returns { healthStatus: 'connecting'|'loading'|'online'|'offline' }
 */
import { useState, useEffect, useRef } from 'react';
import { fetchHealth } from '../api';

export function useHealthCheck() {
  const [healthStatus, setHealthStatus] = useState('connecting');
  const intervalRef = useRef(null);

  async function check() {
    try {
      const data = await fetchHealth();
      if (data.model_loaded) {
        setHealthStatus('online');
        clearInterval(intervalRef.current);
      } else {
        setHealthStatus('loading');
      }
    } catch {
      setHealthStatus('offline');
      clearInterval(intervalRef.current);
    }
  }

  useEffect(() => {
    check();
    intervalRef.current = setInterval(check, 10000);
    return () => clearInterval(intervalRef.current);
  }, []);

  return healthStatus;
}

export const HEALTH_LABELS = {
  connecting: 'Connecting…',
  loading:    'Loading Model…',
  online:     'Model Ready',
  offline:    'Backend Offline',
};
