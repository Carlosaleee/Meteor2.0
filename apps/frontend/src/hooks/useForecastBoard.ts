"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async (id: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchForecast(id);
      if (controller.signal.aborted) return;
      setForecast(data);
      const brief = await fetchAiSummary(data);
      if (controller.signal.aborted) return;
      setSummary(brief);
    } catch (err) {
      if (controller.signal.aborted) return;
      const message = err instanceof Error && err.message ? err.message : "LINK DOWN — forecast feed unavailable";
      setError(message.includes("Invalid") || message.includes("HTTP") ? `LINK DOWN — ${message}` : message);
      setForecast(null);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void fetchLocations()
      .then((data) => {
        if (!controller.signal.aborted) setLocations(data);
      })
      .catch(() => {
        if (!controller.signal.aborted) setLocations([]);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    void load(locationId);
    return () => abortRef.current?.abort();
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
