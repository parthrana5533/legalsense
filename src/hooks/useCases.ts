import { useState, useEffect } from 'react';
import type { LegalCase } from '@/types';
import { getCaseHistory } from '@/services/api/cases';
import { useAuth } from '@/context/AuthContext';

export function useCases() {
  const { user } = useAuth();
  const [cases, setCases] = useState<LegalCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCases = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching cases for user:', user.id);
      const result = await getCaseHistory();
      console.log('Cases response:', result);
      // Extract the actual cases array from nested response
      setCases(Array.isArray(result?.data?.data) ? result.data.data : []);
    } catch (err) {
      console.error('Failed to load cases:', err);
      setError('Failed to load cases');
      setCases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [user?.id]);

  return { cases, loading, error, refetch: fetchCases };
}
