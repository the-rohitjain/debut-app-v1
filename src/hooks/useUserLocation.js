import { useState, useEffect } from 'react';

export function useUserLocation() {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        if (typeof lat === 'number' && typeof lng === 'number') {
          console.log('📍 User location fetched:', { lat, lng });
          setLocation({ lat, lng });
        } else {
          console.warn('⚠️ Invalid coordinates received');
          setLocation(null);
        }
      },
      (error) => {
        console.warn('❌ Geolocation error or permission denied:', error);

        // Set fallback default location (e.g. Bengaluru)
        const fallback = { lat: 13.0245, lng: 77.7626 };
        console.log('🌐 Falling back to default location:', fallback);
        setLocation(fallback);
      },
      {
        enableHighAccuracy: true,
        timeout: 30000, // increased from 10s to 30s
        maximumAge: 0,
      }
    );
  }, []);

  return location;
}