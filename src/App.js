import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getFirestore, collection, doc, setDoc, deleteDoc, getDocs
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

import LandingScreen from './screens/LandingScreen';
import ListScreen from './screens/ListScreen';
import WishlistScreen from './screens/WishlistScreen';
import DetailScreen from './screens/DetailScreen';
import { firebaseConfig } from './firebase';
import { usePlaces } from './hooks/usePlaces';
import { useUserLocation } from './hooks/useUserLocation';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('landing');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [activeFilter, setActiveFilter] = useState('Cafe');
  const [sortBy, setSortBy] = useState('distance');
  const [userId, setUserId] = useState(null);
  const [wishlistIds, setWishlistIds] = useState(new Set());

  const userLocation = useUserLocation();

  const {
    places,
    isInitialLoading,
    isPaginating,
    hasMore,
    error,
    fetchMore,
    refetch
  } = usePlaces(activeFilter, sortBy, userLocation);

  useEffect(() => {
    if (!firebaseConfig || firebaseConfig.apiKey === "YOUR_API_KEY") return;

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
        signInAnonymously(auth).catch(() => {
          console.error("Could not authenticate.");
        });
      }
    });
  }, []);

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
    refetch();
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
        isLoading={isInitialLoading}
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
        isInitialLoading={isInitialLoading}
        isPaginating={isPaginating}
        places={places}
        onSelectPlace={setSelectedPlace}
        activeFilter={activeFilter}
        onFilterChange={(cat) => {
          setActiveFilter(cat);
          refetch();
        }}
        sortBy={sortBy}
        onSortChange={(sort) => {
          setSortBy(sort);
          refetch();
        }}
        error={error}
        wishlistIds={wishlistIds}
        onWishlistToggle={onWishlistToggle}
        onShowWishlist={() => setCurrentScreen('wishlist')}
        onBack={() => setCurrentScreen('landing')}
        onLoadMore={fetchMore}
        hasMore={hasMore}
      />
    </div>
  );
}