export const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const formatTime = (time) => {
  if (!time) return '';
  const [hourStr, minuteStr] = time.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
  const formattedMinute = minute < 10 ? `0${minute}` : minute;
  return `${formattedHour}:${formattedMinute} ${ampm}`;
};

export const parseTimeString = (timeStr) => {
  if (!timeStr) return null;
  const [time, period] = timeStr.split(' ');
  const [hourStr, minuteStr] = time.split(':');
  let hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  const normalizedPeriod = period?.toUpperCase();

  if (normalizedPeriod === 'PM' && hour < 12) hour += 12;
  if (normalizedPeriod === 'AM' && hour === 12) hour = 0;

  return { hour, minute };
};

export const getTodayTiming = (openingHours) => {
  if (!openingHours || typeof openingHours !== 'object') return { openingTime: null, closingTime: null };
  const today = new Date().toLocaleString('en-US', { weekday: 'long' }); // e.g., "Monday"
  const timing = openingHours[today];

  if (!timing || typeof timing !== 'string' || !timing.includes('–')) {
    return { openingTime: null, closingTime: null };
  }

  const [openStr, closeStr] = timing.split('–').map(str => str.trim());
  return {
    openingTime: openStr,
    closingTime: closeStr,
  };
};

export const getOpenStatus = (openingTime, closingTime) => {
  if (!openingTime || !closingTime) return { text: 'Timings N/A', color: 'text-slate-500' };

  const now = new Date();
  const open = parseTimeString(openingTime);
  const close = parseTimeString(closingTime);

  if (!open || !close) return { text: 'Timings N/A', color: 'text-slate-500' };

  const openDate = new Date(now);
  openDate.setHours(open.hour, open.minute, 0, 0);

  const closeDate = new Date(now);
  closeDate.setHours(close.hour, close.minute, 0, 0);

  // Handle past-midnight closing (e.g., 10 PM – 2 AM)
  if (closeDate <= openDate) {
    closeDate.setDate(closeDate.getDate() + 1);
  }

  const timeDiff = (closeDate - now) / (1000 * 60); // in minutes

  if (now >= openDate && now <= closeDate) {
    if (timeDiff <= 30) {
      return { text: 'Closing soon', color: 'text-amber-500' };
    }
    return { text: 'Open now', color: 'text-green-600' };
  }

  return { text: 'Closed', color: 'text-red-600' };
};