"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Box, Container, Typography, TextField, Button, Stack, Paper,
  Select, MenuItem, FormControl, InputLabel, FormHelperText, ThemeProvider, createTheme, CircularProgress
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useSession } from "next-auth/react";
import { apiFetchJson } from "@/utils/api-client";

// Schema matching the form fields
const vehicleSchema = z.object({
  brand: z.string().min(2, "Brand must be at least 2 characters"),
  model: z.string().min(1, "Model is required"),
  pricePerDay: z.coerce.number().positive("Price must be greater than 0"),
  year: z.coerce.number().min(1900).max(new Date().getFullYear() + 1),
  supplier: z.string().optional(), // Make supplier optional since it's not always updatable
  fuel: z.string().min(1, "Fuel type is required"),
  available: z.boolean().default(true),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;
const MOCK_SUPPLIERS = ["AutoLux", "SpeedRent", "DriveEasy"];
const vehicleTheme = createTheme({ palette: { primary: { main: "#0F172A" } }, shape: { borderRadius: 12 } });

export default function EditCarPage() {
  const router = useRouter();
  const params = useParams();
  const carId = params.id as string;
  const { data: session } = useSession();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema) as any,
    defaultValues: {
      brand: "",
      model: "",
      pricePerDay: 0,
      year: new Date().getFullYear(),
      supplier: "",
      fuel: "",
      available: true
    }
  });

  useEffect(() => {
    const fetchVehicleDetails = async () => {
      if (!carId) return;
      try {
        setLoading(true);
        // Fetch vehicle details from backend
        const data = await apiFetchJson<any>(`api/vehicles/${carId}`);
        
        // Populate the form with real data
        reset({
          brand: data.make || "",
          model: data.model || "",
          pricePerDay: data.pricePerDay || 0,
          year: data.year || new Date().getFullYear(),
          supplier: data.supplier?.fullName || MOCK_SUPPLIERS[0],
          fuel: data.fuelType || "",
          available: data.availabilityStatus === "Available"
        });
      } catch (error) {
        console.error("Failed to fetch vehicle:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleDetails();
  }, [carId, reset]);

  const onSubmit = async (data: VehicleFormData) => {
    try {
      setSaving(true);
      if (!session?.accessToken) {
        alert("You must be logged in to edit this vehicle.");
        return;
      }

      // Map the form data back to UpdateVehicleRequest expected by backend
      const updatePayload = {
        make: data.brand,
        model: data.model,
        year: data.year,
        fuelType: data.fuel,
        pricePerDay: data.pricePerDay,
        availabilityStatus: data.available ? "Available" : "Unavailable"
      };

      await apiFetchJson(`api/admin/cars/${carId}/edit`, {
        method: "PUT",
        accessToken: session.accessToken,
        body: JSON.stringify(updatePayload)
      });
      
      alert("Vehicle Updated Successfully!");
      router.push('/admin/cars');
    } catch (error) {
      console.error("Error updating vehicle:", error);
      alert("Failed to update vehicle. Please check console for details.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={vehicleTheme}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/admin/cars')} sx={{ mb: 2 }}>
          Back to Fleet
        </Button>
        <Paper elevation={0} sx={{ p: 4, border: "1px solid #E2E8F0" }}>
          <Typography variant="h5" sx={{ mb: 4, fontWeight: 'bold' }}>Edit Vehicle</Typography>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              <Controller name="brand" control={control} render={({ field }: { field: any }) => (
                <TextField {...field} label="Make / Brand" fullWidth InputLabelProps={{ shrink: true }} error={!!errors.brand} helperText={errors.brand?.message} />
              )} />
              <Controller name="model" control={control} render={({ field }: { field: any }) => (
                <TextField {...field} label="Model" fullWidth InputLabelProps={{ shrink: true }} error={!!errors.model} helperText={errors.model?.message} />
              )} />
              <Stack direction="row" spacing={2}>
                <Controller name="year" control={control} render={({ field }: { field: any }) => (
                  <TextField {...field} type="number" label="Year" fullWidth InputLabelProps={{ shrink: true }} error={!!errors.year} helperText={errors.year?.message} />
                )} />
                <Controller name="pricePerDay" control={control} render={({ field }: { field: any }) => (
                  <TextField {...field} type="number" label="Price per Day" fullWidth InputLabelProps={{ shrink: true }} error={!!errors.pricePerDay} helperText={errors.pricePerDay?.message} />
                )} />
              </Stack>
              <FormControl fullWidth error={!!errors.supplier}>
                <InputLabel shrink>Supplier (Read-Only)</InputLabel>
                <Controller name="supplier" control={control} render={({ field }: { field: any }) => (
                  <Select {...field} label="Supplier" displayEmpty disabled>
                    <MenuItem value={field.value}>{field.value || "Select Supplier"}</MenuItem>
                    {MOCK_SUPPLIERS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                )} />
                {errors.supplier && <FormHelperText>{errors.supplier.message}</FormHelperText>}
              </FormControl>
              <Controller name="fuel" control={control} render={({ field }: { field: any }) => (
                <TextField {...field} label="Fuel Type" fullWidth InputLabelProps={{ shrink: true }} error={!!errors.fuel} helperText={errors.fuel?.message} />
              )} />
              <FormControl fullWidth>
                <InputLabel shrink>Status</InputLabel>
                <Controller name="available" control={control} render={({ field }: { field: any }) => (
                  <Select 
                    label="Status"
                    value={field.value ? "true" : "false"}
                    onChange={(e) => field.onChange(e.target.value === "true")}
                  >
                    <MenuItem value="true">Available</MenuItem>
                    <MenuItem value="false">Unavailable</MenuItem>
                  </Select>
                )} />
              </FormControl>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button variant="outlined" onClick={() => router.push('/admin/cars')} sx={{ mr: 2 }} disabled={saving}>Cancel</Button>
                <Button type="submit" variant="contained" color="primary" disabled={saving}>
                  {saving ? <CircularProgress size={24} color="inherit" /> : "Save Changes"}
                </Button>
              </Box>
            </Stack>
          </form>
        </Paper>
      </Container>
    </ThemeProvider>
  );
}
