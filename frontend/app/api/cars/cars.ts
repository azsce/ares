import { useState, useEffect } from "react";
import { apiFetchJson } from "@/utils/api-client";



export function useVehicles(accessToken: string | undefined, initialPage = 1) {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const fetchVehicles = async (currentPage: number) => {
    if (!accessToken) return;
    try {
      setLoading(true);
      const response = await apiFetchJson<any>(`api/vehicles/search/${currentPage}/${pageSize}`, {
        method: "POST",
        accessToken,
        body: JSON.stringify({})
      });
      setVehicles(response.data || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles(page);
  }, [page, accessToken]);

  return { vehicles, loading, page, totalPages, setPage, refresh: () => fetchVehicles(page) };
}    





const BASE_URL = "http://localhost:5000/api"; 

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
  status: string;
  availabilityStatus: string;
}

export const createCar = async (accessToken: string, payload: any) => {
  const res = await fetch(`${BASE_URL}/admin/cars/create`, {
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

  return await res.text();
};





// 1. Function to Delete a Car

export const deleteCar = async (accessToken: string, carId: string) => {
  const res = await fetch(
    `${BASE_URL}/delete-car/${carId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    }
  );

  const data = await res.text();
  console.log("DELETE RESPONSE:", res.status, data);

  if (!res.ok) {
    throw new Error(data || "Failed to delete car");
  }

  return data;
};

// ubdate car

export const updateCar = async (
  accessToken: string,
  carId: string,
  payload: any
) => {
  const res = await fetch(
    `${BASE_URL}/admin/cars/${carId}/edit`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        accept: "text/plain",
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Failed to update car");
  }

  return await res.text();
};


// get car by id

export const getCarById = async (accessToken: string, id: string) => {
  const res = await fetch(`${BASE_URL}/vehicles/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("API ERROR:", errorText);
    console.error("STATUS:", res.status);

    throw new Error(
      `Failed to fetch car (status: ${res.status})`
    );
  }

  return await res.json();
};