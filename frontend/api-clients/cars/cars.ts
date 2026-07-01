import { apiFetchJson, toApiUrl } from "@/utils/api-client";
import { logger } from "@/utils/logger";

// ── Vehicle row type returned by the admin/supplier vehicles list ────────────

export interface Vehicle {
  id: string;
  vehicleId?: string;
  make: string;
  model: string;
  year?: number;
  color?: string;
  licensePlate?: string;
  transmission?: string;
  fuelType?: string;
  seats?: number;
  pricePerDay?: number;
  dailyRate?: number;
  locationCity?: string;
  description?: string;
  status?: string;
  availabilityStatus?: string;
  available?: boolean;
  imageUrl?: string;
  category?: string;
  categoryId?: string;
  categoryName?: string;
  hasActiveBookings?: boolean;
  // ── Admin table extras (backed by VehicleListDto) ──────────────────────────
  /** Backend `IsOnRental` — true when at least one Active booking is open. */
  isOnRental?: boolean;
  /** Supplier first + last name, concatenated. */
  supplierName?: string;
  [key: string]: unknown;
}

export interface VehicleResponse {
  data?: Vehicle[];
  totalPages?: number;
  totalCount?: number;
  page?: number;
  pageSize?: number;
}

// ── Filter shape forwarded to the backend admin search endpoint ──────────────

export enum VehicleStatus {
  Available = "Available",
  Unavailable = "Unavailable",
  FullyBooked = "FullyBooked",
  ComingSoon = "ComingSoon",
  Maintenance = "Maintenance",
  Retired = "Retired",
  Pending = "Pending",
  Approved = "Approved",
  Rejected = "Rejected",
}

export type VehicleStatusFilter = "" | VehicleStatus;
export type VehicleSortBy = "newest" | "oldest" | "priceHigh" | "priceLow";

export interface AdminVehicleFilter {
  keyword?: string;
  status?: VehicleStatusFilter;
  supplierId?: string;
  transmission?: string;
  sortBy?: VehicleSortBy;
  categoryId?: string;
}

function mapStatusToBackend(status: VehicleStatusFilter | undefined): string | undefined {
  if (!status) return undefined;
  switch (status) {
    case VehicleStatus.FullyBooked:
      return "OnRental";
    case VehicleStatus.Retired:
      return "Inactive";
    case VehicleStatus.Maintenance:
      return "Maintenance";
    case VehicleStatus.Available:
      return "Available";
    case VehicleStatus.Unavailable:
      return "Unavailable";
    case VehicleStatus.ComingSoon:
      return "ComingSoon";
    case VehicleStatus.Pending:
      return "Pending";
    case VehicleStatus.Approved:
      return "Approved";
    case VehicleStatus.Rejected:
      return "Rejected";
    default:
      return undefined;
  }
}

export async function getVehiclesApi(
  accessToken: string,
  page: number,
  pageSize: number,
  filter: AdminVehicleFilter = {}
): Promise<VehicleResponse> {
  const backendBody = {
    suppliers: filter.supplierId ? [filter.supplierId] : null,
    keyword: filter.keyword?.trim() ? filter.keyword.trim() : null,
    status: mapStatusToBackend(filter.status) ?? null,
    transmission: filter.transmission ? filter.transmission.trim() : null,
    sortBy: filter.sortBy ?? null,
    categoryId: filter.categoryId ? filter.categoryId : null,
  };

  return apiFetchJson<VehicleResponse>(`api/vehicles/search/${String(page)}/${String(pageSize)}`, {
    method: "POST",
    accessToken,
    body: JSON.stringify(backendBody),
  });
}

export interface CarPayload {
  userId: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  transmission: string;
  fuelType: string;
  seats: number;
  pricePerDay: number;
  locationCity: string;
  description: string;
  categoryId: string;
  status?: string;
  availabilityStatus?: string;
  imageUrl?: string;
}

export const createCar = async (accessToken: string, payload: CarPayload) => {
  const res = await fetch(toApiUrl("/api/admin/cars/create"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      accept: "text/plain",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to create car");
  }
  return res.text();
};

export const deleteCar = async (accessToken: string, carId: string) => {
  const res = await fetch(toApiUrl(`/api/delete-car/${carId}`), {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });
  const data = await res.text();
  logger.debug("Delete response", { status: res.status, data });
  if (!res.ok) {
    throw new Error(data || "Failed to delete car");
  }
  return data;
};

export const updateCar = async (accessToken: string, carId: string, payload: CarPayload) => {
  const res = await fetch(toApiUrl(`/api/admin/cars/${carId}/edit`), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      accept: "text/plain",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to update car");
  }
  return res.text();
};

export interface CarImageUploadResponse {
  imageId: string;
  url: string;
  size: string;
  isPrimary: boolean;
}

export const uploadCarImage = async (
  accessToken: string,
  carId: string,
  file: File
): Promise<CarImageUploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetchJson<CarImageUploadResponse>(`/api/admin/cars/${carId}/images/upload`, {
    method: "POST",
    accessToken,
    body: formData,
  });
};

export const getCarById = async (accessToken: string, id: string): Promise<Vehicle> => {
  const res = await fetch(toApiUrl(`/api/vehicles/${id}`), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    const errorText = await res.text();
    logger.error("API ERROR", errorText);
    logger.error("API STATUS", res.status);
    throw new Error(`Failed to fetch car (status: ${String(res.status)})`);
  }
  return res.json() as Promise<Vehicle>;
};

// ── Admin vehicle stats ───────────────────────────────────────────────────────

export interface AdminVehicleStats {
  readonly totalVehicles: number;
  readonly availableVehicles: number;
  readonly onRentalVehicles: number;
  readonly maintenanceVehicles?: number;
}

export async function getAdminVehicleStatsApi(accessToken: string): Promise<AdminVehicleStats> {
  return apiFetchJson<AdminVehicleStats>("api/vehicles/admin/stats", {
    method: "GET",
    accessToken,
  });
}
