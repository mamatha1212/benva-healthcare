import { useState, useEffect } from 'react';
import { getLocationsHierarchy } from '@/components/DoorstepSection/actions';

export function useLocations() {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getLocationsHierarchy().then(data => {
      if (mounted) {
        setLocations(data);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return { locations, loading };
}
