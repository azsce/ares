import { useState, useEffect } from "react";
import { apiFetchJson } from "@/utils/api-client";

export const useBookings = (
  accessToken: string | undefined,
  user: { id: string; role: string } | undefined, // ضفنا اليوزر عشان نظبط الصلاحيات
  page: number = 0,
  size: number = 10,
  searchKeyword: string = "",
  statusFilter: string = "All"
) => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!accessToken || !user) return;

      setLoading(true);
      try {
        // نفس الـ Body بتاع صاحبك بالظبط عشان الباك إند يرضى عنه!
        const payload = {
          userId: null,
          suppliers: user.role === "Supplier" ? [user.id] : null,
          statuses: statusFilter === "All" ? null : [statusFilter],
          carId: null,
          filter: {
            from: null,
            to: null,
            keyword: searchKeyword || null,
            pickupLocation: null,
            dropOffLocation: null
          },
          page: page + 1, // الباك إند بتاعكم بيبدأ من 1
          size: size,
          language: "en"
        };

        const responseData = await apiFetchJson<any>(
          `/api/admin/bookings/search/${String(page + 1)}/${String(size)}`,
          {
            method: "POST",
            body: JSON.stringify(payload),
            accessToken: accessToken,
          }
        );

        // دعم كل الاحتمالات لاسم المصفوفة اللي راجعة
        setBookings(responseData.resultData || responseData.data || responseData.items || []);
        setTotalCount(responseData.pageInfo?.[0]?.totalRecords || responseData.totalCount || 0);
        setTotalPages(responseData.totalPages || Math.ceil((responseData.totalCount || 0) / size) || 1);

      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchBookings();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
// بدل كلمة user، هنحط user?.id و user?.role
  }, [accessToken, user?.id, user?.role, page, size, searchKeyword, statusFilter]);
  return { bookings, loading, totalPages, totalCount };
};