import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "@/shared/i18n/routing";
import { getLocale } from "next-intl/server";
import { apiFetchJson } from "@/utils/api-client";
import { logger } from "@/utils/logger";
import CategoriesClient from "./_components/CategoriesClient";
import { AdminCategoryListDto, CategorySummary, PagedResult } from "@/api-clients/categories/categories";

export const metadata: Metadata = {
  title: "Categories | ARES Admin",
  description: "Manage categories across the platform.",
};

export default async function AdminCategoriesPage() {
  const locale = await getLocale();
  const session = await getServerSession(authOptions);

  if (!session || !session.user.roles.includes("Admin") || !session.accessToken) {
    return redirect({ href: "/", locale });
  }

  let initialSummary: CategorySummary | null = null;
  let initialCategories: AdminCategoryListDto[] = [];
  let initialTotalCount = 0;
  let initialTotalPages = 1;

  try {
    initialSummary = await apiFetchJson<CategorySummary>(`/api/admin/categories/summary`, {
      method: "GET",
      accessToken: session.accessToken,
    });

    // Fetch page 1 data with default sorting
    const categoriesRes = await apiFetchJson<PagedResult<AdminCategoryListDto>>(
      `/api/admin/categories/search?page=1&pageSize=10&sortBy=Name%20A-Z`,
      {
        method: "GET",
        accessToken: session.accessToken,
      }
    );

    initialCategories = categoriesRes.data || [];
    initialTotalCount = categoriesRes.totalCount || 0;
    initialTotalPages = categoriesRes.totalPages || 1;
  } catch (error) {
    logger.error("Failed to fetch initial categories data on server side", error);
  }

  return (
    <CategoriesClient
      initialSummary={initialSummary}
      initialCategories={initialCategories}
      initialTotalCount={initialTotalCount}
      initialTotalPages={initialTotalPages}
    />
  );
}
