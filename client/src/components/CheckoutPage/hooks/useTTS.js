import { useCallback } from 'react';

export function useTTS(ttsEnabled) {
  const speak = useCallback((text) => {
    if (ttsEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  }, [ttsEnabled]);

  return { speak };
}

