import React, { useState, useMemo, useEffect } from 'react';
import { MapPin, Star, Heart, ExternalLink, ArrowLeft, Clock, ChevronDown, Phone, Share2, Compass, AlertTriangle, Coffee, UtensilsCrossed, Beer, ShoppingCart, Dumbbell, Clapperboard, Trees, Landmark } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";

// --- FIREBASE CONFIGURATION HERE ---
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};
// ---------------------------------------------


// --- APP CONFIG ---
const USER_LOCATION = { lat: 13.024563526836092, lng: 77.76266341408454 }; // User's location
const CURRENT_TIME = new Date(); // Use the actual current time
const CATEGORIES = ['Cafe', 'Restaurant', 'Gym', 'Bar', 'Store', 'Mall'];
const SORT_OPTIONS = {
  distance: 'Distance',
  rating: 'Rating',
  added: 'Date Added'
};

// --- HELPER FUNCTIONS ---
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const formatDateAdded = (date) => {
  if(!date) return '';
  const diffDays = Math.ceil(Math.abs(new Date() - date) / (1000 * 60 * 60 * 24));
  if (diffDays <= 1) return 'Added today';
  return `Added ${diffDays} days ago`;
};

const getOpenStatus = (openingTime, closingTime) => {
    if (!openingTime || !closingTime) return { text: 'Timings N/A', color: 'text-slate-500' };
    const [openHour, openMinute] = openingTime.split(':').map(Number);
    const [closeHour, closeMinute] = closingTime.split(':').map(Number);
    const now = CURRENT_TIME;
    let openDate = new Date(now);
    openDate.setHours(openHour, openMinute, 0, 0);
    let closeDate = new Date(now);
    closeDate.setHours(closeHour, closeMinute, 0, 0);
    if (closeDate < openDate) {
        if (now >= openDate) closeDate.setDate(closeDate.getDate() + 1);
        else openDate.setDate(openDate.getDate() - 1);
    }
    if (now >= openDate && now <= closeDate) return { text: 'Open now', color: 'text-green-600' };
    return { text: 'Closed', color: 'text-red-600' };
};

const formatTime = (time) => {
    if (!time) return '';
    const [hour, minute] = time.split(':').map(Number);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    const formattedMinute = minute < 10 ? `0${minute}` : minute;
    return `${formattedHour}:${formattedMinute} ${ampm}`;
};


// --- COMPONENTS ---

const CategoryCard = ({ category, icon, onSelect }) => (
    <button onClick={() => onSelect(category)} className="bg-white p-4 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center text-center w-full aspect-square">
        {icon}
        <p className="mt-3 text-base font-bold text-slate-800 tracking-tight">{category}</p>
    </button>
);

const LandingScreen = ({ onSelectCategory }) => {
    const categoryIcons = {
        Cafe: <Coffee size={36} className="text-amber-600"/>,
        Restaurant: <UtensilsCrossed size={36} className="text-red-600"/>,
        Bar: <Beer size={36} className="text-yellow-500"/>,
        Store: <ShoppingCart size={36} className="text-blue-600"/>,
        Mall: <ShoppingCart size={36} className="text-indigo-600"/>,
        Gym: <Dumbbell size={36} className="text-slate-600" />
    };
    
    return (
        <div className="bg-slate-100 p-6 h-full flex flex-col justify-center">
             <div className="text-center mb-10">
                <h1 className="text-6xl font-bold text-slate-900 tracking-tighter">Debut</h1>
                <p className="text-xl text-slate-500 mt-2">Be the first to know.</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
                {CATEGORIES.map(cat => (
                    <CategoryCard key={cat} category={cat} icon={categoryIcons[cat]} onSelect={onSelectCategory} />
                ))}
            </div>
        </div>
    );
};

const FilterChip = ({ category, isActive, onSelect }) => (
  <button
    onClick={() => onSelect(category)}
    className={`px-4 py-2 rounded-full mr-3 text-sm font-semibold transition-all duration-200 whitespace-nowrap border ${
      isActive
        ? 'bg-slate-900 text-white border-slate-900 shadow-md'
        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
    }`}
  >
    {category}
  </button>
);

const PlaceCard = ({ place, onSelect, isWishlisted, onWishlistToggle }) => {
  const status = getOpenStatus(place.openingTime, place.closingTime);
  return (
    <div className="w-full text-left flex items-start bg-white p-4 rounded-2xl mb-4 shadow-md hover:shadow-lg transition-all duration-300 border border-slate-100">
      <img src={place.images && place.images.length > 0 ? place.images[0] : 'https://placehold.co/400x400/e2e8f0/64748b?text=Image'} alt={place.name} className="w-28 h-28 rounded-xl object-cover" />
      <div className="flex-1 ml-5">
        <button onClick={() => onSelect(place)} className="w-full text-left">
            <p className="text-xl font-bold text-slate-800 tracking-tight">{place.name}</p>
        </button>
        <p className="text-sm text-slate-500 mt-1.5">{place.category} • {formatDateAdded(place.createdAt)}</p>
        <div className="flex items-center mt-2 text-sm text-slate-600">
          <span className={`font-bold ${status.color}`}>{status.text}</span>
          <span className="mx-2 text-slate-300">|</span>
          <span>{formatTime(place.openingTime)} - {formatTime(place.closingTime)}</span>
        </div>
        <div className="flex items-center mt-1">
          <MapPin size={14} className="text-slate-400" />
          <p className="ml-1.5 text-sm text-slate-600">{place.distance !== undefined && place.distance !== null ? `${place.distance.toFixed(1)} km away` : '...'}</p>
        </div>
      </div>
      <button onClick={() => onWishlistToggle(place.id, isWishlisted)} className={`p-2 rounded-full transition-colors ${isWishlisted ? 'text-rose-500' : 'text-slate-300 hover:text-rose-400'}`}>
          <Heart size={24} fill={isWishlisted ? 'currentColor' : 'none'} />
      </button>
    </div>
  );
};

const ListScreen = ({ isLoading, places, onSelectPlace, activeFilter, onFilterChange, sortBy, onSortChange, error, wishlistIds, onWishlistToggle, onShowWishlist, onBack }) => {

  return (
    <div className="bg-slate-100 p-4 h-full flex flex-col">
      <div className="flex justify-between items-center pt-6 pb-4">
        <div className="flex items-center space-x-2 flex-shrink-0">
            <button onClick={onBack} className="p-2 -ml-2 text-slate-500 hover:text-slate-900">
                <ArrowLeft size={28}/>
            </button>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Debut</h1>
        </div>
        <div className="flex-grow mx-4 overflow-hidden">
            <div className="overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <div className="flex flex-nowrap justify-center">
                {['All', ...CATEGORIES].map(cat => (
                    <FilterChip 
                    key={cat} 
                    category={cat} 
                    isActive={activeFilter === cat}
                    onSelect={onFilterChange}
                    />
                ))}
                </div>
            </div>
        </div>
        <div className="flex items-center space-x-4 flex-shrink-0">
            <div className="relative">
                <select 
                    value={sortBy} 
                    onChange={(e) => onSortChange(e.target.value)}
                    className="appearance-none bg-white py-2.5 pl-5 pr-10 rounded-full text-sm font-semibold text-slate-700 shadow-md border border-slate-200 focus:ring-2 focus:ring-slate-400 focus:outline-none"
                >
                    {Object.entries(SORT_OPTIONS).map(([key, value]) => (
                        <option key={key} value={key}>{value}</option>
                    ))}
                </select>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
             <button onClick={onShowWishlist} className="text-slate-400 hover:text-rose-500 transition-colors p-1">
                <Heart size={28} />
            </button>
          </div>
      </div>
      
      <p className="text-center text-lg text-slate-500 mb-6">Be the first to know.</p>
      
      <div className="flex-grow overflow-y-auto -mx-4 px-4 pt-2">
        {isLoading ? (
          <p className="text-center text-slate-500 mt-16">Loading new places...</p>
        ) : error ? (
           <div className="text-center text-red-500 mt-16 p-4 bg-red-100/50 rounded-lg">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4" />
                <p className="font-semibold">Could not load places.</p>
                <p className="text-sm">{error}</p>
            </div>
        ) : places.length > 0 ? (
          places.map(place => (
            <PlaceCard key={place.id} place={place} onSelect={onSelectPlace} isWishlisted={wishlistIds.has(place.id)} onWishlistToggle={onWishlistToggle} />
          ))
        ) : (
          <div className="text-center text-slate-500 mt-16">
              <p className="font-semibold">No new places found</p>
              <p className="text-sm">Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const WishlistScreen = ({ isLoading, places, onSelectPlace, onBack, wishlistIds, onWishlistToggle, userLocation }) => {
  const wishlistedPlaces = places
    .filter(p => wishlistIds.has(p.id))
    .map(p => ({...p, distance: getDistance(userLocation.lat, userLocation.lng, p.coords.lat, p.coords.lng)}));

  return (
    <div className="bg-slate-100 p-4 h-full flex flex-col">
      <div className="flex items-center pt-6 pb-4">
        <button onClick={onBack} className="p-2 -ml-2 mr-2 text-slate-500 hover:text-slate-900">
            <ArrowLeft size={28}/>
        </button>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">My Wishlist</h1>
      </div>
      
      <div className="flex-grow overflow-y-auto -mx-4 px-4 pt-6">
        {isLoading ? (
          <p className="text-center text-slate-500 mt-16">Loading...</p>
        ) : wishlistedPlaces.length > 0 ? (
          wishlistedPlaces.map(place => (
            <PlaceCard key={place.id} place={place} onSelect={onSelectPlace} isWishlisted={true} onWishlistToggle={onWishlistToggle} />
          ))
        ) : (
          <div className="text-center text-slate-500 mt-16">
              <p className="font-semibold">Your wishlist is empty</p>
              <p className="text-sm">Tap the heart on a place to save it here.</p>
          </div>
        )}
      </div>
    </div>
  );
}


const DetailScreen = ({ place, onBack, isWishlisted, onWishlistToggle }) => {
  const status = getOpenStatus(place.openingTime, place.closingTime);

  return (
    <div className="flex flex-col h-full bg-slate-100">
        <div className="absolute top-6 left-4 z-20">
             <button onClick={onBack} className="bg-white/80 backdrop-blur-sm p-2.5 rounded-full shadow-lg hover:bg-white transition">
               <ArrowLeft size={24} className="text-slate-800" />
             </button>
        </div>
        <div className="absolute top-6 right-4 z-20 flex space-x-2">
             <button onClick={() => onWishlistToggle(place.id, isWishlisted)} className={`bg-white/80 backdrop-blur-sm p-2.5 rounded-full shadow-lg transition-colors ${isWishlisted ? 'text-rose-500' : 'text-slate-700'}`}>
                <Heart size={24} fill={isWishlisted ? 'currentColor' : 'none'} />
             </button>
        </div>

      <div className="flex-grow overflow-y-auto">
        <div className="w-full h-80 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <div className="flex h-full">
                {place.images && place.images.length > 0 ? place.images.map((img, index) => (
                    <img key={index} src={img} alt={`${place.name} view ${index+1}`} className="w-full h-full object-cover flex-shrink-0" />
                )) : <div className="w-full h-full bg-slate-200 flex items-center justify-center"><p className="text-slate-500">No images available</p></div> }
            </div>
        </div>
        
        <div className="bg-slate-100 p-6 rounded-t-2xl -mt-5 relative z-10">
          <p className="text-lg font-semibold text-slate-500">{place.category}</p>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mt-1">{place.name}</h1>

          <div className="flex items-center mt-6 border-t border-slate-200 pt-5 text-base text-slate-700">
             <Clock size={20} className="text-slate-500 flex-shrink-0" />
             <div className="ml-4">
                <span className={`font-bold ${status.color}`}>{status.text}</span>
                <span className="ml-2.5">{formatTime(place.openingTime)} - {formatTime(place.closingTime)}</span>
             </div>
          </div>
          <div className="flex items-start mt-4 pt-4 border-t border-slate-200">
            <MapPin size={20} className="text-slate-500 mt-1 flex-shrink-0" />
            <p className="text-base text-slate-700 ml-4">{place.address}</p>
          </div>

          <div className="mt-8 border-t border-slate-200 pt-5">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight">About</h2>
              <p className="text-slate-600 mt-2 leading-relaxed">{place.about}</p>
          </div>
          
          <div className="mt-8 border-t border-slate-200 pt-5">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Reviews ({place.reviews ? place.reviews.length : 0})</h2>
                <div className="flex items-center bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                    <Star size={14} className="text-amber-500" />
                    <p className="text-sm font-bold ml-1.5">{place.rating}</p>
                </div>
            </div>
            <div className="space-y-4 mt-4">
                {place.reviews && place.reviews.length > 0 ? place.reviews.map((review, index) => (
                    <div key={index} className="bg-white p-4 rounded-xl border border-slate-200">
                        <div className="flex items-center">
                            <span className="font-bold text-slate-700">{review.name}</span>
                            <div className="flex ml-auto">
                                {[...Array(5)].map((_, i) => <Star key={i} size={16} className={i < review.rating ? 'text-amber-400' : 'text-slate-300'} fill="currentColor" />)}
                            </div>
                        </div>
                        <p className="text-slate-600 mt-2">{review.comment}</p>
                    </div>
                )) : <p className="text-slate-500 text-center py-4">No reviews yet.</p>}
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-slate-200 bg-white sticky bottom-0">
        <div className="flex space-x-3">
          <a href={`https://maps.google.com/?q=${place.coords.lat},${place.coords.lng}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 flex items-center justify-center py-3 rounded-2xl transition-colors">
             <Compass size={20} />
             <span className="text-lg font-bold ml-3">Directions</span>
          </a>
          <a href={place.website} target="_blank" rel="noopener noreferrer" className="flex-1 bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center py-3 rounded-2xl transition-colors">
             <ExternalLink size={20} />
             <span className="text-lg font-bold ml-3">Reserve</span>
          </a>
        </div>
      </div>
    </div>
  );
};

// Main App Component
export default function App() {
  const [currentScreen, setCurrentScreen] = useState('landing'); // landing, list, detail
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [activeFilter, setActiveFilter] = useState('Cafe');
  const [sortBy, setSortBy] = useState('distance');
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [userId, setUserId] = useState(null);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [userLocation] = useState({ lat: 13.024563526836092, lng: 77.76266341408454 });
  
  let db;

  useEffect(() => {
    if (!firebaseConfig || firebaseConfig.apiKey === "YOUR_API_KEY") {
        setError("Firebase config is missing.");
        setIsLoading(false);
        return;
    }

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    db = getFirestore(app);

    onAuthStateChanged(auth, user => {
        if (user) {
            setUserId(user.uid);
            const placesRef = collection(db, 'places');
            const wishlistRef = collection(db, 'users', user.uid, 'wishlist');

            const unsubPlaces = onSnapshot(placesRef, (snapshot) => {
              setError(null);
              const placesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt.toDate(), coords: { lat: doc.data().coords.latitude, lng: doc.data().coords.longitude } }));
              setPlaces(placesData);
              setIsLoading(false);
            }, (err) => { setError("Missing or insufficient permissions."); setIsLoading(false); });

            const unsubWishlist = onSnapshot(wishlistRef, (snapshot) => {
                const ids = new Set(snapshot.docs.map(doc => doc.id));
                setWishlistIds(ids);
            });

            return () => { unsubPlaces(); unsubWishlist(); }
        } else {
            signInAnonymously(auth).catch((err) => { setError("Could not authenticate."); setIsLoading(false); });
        }
    });
  }, []);

  const onWishlistToggle = async (placeId, isCurrentlyWishlisted) => {
    if (!userId) return;
    const db = getFirestore();
    const wishlistRef = doc(db, 'users', userId, 'wishlist', placeId);
    if (isCurrentlyWishlisted) {
      await deleteDoc(wishlistRef);
    } else {
      await setDoc(wishlistRef, { placeId, addedAt: new Date() });
    }
  };

  const processedPlaces = useMemo(() => {
    if (!userLocation) return [];

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const filteredPlaces = places
      .filter(place => new Date(place.createdAt) >= sixMonthsAgo)
      .map(place => ({
        ...place,
        distance: getDistance(userLocation.lat, userLocation.lng, place.coords.lat, place.coords.lng),
      }))
      .filter(place => place.distance <= 100)
      .filter(place => {
        if (activeFilter === 'All') return true;
        if (activeFilter === 'Supermarket') return ['Supermarket', 'Store'].includes(place.category);
        if (activeFilter === 'Cafe') return ['Cafe', 'bakery'].includes(place.category);
        if (activeFilter === 'Bar') return ['Bar', 'pub'].includes(place.category);
        if (activeFilter === 'Mall') return place.category === 'shopping_mall';
        return place.category === activeFilter;
      });
      
    switch (sortBy) {
        case 'rating': filteredPlaces.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
        case 'added': filteredPlaces.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); break;
        case 'distance': default: filteredPlaces.sort((a, b) => a.distance - b.distance); break;
    }
      
    return filteredPlaces;

  }, [places, activeFilter, sortBy, userLocation]);

  const handleSelectCategory = (category) => {
      setActiveFilter(category);
      setCurrentScreen('list');
  };

  if (selectedPlace) {
      return <DetailScreen 
                place={selectedPlace} 
                onBack={() => setSelectedPlace(null)} 
                isWishlisted={wishlistIds.has(selectedPlace.id)}
                onWishlistToggle={onWishlistToggle}
             />
  }
  
  if(currentScreen === 'landing') {
      return <LandingScreen onSelectCategory={handleSelectCategory} />
  }

  if (currentScreen === 'wishlist') {
      return <WishlistScreen 
                isLoading={isLoading}
                places={places} 
                onSelectPlace={setSelectedPlace} 
                onBack={() => setCurrentScreen('list')}
                wishlistIds={wishlistIds}
                onWishlistToggle={onWishlistToggle}
                userLocation={userLocation}
              />
  }

  return (
    <div className="h-screen w-full font-sans bg-slate-100">
        <ListScreen 
          isLoading={isLoading}
          places={processedPlaces} 
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
        />
    </div>
  );
}