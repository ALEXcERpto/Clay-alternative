import { useEffect, useRef, useCallback } from 'react';
import { getValidationStatus } from '../services/validationService';
import { useAppStore } from '../store/useAppStore';
import { JobStatus } from '../types';

const POLLING_INTERVAL = parseInt(import.meta.env.VITE_POLLING_INTERVAL_MS || '2000');

/**
 * Custom hook for polling validation status
 */
export const usePolling = (jobId: string | null, enabled: boolean) => {
  const intervalRef = useRef<number | null>(null);
  const { setValidationJob, setIsValidating, setCurrentStep } = useAppStore();

  const poll = useCallback(async () => {
    if (!jobId) return;

    try {
      const job = await getValidationStatus(jobId);
      setValidationJob(job);

      // Check if validation is complete
      if (job.status === JobStatus.COMPLETED || job.status === JobStatus.FAILED) {
        setIsValidating(false);

        if (job.status === JobStatus.COMPLETED) {
          setCurrentStep('completed');
        }

        // Stop polling
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    } catch (error) {
      console.error('Polling error:', error);
    }
  }, [jobId, setValidationJob, setIsValidating, setCurrentStep]);

  useEffect(() => {
    if (enabled && jobId) {
      // Start polling immediately
      poll();

      // Then poll at interval
      intervalRef.current = window.setInterval(poll, POLLING_INTERVAL);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }

    return undefined;
  }, [enabled, jobId, poll]);

  return { poll };
};
