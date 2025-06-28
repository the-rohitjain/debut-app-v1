import { useState, useEffect, useRef, useCallback } from 'react';
import {
  getFirestore, collection, query, where, limit, getDocs
} from 'firebase/firestore';
import { getDistance } from '../utils';
import { CATEGORY_MAPPING, PAGE_SIZE } from '../config/constants';
import * as geofire from 'geofire-common';

export function usePlaces(activeFilter, sortBy, userLocation) {
  const [places, setPlaces] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isPaginating, setIsPaginating] = useState(false);
  const [error, setError] = useState(null);
  const didFetchRef = useRef(false);

  const radiusInM = 10000; // 10 km radius

  const fetchPlaces = useCallback(
    async (reset = false) => {
      if (!userLocation) return;
      if (reset) setIsInitialLoading(true);
      else setIsPaginating(true);

      setError(null);

      try {
        const db = getFirestore();
        const center = [userLocation.lat, userLocation.lng];
        const bounds = geofire.geohashQueryBounds(center, radiusInM);
        const promises = [];

        for (const b of bounds) {
          let q = collection(db, 'places');
          q = query(q,
            where('geohash', '>=', b[0]),
            where('geohash', '<=', b[1]),
            limit(PAGE_SIZE)
          );

          const allowed = CATEGORY_MAPPING[activeFilter] || [];
          if (activeFilter !== 'All' && allowed.length > 0) {
            q = query(q, where('category', 'in', allowed));
          }

          promises.push(getDocs(q));
        }

        const snapshots = await Promise.all(promises);
        const allDocs = [];

        for (const snap of snapshots) {
          for (const doc of snap.docs) {
            const data = doc.data();
            const lat = data.coords.latitude;
            const lng = data.coords.longitude;
            const dist = getDistance(userLocation.lat, userLocation.lng, lat, lng);
            if (dist <= radiusInM / 1000) {
              allDocs.push({
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate?.() || new Date(),
                coords: { lat, lng },
                distance: dist
              });
            }
          }
        }

        const uniqueDocs = Array.from(
          new Map(allDocs.map(doc => [doc.id, doc])).values()
        );

        const sortedDocs = sortBy === 'rating'
          ? uniqueDocs.sort((a, b) => b.rating - a.rating)
          : sortBy === 'added'
          ? uniqueDocs.sort((a, b) => b.createdAt - a.createdAt)
          : uniqueDocs.sort((a, b) => a.distance - b.distance);

        setPlaces(reset ? sortedDocs : (prev) => [...prev, ...sortedDocs]);
        setHasMore(sortedDocs.length === PAGE_SIZE);
      } catch (err) {
        console.error('Geohash fetch error:', err);
        setError('Could not load places.');
      } finally {
        setIsInitialLoading(false);
        setIsPaginating(false);
      }
    },
    [activeFilter, sortBy, userLocation]
  );

  useEffect(() => {
    if (userLocation && !didFetchRef.current) {
      didFetchRef.current = true;
      fetchPlaces(true);
    }
  }, [userLocation, fetchPlaces]);

  return {
    places,
    isInitialLoading,
    isPaginating,
    hasMore,
    error,
    fetchMore: () => {
      if (hasMore && !isPaginating) {
        fetchPlaces(false);
      }
    },
    refetch: () => {
      didFetchRef.current = false;
      fetchPlaces(true);
    },
  };
}