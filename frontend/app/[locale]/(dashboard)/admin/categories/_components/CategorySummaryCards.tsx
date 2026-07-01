import { Box, Typography, Card, Avatar, Stack, useTheme, alpha } from "@mui/material";
import {
  Category as CategoryIcon,
  DirectionsCarFilledTwoTone as CarIcon,
  LocalOfferTwoTone as OfferIcon,
  AccountBalanceWalletTwoTone as CommissionIcon,
} from "@mui/icons-material";
import { CategorySummary } from "@/api-clients/categories/categories";
import { useMemo } from "react";

export function CategorySummaryCards({
  summary,
  summaryLoading,
  t,
}: {
  summary: CategorySummary | null;
  summaryLoading: boolean;
  t: (key: string, values?: Record<string, string | number>) => string;
}) {
  const theme = useTheme();

  const resolvePaletteColor = useMemo(
    () => (color: string) => {
      const isPaletteColor = color in theme.palette;
      return isPaletteColor ? (theme.palette[color as keyof typeof theme.palette] as { main: string }).main : color;
    },
    [theme]
  );

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
        gap: 2,
        mb: 3,
        width: "100%",
      }}
    >
      {[
        {
          icon: <CategoryIcon fontSize="small" />,
          label: t("summaryCards.categories"),
          value: summary?.totalCategories ?? 0,
          color: "primary",
        },
        {
          icon: <CarIcon fontSize="small" />,
          label: t("summaryCards.vehicles"),
          value: summary?.totalVehicles ?? 0,
          color: "info",
        },
        {
          icon: <OfferIcon fontSize="small" />,
          label: t("summaryCards.withOffers"),
          value: summary?.categoriesWithOffers ?? 0,
          color: "warning",
        },
        {
          icon: <CommissionIcon fontSize="small" />,
          label: t("summaryCards.avgCommission"),
          value: summaryLoading ? "..." : `${Math.round(summary?.averageCommission ?? 0)}%`,
          color: "success",
        },
      ].map(card => {
        const mainColor = resolvePaletteColor(card.color);
        return (
          <Card
            key={card.label}
            elevation={0}
            sx={{
              p: { xs: 2, sm: 2.5 },
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              position: "relative",
              overflow: "hidden",
              height: "100%",
              background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(mainColor, 0.08)} 100%)`,
              transition: "transform 0.2s, box-shadow 0.2s",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: `0 8px 24px ${alpha(mainColor, 0.18)}`,
              },
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: -18,
                right: -18,
                width: 80,
                height: 80,
                borderRadius: "50%",
                bgcolor: alpha(mainColor, 0.1),
              }}
            />
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <Avatar sx={{ bgcolor: alpha(mainColor, 0.15), color: mainColor, width: 40, height: 40 }}>
                {card.icon}
              </Avatar>
              <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, lineHeight: 1.2 }} noWrap>
                  {card.label}
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    color: mainColor,
                    lineHeight: 1.1,
                    fontSize: { xs: "1.6rem", sm: "2.125rem" },
                  }}
                  noWrap
                >
                  {summaryLoading && card.label !== t("summaryCards.avgCommission") ? "..." : card.value}
                </Typography>
              </Box>
            </Stack>
          </Card>
        );
      })}
    </Box>
  );
}
