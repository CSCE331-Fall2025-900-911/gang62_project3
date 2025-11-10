require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
import { useState, useEffect } from "react";

export function useWeather() {
  const [temp, setTemp] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(async pos => {
      try {
        const { latitude, longitude } = pos.coords;
        const key = process.env.WEATHER_KEY;
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=imperial&appid=${key}`;
        const d = await fetch(url).then(r => r.json());
        setTemp(d.main.temp);
      } catch (err) {
        setError(err.message);
      }
    }, err => setError(err.message));
  }, []);

  return { temp, error };
}