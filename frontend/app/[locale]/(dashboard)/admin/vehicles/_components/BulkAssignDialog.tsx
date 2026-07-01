"use client";

import { type JSX } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useTranslations } from "next-intl";
import type { Category } from "@/api-clients/categories/categories";

export interface BulkAssignDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onSubmit: () => Promise<void>;
  readonly selectedCount: number;
  readonly selectedCategoryId: string;
  readonly setSelectedCategoryId: (value: string) => void;
  readonly categories: readonly Category[];
  readonly loading: boolean;
}

export default function BulkAssignDialog({
  open,
  onClose,
  onSubmit,
  selectedCount,
  selectedCategoryId,
  setSelectedCategoryId,
  categories,
  loading,
}: BulkAssignDialogProps): JSX.Element {
  const t = useTranslations("dashboardAdmin.vehicles");

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{
        paper: { sx: { borderRadius: 2, p: 1, mx: { xs: 2, sm: "auto" } } },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>{t("bulkAssignTitle")}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 3 }}>
          {t("bulkAssignDesc", { count: selectedCount })}
        </Typography>
        <TextField
          select
          fullWidth
          label={t("categoryFilterLabel")}
          value={selectedCategoryId}
          onChange={e => {
            setSelectedCategoryId(e.target.value);
          }}
        >
          <MenuItem value="" disabled>
            {t("selectCategoryPlaceholder")}
          </MenuItem>
          {categories.map(c => (
            <MenuItem key={c.id} value={c.id}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions sx={{ flexWrap: "wrap", gap: 1, pb: 2, px: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ borderRadius: 2, flex: { xs: 1, sm: "none" } }}
          disabled={loading}
        >
          {t("cancelBtn")}
        </Button>
        <Button
          onClick={() => {
            void onSubmit();
          }}
          color="primary"
          variant="contained"
          disabled={!selectedCategoryId || loading}
          sx={{ borderRadius: 2, fontWeight: 700, flex: { xs: 1, sm: "none" } }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : t("confirmBtn")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
