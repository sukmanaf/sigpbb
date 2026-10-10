import { useState, useEffect } from 'react';
import { NopDetail } from '@/types/map';

export function useNopDetail(nop: string | null) {
  const [data, setData] = useState<NopDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!nop) {
      setData(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    fetch(`/api/nops/${encodeURIComponent(nop)}/detail`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch NOP detail');
        return res.json();
      })
      .then((json) => setData(json))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [nop]);

  return { data, isLoading, error };
}
