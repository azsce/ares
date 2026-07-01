"use client";

import { type JSX, useMemo } from "react";
import { Box, Typography, Paper, useTheme, alpha } from "@mui/material";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import { useTranslations } from "next-intl";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  DirectionsCarFilledTwoTone as CarIcon,
  CheckCircleOutlineRounded as AvailableIcon,
  BuildOutlined as MaintenanceIcon,
} from "@mui/icons-material";

export interface FleetOverviewProps {
  readonly total: number;
  readonly availableCount: number;
  readonly rentalCount: number;
  readonly maintenanceCount: number;
  readonly trends?: {
    totalAssets?: number;
    available?: number;
    maintenance?: number;
  };
}

function TrendBadge({ value }: Readonly<{ value?: number }>): JSX.Element | null {
  if (value === undefined) return null;
  const isUp = value >= 0;
  return (
    <Stack direction="row" spacing={0.3} sx={{ alignItems: "center" }}>
      {isUp ? (
        <TrendingUpIcon sx={{ fontSize: 13, color: "success.main" }} />
      ) : (
        <TrendingDownIcon sx={{ fontSize: 13, color: "error.main" }} />
      )}
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          fontSize: 11,
          color: isUp ? "success.main" : "error.main",
        }}
      >
        {isUp ? "+" : ""}
        {value}%
      </Typography>
    </Stack>
  );
}

function StatCard({
  icon,
  label,
  value,
  trend,
  iconColor,
}: Readonly<{
  icon: JSX.Element;
  label: string;
  value: number;
  trend?: number;
  iconColor: string;
}>): JSX.Element {
  return (
    <Paper
      elevation={5}
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 0.5,
      }}
    >
      {" "}
      <Stack direction="row" sx={{ gap: 1, alignItems: "flex-start" }}>
        <Stack direction="column" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2,
              bgcolor: alpha(iconColor, 0.12),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </Box>
          <TrendBadge value={trend} />
        </Stack>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", mt: 1 }}
        >
          {label}
        </Typography>
      </Stack>
      <Typography
        sx={{
          fontWeight: 800,
          fontSize: { xs: 26, sm: 32 },
          lineHeight: 1.1,
          display: "flex", // تحويل العنصر لـ Flex
          alignItems: "center", // ⬅️ السنترة الرأسية (في النص بالظبط من فوق وتحت)
          justifyContent: "center", // السنترة الأفقية (في النص من اليمين للشمال)
          height: "100%", // لازم تديله طول عشان يعرف يسنتر جواه
        }}
      >
        {value.toLocaleString()}
      </Typography>
    </Paper>
  );
}

function LegendItem({ color, label, pct }: Readonly<{ color: string; label: string; pct: number }>): JSX.Element {
  return (
    <Stack direction="row" spacing={0} sx={{ alignItems: "center", justifyContent: "space-between", gap: 0 }}>
      <Stack direction="row" spacing={0.4} sx={{ alignItems: "center" }}>
        <Box
          sx={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            bgcolor: color,
            flexShrink: 0,
          }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 14 }}>
          {label}
        </Typography>
      </Stack>
      <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 12, minWidth: 32, textAlign: "right" }}>
        {pct}%
      </Typography>
    </Stack>
  );
}

function DonutChart({
  available,
  booked,
  maintenance,
  unavailable,
  total,
}: Readonly<{
  available: number;
  booked: number;
  maintenance: number;
  unavailable: number;
  total: number;
}>): JSX.Element {
  const theme = useTheme();

  const safeTotal = total || 1;
  const availPct = (available / safeTotal) * 100;
  const bookedPct = (booked / safeTotal) * 100;
  const maintenancePct = (maintenance / safeTotal) * 100;
  const unavailablePct = (unavailable / safeTotal) * 100;

  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  interface Segment {
    pct: number;
    color: string;
    offset: number;
  }

  const segments: Segment[] = useMemo(() => {
    const segmentsData: { pct: number; color: string }[] = [
      { pct: availPct, color: theme.palette.success.main },
      { pct: bookedPct, color: theme.palette.primary.main },
      { pct: maintenancePct, color: theme.palette.warning.main },
      { pct: unavailablePct, color: theme.palette.info.main },
    ];
    let cumulative = 0;
    return segmentsData.map(s => {
      const offset = (cumulative / 100) * circumference;
      cumulative += s.pct;
      return { ...s, offset };
    });
  }, [availPct, bookedPct, maintenancePct, unavailablePct, circumference, theme]);

  return (
    <Box sx={{ position: "relative", width: 110, height: 110, flexShrink: 0 }}>
      <svg viewBox="0 0 110 110" width={110} height={110}>
        <circle cx="55" cy="55" r={radius} fill="none" stroke={theme.palette.divider} strokeWidth="10" />
        <g transform="rotate(-90 55 55)">
          {segments.map((seg, i) => (
            <circle
              key={i}
              cx="55"
              cy="55"
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth="10"
              strokeDasharray={`${(seg.pct / 100) * circumference} ${circumference}`}
              strokeDashoffset={-seg.offset}
              strokeLinecap="butt"
            />
          ))}
        </g>
      </svg>
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography sx={{ fontWeight: 800, fontSize: 22, lineHeight: 1 }}>{total}</Typography>
      </Box>
    </Box>
  );
}

export default function FleetOverview({
  total,
  availableCount,
  rentalCount,
  maintenanceCount,
  trends,
}: FleetOverviewProps): JSX.Element {
  const theme = useTheme();
  const t = useTranslations("dashboardAdmin.vehicles");

  const unavailableCount = Math.max(0, total - (availableCount + rentalCount + maintenanceCount));
  const safeTotal = total || 1;
  const availPct = Math.round((availableCount / safeTotal) * 100);
  const bookedPct = Math.round((rentalCount / safeTotal) * 100);
  const maintenancePct = Math.round((maintenanceCount / safeTotal) * 100);
  const unavailablePct = Math.round((unavailableCount / safeTotal) * 100);

  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {/* 1. كارت الرسم البياني (الدائرة) */}
      <Grid size={{ xs: 12, sm: 8, lg: 4.5 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: 3, sm: 4 }}
            sx={{ alignItems: "center", gap: 0, justifyContent: "center", height: "100%" }}
          >
            {/* الدائرة */}
            <Box sx={{ flexShrink: 0 }}>
              <DonutChart
                available={availableCount}
                booked={rentalCount}
                maintenance={maintenanceCount}
                unavailable={unavailableCount}
                total={total}
              />
            </Box>

            {/* شبكة النصوص (2 عمود على التابلت والشاشات الكبيرة، وعمود واحد على الموبايل) */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(1, 1fr)" },
                gap: 1,
                ml: "auto",
                flexGrow: 1,
                width: "100%",
              }}
            >
              <LegendItem color={theme.palette.success.main} label={t("statusLabels.available")} pct={availPct} />
              <LegendItem color={theme.palette.primary.main} label={t("statusLabels.booked")} pct={bookedPct} />
              <LegendItem
                color={theme.palette.warning.main}
                label={t("statusLabels.maintenance")}
                pct={maintenancePct}
              />
              <LegendItem color={theme.palette.info.main} label={t("statusLabels.unavailable")} pct={unavailablePct} />
            </Box>
          </Stack>
        </Paper>
      </Grid>

      {/* 2. كارت إجمالي الأصول (يصعد بجوار الدائرة في الشاشات الكبيرة lg) */}
      <Grid size={{ xs: 12, sm: 4, md: 4, lg: 2.5 }}>
        <StatCard
          icon={<CarIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />}
          label={t("stats.totalAssets")}
          value={total}
          trend={trends?.totalAssets}
          iconColor={theme.palette.primary.main}
        />
      </Grid>

      {/* 3. كارت المتاح (ينزل للصف الثاني في الشاشات الكبيرة ويأخذ نصف العرض) */}
      <Grid size={{ xs: 12, sm: 6, md: 6, lg: 2.5 }}>
        <StatCard
          icon={<AvailableIcon sx={{ fontSize: 18, color: theme.palette.success.main }} />}
          label={t("stats.availableNow")}
          value={availableCount}
          trend={trends?.available}
          iconColor={theme.palette.success.main}
        />
      </Grid>

      {/* 4. كارت في الصيانة (ينزل للصف الثاني في الشاشات الكبيرة ويأخذ نصف العرض) */}
      <Grid size={{ xs: 12, sm: 6, md: 6, lg: 2.5 }}>
        <StatCard
          icon={<MaintenanceIcon sx={{ fontSize: 18, color: theme.palette.warning.main }} />}
          label={t("stats.inMaintenance")}
          value={maintenanceCount}
          trend={trends?.maintenance}
          iconColor={theme.palette.warning.main}
        />
      </Grid>
    </Grid>
  );
}
