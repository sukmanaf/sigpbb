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
      .then(async (res) => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || 'Data NOP tidak ditemukan');
        }
        return res.json();
      })
      .then((json) => setData(json))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [nop]);

  return { data, isLoading, error };
}
