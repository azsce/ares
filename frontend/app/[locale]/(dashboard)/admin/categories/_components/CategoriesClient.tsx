"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Box, Typography, Stack, Snackbar, Alert } from "@mui/material";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { ApiError } from "@/utils/api-client";
import {
  searchCategories,
  getCategorySummary,
  deleteCategory,
  AdminCategoryListDto,
  CategorySummary,
} from "@/api-clients/categories/categories";

import { CategorySummaryCards } from "./CategorySummaryCards";
import { CategoryFiltersToolbar } from "./CategoryFiltersToolbar";
import { CategoryTable } from "./CategoryTable";

interface CategoriesClientProps {
  initialSummary: CategorySummary | null;
  initialCategories: AdminCategoryListDto[];
  initialTotalCount: number;
  initialTotalPages: number;
}

export default function CategoriesClient({
  initialSummary,
  initialCategories,
  initialTotalCount,
  initialTotalPages,
}: CategoriesClientProps) {
  const { data: session } = useSession();
  const t = useTranslations("dashboardAdmin.categories");
  const tc = useTranslations("common");

  const [categories, setCategories] = useState<AdminCategoryListDto[]>(initialCategories);
  const [summary, setSummary] = useState<CategorySummary | null>(initialSummary);
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [offer, setOffer] = useState("");
  const [sortBy, setSortBy] = useState("Name A-Z");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [totalPages, setTotalPages] = useState(initialTotalPages);

  const isInitialMount = useRef(true);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      if (!isInitialMount.current) {
        setPage(1);
      }
    }, 300);
    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  const fetchSummary = useCallback(async () => {
    try {
      setSummaryLoading(true);
      const data = await getCategorySummary();
      setSummary(data);
    } catch {
      // Non-blocking error for stats
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await searchCategories({
        search: debouncedSearch,
        status,
        offer,
        sortBy,
        page,
        pageSize,
      });
      setCategories(res.data);
      setTotalCount(res.totalCount);
      setTotalPages(res.totalPages);
    } catch {
      setError(t("alerts.loadError"));
    } finally {
      setLoading(false);
    }
  }, [t, debouncedSearch, status, offer, sortBy, page, pageSize]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (session?.accessToken) {
      void fetchCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, status, offer, sortBy, page]);

  const handleDelete = async (id: string, vehicleCount: number) => {
    if (vehicleCount > 0) {
      setSnackbar({ open: true, message: t("alerts.deleteHasVehiclesError"), severity: "error" });
      return;
    }

    if (!window.confirm(t("actions.deleteConfirm"))) return;

    try {
      await deleteCategory(id);
      void fetchSummary();
      void fetchCategories();
      setSnackbar({ open: true, message: t("alerts.deleteSuccess"), severity: "success" });
    } catch (err: unknown) {
      setSnackbar({
        open: true,
        message: err instanceof ApiError ? err.message : t("alerts.deleteError"),
        severity: "error",
      });
    }
  };

  const filtersActive = Boolean(debouncedSearch || status || offer);
  const handleClearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setStatus("");
    setOffer("");
    setPage(1);
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto", p: { xs: 2, sm: 3 } }}>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          {t("title")}
        </Typography>
      </Stack>

      <CategorySummaryCards summary={summary} summaryLoading={summaryLoading} t={t} />

      <CategoryFiltersToolbar
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        offer={offer}
        setOffer={setOffer}
        sortBy={sortBy}
        setSortBy={setSortBy}
        setPage={setPage}
        t={t}
      />

      <CategoryTable
        categories={categories}
        loading={loading}
        error={error}
        totalCount={totalCount}
        totalPages={totalPages}
        page={page}
        setPage={setPage}
        fetchCategories={fetchCategories}
        handleDelete={handleDelete}
        filtersActive={filtersActive}
        handleClearFilters={handleClearFilters}
        t={t}
        tc={tc}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => {
          setSnackbar({ ...snackbar, open: false });
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
