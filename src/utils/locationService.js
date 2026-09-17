export const getCurrentLocation = () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        ok: false,
        message: 'Geolocation is not supported by your browser.',
        coords: { latitude: 26.9124, longitude: 75.7873 }, // Default office fallback
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          ok: true,
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          },
        });
      },
      (error) => {
        console.warn('Geolocation error:', error.message);
        resolve({
          ok: false,
          message: error.message || 'Unable to retrieve location.',
          coords: { latitude: 26.9124, longitude: 75.7873 }, // Fallback to office coordinates
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
};

/**
 * Calculates distance between two coordinates in meters using the Haversine formula.
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

export const isWithinRadius = (userLat, userLng, officeLat, officeLng, radiusMeters = 100) => {
  if (!userLat || !userLng || !officeLat || !officeLng) return true;
  const distance = calculateDistance(
    parseFloat(userLat),
    parseFloat(userLng),
    parseFloat(officeLat),
    parseFloat(officeLng)
  );
  return distance <= radiusMeters;
};
