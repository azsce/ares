import {
  Box,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Stack,
  LinearProgress,
  Button,
  alpha,
  Tooltip,
  Avatar,
  Pagination,
  useTheme,
  Alert,
} from "@mui/material";
import {
  EditRounded as EditIcon,
  DeleteOutlineRounded as DeleteIcon,
  VisibilityRounded as ViewIcon,
} from "@mui/icons-material";
import Image from "next/image";
import { useRouter } from "@/shared/i18n/routing";
import { AdminCategoryListDto } from "@/api-clients/categories/categories";
import { toImageUrl } from "@/utils/image-url";
import { parseUtcDate } from "@/utils/dateTime";
import { EmptyState } from "./EmptyState";

export function CategoryTable({
  categories,
  loading,
  error,
  totalCount,
  totalPages,
  page,
  setPage,
  fetchCategories,
  handleDelete,
  filtersActive,
  handleClearFilters,
  t,
  tc,
}: {
  categories: AdminCategoryListDto[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  totalPages: number;
  page: number;
  setPage: (val: number) => void;
  fetchCategories: () => void;
  handleDelete: (id: string, vehicleCount: number) => void;
  filtersActive: boolean;
  handleClearFilters: () => void;
  t: (key: string, values?: Record<string, string | number>) => string;
  tc: (key: string, values?: Record<string, string | number>) => string;
}) {
  const theme = useTheme();
  const router = useRouter();

  const getRemainingDays = (endDateString?: string) => {
    if (!endDateString) return 0;
    const end = parseUtcDate(endDateString);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {loading && (
        <LinearProgress
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            zIndex: 2,
          }}
        />
      )}
      {error && categories.length === 0 ? (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Alert severity="error">{error}</Alert>
          <Button
            onClick={() => {
              void fetchCategories();
            }}
            sx={{ mt: 2 }}
          >
            {tc("retry")}
          </Button>
        </Box>
      ) : (
        <TableContainer sx={{ opacity: loading ? 0.6 : 1, transition: "opacity 0.15s ease" }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: theme => alpha(theme.palette.primary.main, 0.04) }}>
                <TableCell>{t("table.headers.name")}</TableCell>
                <TableCell>{t("table.headers.commission")}</TableCell>
                <TableCell>{t("table.headers.vehicles")}</TableCell>
                <TableCell>{t("table.headers.offer")}</TableCell>
                <TableCell>{t("table.headers.status")}</TableCell>
                <TableCell align="right">{t("table.headers.actions")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.length > 0 ? (
                categories.map(c => {
                  const daysRemaining = getRemainingDays(c.offerEndDate);
                  return (
                    <TableRow
                      key={c.id}
                      hover
                      onClick={() => {
                        router.push(`/admin/vehicles?categoryId=${c.id}`);
                      }}
                      sx={{
                        cursor: "pointer",
                        transition: "background 0.15s",
                        "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.03) },
                      }}
                    >
                      <TableCell>
                        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                          {c.imageUrl ? (
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 1.5,
                                overflow: "hidden",
                                flexShrink: 0,
                              }}
                            >
                              <Image
                                src={toImageUrl(c.imageUrl) as string}
                                alt={c.name}
                                width={40}
                                height={40}
                                style={{ objectFit: "cover" }}
                              />
                            </Box>
                          ) : (
                            <Avatar
                              sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: "primary.main",
                                width: 40,
                                height: 40,
                                borderRadius: 1.5,
                                fontWeight: 700,
                              }}
                            >
                              {c.name.charAt(0).toUpperCase()}
                            </Avatar>
                          )}
                          <Box sx={{ minWidth: 0, maxWidth: 250 }}>
                            <Typography sx={{ fontWeight: 600 }} noWrap>
                              {c.name}
                            </Typography>
                            {c.description && (
                              <Tooltip title={c.description} arrow placement="bottom-start">
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                    lineHeight: 1.2,
                                  }}
                                >
                                  {c.description}
                                </Typography>
                              </Tooltip>
                            )}
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${c.commissionPercentage}%`}
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 600, color: "text.secondary" }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${c.vehicleCount} ${t("table.headers.vehicles")}`}
                          size="small"
                          sx={{
                            bgcolor: alpha(theme.palette.info.main, 0.1),
                            color: "info.main",
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {c.offerStatus === "Active" ? (
                          <Tooltip title={t("table.offerEndsIn", { days: daysRemaining })}>
                            <Chip
                              label={`${c.offerPercentage}% - ${t("table.offerEndsIn", { days: daysRemaining })}`}
                              size="small"
                              sx={{
                                bgcolor: alpha(theme.palette.warning.main, 0.15),
                                color: "warning.main",
                                fontWeight: 700,
                              }}
                            />
                          </Tooltip>
                        ) : c.offerStatus === "Expired" ? (
                          <Chip
                            label={t("table.expiredOffer")}
                            size="small"
                            sx={{
                              bgcolor: alpha(theme.palette.text.disabled, 0.15),
                              color: "text.secondary",
                              fontWeight: 600,
                            }}
                          />
                        ) : (
                          <Chip
                            label={t("table.offerNone")}
                            size="small"
                            sx={{
                              bgcolor: alpha(theme.palette.text.disabled, 0.1),
                              color: "text.disabled",
                              fontWeight: 500,
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={c.isActive ? t("table.statusActive") : t("table.statusInactive")}
                          size="small"
                          sx={{
                            bgcolor: theme =>
                              alpha(c.isActive ? theme.palette.success.main : theme.palette.text.disabled, 0.15),
                            color: c.isActive ? "success.main" : "text.secondary",
                            fontWeight: 700,
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
                          <Tooltip title={t("actions.viewDetails")}>
                            <IconButton
                              size="small"
                              onClick={e => {
                                e.stopPropagation();
                                router.push(`/admin/categories/${c.id}`);
                              }}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t("actions.edit")}>
                            <IconButton
                              size="small"
                              onClick={e => {
                                e.stopPropagation();
                                router.push(`/admin/categories/${c.id}/edit`);
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip
                            title={c.vehicleCount > 0 ? t("alerts.deleteHasVehiclesError") : t("actions.delete")}
                          >
                            <span>
                              <IconButton
                                size="small"
                                disabled={c.vehicleCount > 0}
                                onClick={e => {
                                  e.stopPropagation();
                                  void handleDelete(c.id, c.vehicleCount);
                                }}
                                sx={{ color: "error.main", "&.Mui-disabled": { opacity: 0.3 } }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 0 }}>
                    <EmptyState filtersActive={filtersActive} handleClearFilters={handleClearFilters} t={t} />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Stack
        direction={{ xs: "column", sm: "row" }}
        sx={{
          gap: 1,
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {t("pagination.showing", { count: categories.length, total: totalCount })}
        </Typography>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(_, val) => {
            setPage(val);
          }}
          size="small"
          sx={{ "& .MuiPaginationItem-root": { borderRadius: 2 } }}
        />
      </Stack>
    </Paper>
  );
}
