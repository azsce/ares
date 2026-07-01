"use client";

import { type JSX } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { useTranslations } from "next-intl";

export interface DeleteConfirmDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onConfirm: () => Promise<void>;
}

export default function DeleteConfirmDialog({ open, onClose, onConfirm }: DeleteConfirmDialogProps): JSX.Element {
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
      <DialogTitle sx={{ fontWeight: 700 }}>{t("deleteDialog.title")}</DialogTitle>
      <DialogContent>{t("deleteDialog.message")}</DialogContent>
      <DialogActions sx={{ flexWrap: "wrap", gap: 1, pb: 2, px: 2 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2, flex: { xs: 1, sm: "none" } }}>
          {t("deleteDialog.cancel")}
        </Button>
        <Button
          onClick={() => {
            void onConfirm();
          }}
          color="error"
          variant="contained"
          sx={{ borderRadius: 2, fontWeight: 700, flex: { xs: 1, sm: "none" } }}
        >
          {t("deleteDialog.confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
