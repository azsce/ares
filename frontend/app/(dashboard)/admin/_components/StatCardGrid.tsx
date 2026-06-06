import { Grid } from "@mui/material";
import StorefrontIcon from "@mui/icons-material/Storefront";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import GppMaybeIcon from "@mui/icons-material/GppMaybe";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import BadgeIcon from "@mui/icons-material/Badge";
import { StatCard } from "../../_components/VehicleStats";

export interface SummaryItem {
  title: string;
  value: string;
  change: string;
  isUp: boolean;
  color: "primary" | "success" | "warning" | "error" | "info" | "secondary";
  iconName:
    | "Storefront"
    | "DirectionsCar"
    | "AttachMoney"
    | "PeopleAlt"
    | "EventAvailable"
    | "GppMaybe"
    | "PersonOutlined"
    | "BuildCircle"
    | "Badge";
}

const IconMap = {
  Storefront: StorefrontIcon,
  DirectionsCar: DirectionsCarIcon,
  AttachMoney: AttachMoneyIcon,
  PeopleAlt: PeopleAltIcon,
  EventAvailable: EventAvailableIcon,
  GppMaybe: GppMaybeIcon,
  PersonOutlined: PersonOutlinedIcon,
  BuildCircle: BuildCircleIcon,
  Badge: BadgeIcon,
};

export default function StatCardGrid({ items }: { readonly items: readonly SummaryItem[] }) {
  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {items.map((stat, i) => {
        const Icon = IconMap[stat.iconName];

        return (
          <Grid size={{ xs: 6, sm: 4, lg: 2 }} key={i}>
            <StatCard
              label={stat.title}
              value={stat.value}
              change={stat.change}
              isUp={stat.isUp}
              color={stat.color}
              icon={<Icon />}
            />
          </Grid>
        );
      })}
    </Grid>
  );
}
