// File: App.js (enhanced for distance debugging)

import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getFirestore, collection, query, where, orderBy, limit, startAfter, getDocs, doc, setDoc, deleteDoc
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

import LandingScreen from './screens/LandingScreen';
import ListScreen from './screens/ListScreen';
import WishlistScreen from './screens/WishlistScreen';
import DetailScreen from './screens/DetailScreen';
import { getDistance } from './utils';
import { firebaseConfig } from './firebase';
import { USER_LOCATION } from './config';

const PAGE_SIZE = 20;

const CATEGORY_MAPPING = {
  All: [],
  Cafe: ['Cafe', 'Bakery'],
  Restaurant: ['Restaurant'],
  Bar: ['Bar', 'Pub'],
  Store: ['Store', 'Supermarket'],
  Mall: ['Shopping_mall'],
  Gym: ['Gym']
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('landing');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [activeFilter, setActiveFilter] = useState('Cafe');
  const [sortBy, setSortBy] = useState('distance');
  const [places, setPlaces] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [userId, setUserId] = useState(null);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [userLocation] = useState(USER_LOCATION);

  useEffect(() => {
    if (!firebaseConfig || firebaseConfig.apiKey === "YOUR_API_KEY") {
      setError("Firebase config is missing.");
      setIsLoading(false);
      return;
    }

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        const wishlistRef = collection(db, 'users', user.uid, 'wishlist');
        const snap = await getDocs(wishlistRef);
        setWishlistIds(new Set(snap.docs.map(doc => doc.id)));
      } else {
        signInAnonymously(auth).catch((err) => {
          setError("Could not authenticate.");
          setIsLoading(false);
        });
      }
    });
  }, []);

  const fetchPlaces = useCallback(async (reset = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const db = getFirestore();
      let q = collection(db, 'places');

      const allowed = CATEGORY_MAPPING[activeFilter] || [];
      if (activeFilter !== 'All' && allowed.length > 0) {
        console.log("Applying Firestore filter with categories:", allowed);
        q = query(q, where('category', 'in', allowed));
      }

      if (sortBy === 'rating') {
        q = query(q, orderBy('rating', 'desc'));
      } else if (sortBy === 'added') {
        q = query(q, orderBy('createdAt', 'desc'));
      } else {
        q = query(q, orderBy('coords'));
      }

      if (!reset && lastDoc) {
        q = query(q, startAfter(lastDoc), limit(PAGE_SIZE));
      } else {
        q = query(q, limit(PAGE_SIZE));
      }

      const snap = await getDocs(q);
      const docs = snap.docs.map(doc => {
        const data = doc.data();
        const placeLat = data.coords?.latitude;
        const placeLng = data.coords?.longitude;

        const distance = getDistance(
          userLocation.lat,
          userLocation.lng,
          placeLat,
          placeLng
        );

        console.log("Place:", doc.id);
        console.log("Coords:", { lat: placeLat, lng: placeLng });
        console.log("Distance from user:", distance.toFixed(2), "km");

        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          coords: {
            lat: placeLat,
            lng: placeLng,
          },
          distance
        };
      });

      const sortedDocs = docs.sort((a, b) => a.distance - b.distance);

      if (reset) {
        setPlaces(sortedDocs);
      } else {
        setPlaces(prev => [...prev, ...sortedDocs]);
      }

      setLastDoc(snap.docs[snap.docs.length - 1] || null);
      setHasMore(snap.docs.length === PAGE_SIZE);
      setIsLoading(false);
    } catch (err) {
      console.error("Firestore error:", err);
      setError("Could not load places.");
      setIsLoading(false);
    }
  }, [activeFilter, sortBy, userLocation, lastDoc]);

    useEffect(() => {
      setLastDoc(null);
      fetchPlaces(true);
    }, [activeFilter, sortBy]);

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      fetchPlaces(false);
    }
  };

  const onWishlistToggle = async (placeId, isCurrentlyWishlisted) => {
    if (!userId) return;
    const db = getFirestore();
    const wishlistRef = doc(db, 'users', userId, 'wishlist', placeId);
    if (isCurrentlyWishlisted) {
      await deleteDoc(wishlistRef);
      setWishlistIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(placeId);
        return newSet;
      });
    } else {
      await setDoc(wishlistRef, { placeId, addedAt: new Date() });
      setWishlistIds(prev => new Set(prev).add(placeId));
    }
  };

  const handleSelectCategory = (category) => {
    setActiveFilter(category);
    setCurrentScreen('list');
  };

  if (selectedPlace) {
    return (
      <DetailScreen
        place={selectedPlace}
        onBack={() => setSelectedPlace(null)}
        isWishlisted={wishlistIds.has(selectedPlace.id)}
        onWishlistToggle={onWishlistToggle}
      />
    );
  }

  if (currentScreen === 'landing') {
    return <LandingScreen onSelectCategory={handleSelectCategory} />;
  }

  if (currentScreen === 'wishlist') {
    return (
      <WishlistScreen
        isLoading={isLoading}
        places={places}
        onSelectPlace={setSelectedPlace}
        onBack={() => setCurrentScreen('list')}
        wishlistIds={wishlistIds}
        onWishlistToggle={onWishlistToggle}
        userLocation={userLocation}
      />
    );
  }

  return (
    <div className="h-screen w-full font-sans bg-slate-100">
      <ListScreen
        isLoading={isLoading}
        places={places}
        onSelectPlace={setSelectedPlace}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        error={error}
        wishlistIds={wishlistIds}
        onWishlistToggle={onWishlistToggle}
        onShowWishlist={() => setCurrentScreen('wishlist')}
        onBack={() => setCurrentScreen('landing')}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
      />
    </div>
  );
}