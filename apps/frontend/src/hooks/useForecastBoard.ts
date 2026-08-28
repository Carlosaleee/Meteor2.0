"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchAiSummary, fetchForecast, fetchLocations } from "@/lib/api";
import type { Forecast, Location } from "@/lib/schemas";

export function useForecastBoard() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationId, setLocationId] = useState("ilha-comprida");
  const [dayIndex, setDayIndex] = useState(0);
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchForecast(id);
      setForecast(data);
      const brief = await fetchAiSummary(data);
      setSummary(brief);
    } catch {
      setError("LINK DOWN — forecast feed unavailable");
      setForecast(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchLocations()
      .then(setLocations)
      .catch(() => setLocations([]));
  }, []);

  useEffect(() => {
    void load(locationId);
  }, [locationId, load]);

  return {
    locations,
    locationId,
    setLocationId,
    dayIndex,
    setDayIndex,
    forecast,
    summary,
    error,
    loading,
  };
}
