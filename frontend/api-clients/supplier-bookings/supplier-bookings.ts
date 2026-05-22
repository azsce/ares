import { useState, useEffect } from "react";
import { apiFetchJson } from "@/utils/api-client";
import { logger } from "@/utils/logger";

export interface SupplierBookingListItemDto {
  id: string;
  bookingNumber?: string;
  customerName?: string;
  vehicleId?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleImageUrl?: string;
  pickupDate?: string;
  returnDate?: string;
  totalPrice?: number;
  bookingStatus?: string;
  paymentStatus?: string;
  createdAt?: string;
  [key: string]: unknown;
}

export interface PagedResult<T> {
  items?: T[];
  resultData?: T[];
  data?: T[];
  totalCount?: number;
  totalPages?: number;
  pageInfo?: Array<{ totalRecords: number }>;
}

export const useSupplierBookings = (
  accessToken: string | undefined,
  page: number = 1,
  pageSize: number = 10,
  search: string = "",
  bookingStatus: string = "",
  paymentStatus: string = ""
) => {
  const [bookings, setBookings] = useState<SupplierBookingListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!accessToken) return;

      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (bookingStatus && bookingStatus !== "All") params.set("bookingStatus", bookingStatus);
        if (paymentStatus && paymentStatus !== "All") params.set("paymentStatus", paymentStatus);
        params.set("page", String(page));
        params.set("pageSize", String(pageSize));

        const responseData = await apiFetchJson<PagedResult<SupplierBookingListItemDto>>(
          `/api/supplier/bookings?${params.toString()}`,
          {
            method: "GET",
            accessToken: accessToken,
          }
        );

        setBookings(responseData.items || responseData.resultData || responseData.data || []);
        setTotalCount(responseData.totalCount || responseData.pageInfo?.[0]?.totalRecords || 0);
        setTotalPages(responseData.totalPages || Math.ceil((responseData.totalCount || 0) / pageSize) || 1);
      } catch (error) {
        logger.error("Error fetching supplier bookings", error);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      void fetchBookings();
    }, 300);

    return () => {
      clearTimeout(delayDebounceFn);
    };
  }, [accessToken, page, pageSize, search, bookingStatus, paymentStatus]);

  return { bookings, loading, totalPages, totalCount };
};

export interface SupplierBookingDetailsDto {
  id: string;
  bookingNumber?: string;
  createdAt?: string;
  pickupDate?: string;
  returnDate?: string;
  totalDays?: number;
  totalPrice?: number;
  status?: string;
  pickupLocation?: { id?: string; name?: string };
  dropOffLocation?: { id?: string; name?: string };
  customer?: { id?: string; name?: string; email?: string; phone?: string };
  vehicle?: {
    id?: string;
    make?: string;
    model?: string;
    year?: number;
    licensePlate?: string;
    primaryImageUrl?: string;
  };
  payment?: {
    latestKnownStatus?: string;
    paymentMethod?: string;
    amount?: number;
    currency?: string;
    processedTimestamp?: string;
  };
}

export async function getSupplierBookingById(
  accessToken: string,
  id: string
): Promise<SupplierBookingDetailsDto> {
  return apiFetchJson<SupplierBookingDetailsDto>(`/api/supplier/bookings/${id}`, {
    method: "GET",
    accessToken,
  });
}
