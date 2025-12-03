import { useState, useEffect } from 'react';
import { initializeStorage } from '@/services/database.service';
import { seedAll } from '@/services/database.seed';

/**
 * Hook to initialize storage on app start
 */
export const useDatabase = () => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initStorage = async () => {
      try {
        await initializeStorage();
        setIsReady(true);
        console.log('✅ Storage initialized successfully');
      } catch (err) {
        console.error('❌ Error initializing storage:', err);
        setError(err as Error);
        setIsReady(true);
      }
    };

    initStorage();
  }, []);

  return { isReady, error };
};

/**
 * Hook to seed storage with initial data (for development/testing)
 */
export const useDatabaseSeeder = (shouldSeed: boolean = false) => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSeeded, setIsSeeded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!shouldSeed) return;

    const seed = async () => {
      setIsSeeding(true);
      try {
        await seedAll();
        setIsSeeded(true);
        console.log('✅ Storage seeded successfully');
      } catch (err) {
        console.error('❌ Error seeding storage:', err);
        setError(err as Error);
      } finally {
        setIsSeeding(false);
      }
    };

    seed();
  }, [shouldSeed]);

  return { isSeeding, isSeeded, error };
};
