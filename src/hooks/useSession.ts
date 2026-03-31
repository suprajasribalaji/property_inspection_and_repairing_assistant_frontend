import { useState, useEffect } from 'react';
import { createSession, getSessionHistory, Session, SessionHistory } from '@/services/api';

const SESSION_STORAGE_KEY = 'inspection_session_id';

export const useSession = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionHistory, setSessionHistory] = useState<SessionHistory | null>(null);

  // Initialize session on mount
  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Get existing session from localStorage
        const storedSessionId = localStorage.getItem(SESSION_STORAGE_KEY);
        
        if (storedSessionId) {
          // Try to load existing session from DB
          try {
            const history = await getSessionHistory(storedSessionId);
            setSessionId(storedSessionId);
            setSessionHistory(history);
            console.log('Using existing session:', storedSessionId);
          } catch (error) {
            // Session not found in DB, create a new one
            console.log('Session not found in DB, creating new one');
            const newSession = await createSession();
            setSessionId(newSession.id);
            localStorage.setItem(SESSION_STORAGE_KEY, newSession.id);
          }
        } else {
          // No session in localStorage, create new one
          console.log('No localStorage session, creating new one');
          const newSession = await createSession();
          setSessionId(newSession.id);
          localStorage.setItem(SESSION_STORAGE_KEY, newSession.id);
        }
      } catch (error) {
        console.error('Session initialization error:', error);
        // If anything fails, create a new session
        try {
          const newSession = await createSession();
          setSessionId(newSession.id);
          localStorage.setItem(SESSION_STORAGE_KEY, newSession.id);
        } catch (createError) {
          console.error('Failed to create new session:', createError);
        }
      } finally {
        setLoading(false);
      }
    };

    initializeSession();
  }, []);

  const refreshSessionHistory = async () => {
    if (!sessionId) return;
    
    try {
      const history = await getSessionHistory(sessionId);
      setSessionHistory(history);
    } catch (error) {
      console.error('Failed to refresh session history:', error);
    }
  };

  const clearSession = () => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setSessionId(null);
    setSessionHistory(null);
  };

  const createNewSession = async () => {
    try {
      const newSession = await createSession();
      setSessionId(newSession.id);
      localStorage.setItem(SESSION_STORAGE_KEY, newSession.id);
      setSessionHistory(null);
      return newSession;
    } catch (error) {
      console.error('Failed to create new session:', error);
      throw error;
    }
  };

  return {
    sessionId,
    loading,
    sessionHistory,
    refreshSessionHistory,
    clearSession,
    createNewSession,
  };
};
