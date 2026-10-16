import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook para a Screen Wake Lock API.
 * Mantém a tela do celular do barman ou cozinheiro acesa durante o serviço,
 * reativando automaticamente quando o app volta do segundo plano.
 */
export function useWakeLock() {
  const [isLocked, setIsLocked] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const wakeLockRef = useRef<any>(null);
  const shouldReacquireRef = useRef(false);

  useEffect(() => {
    setIsSupported('wakeLock' in navigator);
  }, []);

  const requestLock = useCallback(async () => {
    if (!('wakeLock' in navigator)) return false;

    try {
      const sentinel = await (navigator as any).wakeLock.request('screen');
      wakeLockRef.current = sentinel;
      shouldReacquireRef.current = true;
      setIsLocked(true);

      sentinel.addEventListener('release', () => {
        setIsLocked(false);
        wakeLockRef.current = null;
      });

      return true;
    } catch (err: any) {
      console.warn('[WakeLock] Falha ao solicitar bloqueio de tela:', err.message);
      setIsLocked(false);
      return false;
    }
  }, []);

  const releaseLock = useCallback(async () => {
    shouldReacquireRef.current = false;
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
      } catch (err) {
        console.warn('[WakeLock] Erro ao liberar bloqueio:', err);
      } finally {
        wakeLockRef.current = null;
        setIsLocked(false);
      }
    }
  }, []);

  const toggleLock = useCallback(async () => {
    if (isLocked) {
      await releaseLock();
    } else {
      await requestLock();
    }
  }, [isLocked, requestLock, releaseLock]);

  // Reativar automaticamente quando a aba volta a ficar visível
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && shouldReacquireRef.current && !wakeLockRef.current) {
        await requestLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
      }
    };
  }, [requestLock]);

  return {
    isLocked,
    isSupported,
    toggleLock,
    requestLock,
    releaseLock,
  };
}
