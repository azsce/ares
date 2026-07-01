"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { logger } from "@/utils/logger";
import {
  getVehiclesApi,
  getAdminVehicleStatsApi,
  type Vehicle,
  type AdminVehicleFilter,
  type VehicleResponse,
  type AdminVehicleStats,
} from "./cars";

const DEFAULT_PAGE_SIZE = 10;
const DEBOUNCE_MS = 350;

export function useVehicles(
  accessToken: string | undefined,
  filter: AdminVehicleFilter = {},
  initialPage = 1,
  initialData?: VehicleResponse
) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialData?.data ?? []);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialData?.totalPages ?? 1);
  const [totalCount, setTotalCount] = useState(initialData?.totalCount ?? 0);
  const pageSize = DEFAULT_PAGE_SIZE;

  const [debouncedKeyword, setDebouncedKeyword] = useState(filter.keyword ?? "");
  useEffect(() => {
    const t = window.setTimeout(() => {
      setDebouncedKeyword(filter.keyword ?? "");
    }, DEBOUNCE_MS);
    return () => {
      window.clearTimeout(t);
    };
  }, [filter.keyword]);

  const nonKeywordFilter = useMemo(
    () => ({
      status: filter.status ?? "",
      supplierId: filter.supplierId ?? "",
      transmission: filter.transmission ?? "",
      sortBy: filter.sortBy ?? "newest",
      categoryId: filter.categoryId ?? "",
    }),
    [filter.status, filter.supplierId, filter.transmission, filter.sortBy, filter.categoryId]
  );

  const firstRun = useRef(true);
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setPage(1);
  }, [debouncedKeyword, nonKeywordFilter]);

  const fetchVehicles = useCallback(
    async (currentPage: number) => {
      if (!accessToken) return;
      try {
        setLoading(true);
        setError(null);
        const response = await getVehiclesApi(accessToken, currentPage, pageSize, {
          ...filter,
          keyword: debouncedKeyword,
        });
        setVehicles(response.data || []);
        setTotalPages(response.totalPages || 1);
        setTotalCount(response.totalCount || 0);
      } catch (err) {
        logger.error("Failed to fetch vehicles", err);
        setError("Could not load vehicles. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [accessToken, filter, debouncedKeyword, pageSize]
  );

  const hasMounted = useRef(false);
  useEffect(() => {
    if (initialData && !hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    void fetchVehicles(page);
  }, [page, fetchVehicles, initialData]);

  useEffect(() => {
    if (!loading && totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [loading, totalPages, page]);

  return {
    vehicles,
    loading,
    error,
    page,
    totalPages,
    totalCount,
    pageSize,
    setPage,
    refresh: () => void fetchVehicles(page),
  };
}

export function useAdminVehicleStats(accessToken: string | undefined, initialStats?: AdminVehicleStats) {
  const [stats, setStats] = useState<AdminVehicleStats | null>(initialStats ?? null);
  const [loading, setLoading] = useState(!initialStats);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!accessToken) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminVehicleStatsApi(accessToken);
      setStats(data);
    } catch (err) {
      logger.error("Failed to fetch admin vehicle stats", err);
      setError("Could not load statistics.");
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  const hasMounted = useRef(false);
  useEffect(() => {
    if (initialStats && !hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    void fetchStats();
  }, [fetchStats, initialStats]);

  return { stats, loading, error, refresh: () => void fetchStats() };
}
