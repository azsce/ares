import type { MessageSchema } from "./types/message";
import common from "./en/common";
import auth from "./en/auth";
import errors from "./en/errors";
import signin from "./en/auth/signin";
import googleSignIn from "./en/auth/google-signin";
import signup from "./en/auth/signup";
import forgotPassword from "./en/auth/forgot-password";
import resetPassword from "./en/auth/reset-password";
import activate from "./en/auth/activate";
import verifyEmail from "./en/auth/verify-email";
import accountProfile from "./en/customer/account-profile";
import accountBookings from "./en/customer/account-bookings";
import bookingDetail from "./en/customer/booking-detail";
import driverSelection from "./en/customer/driver-selection";
import bookingPayment from "./en/customer/booking-payment";
import bookings from "./en/customer/bookings";
import header from "./en/header";
import shell from "./en/dashboard/shell";
import adminSidebar from "./en/dashboard/admin-sidebar";
import driverSidebar from "./en/dashboard/driver-sidebar";
import supplierSidebar from "./en/dashboard/supplier-sidebar";
import inspectorSidebar from "./en/dashboard/inspector-sidebar";
import logoutDialog from "./en/dashboard/logout-dialog";
import deleteNotificationDialog from "./en/delete-notification-dialog";
import compliance from "./en/dashboard/admin/admin/compliance";
import security from "./en/dashboard/admin/admin/security";
import vehicles from "./en/dashboard/admin/admin/vehicles";
import bankDetails from "./en/dashboard/admin/bank-details";
import locationsEdit from "./en/dashboard/admin/locations/edit";
import notifications from "./en/dashboard/admin/notifications";
import scheduler from "./en/dashboard/admin/scheduler";
import settings from "./en/dashboard/admin/settings";
import users from "./en/dashboard/admin/users";
import drivers from "./en/dashboard/admin/drivers";
import inspectors from "./en/dashboard/admin/inspectors";
import vehiclesAdmin from "./en/dashboard/admin/vehicles";
import verifications from "./en/dashboard/admin/verifications";
import inspectorHistory from "./en/dashboard/inspector/history";
import inspectorInspections from "./en/dashboard/inspector/inspections";
import inspectorInspectionDetail from "./en/dashboard/inspector/inspection-detail";
import inspectorProfile from "./en/dashboard/inspector/profile";

const en: MessageSchema = {
  common,
  auth,
  errors,
  authPages: {
    signin,
    googleSignIn,
    signup,
    forgotPassword,
    resetPassword,
    activate,
    verifyEmail,
  },
  customer: {
    accountProfile,
    accountBookings,
    bookingDetail,
    driverSelection,
    bookingPayment,
    bookings,
  },
  header,
  dashboard: {
    shell,
    adminSidebar,
    driverSidebar,
    supplierSidebar,
    inspectorSidebar,
    logoutDialog,
  },
  dashboardAdmin: {
    admin: {
      compliance,
      security,
      vehicles,
    },
    bankDetails,
    locationsEdit,
    notifications,
    scheduler,
    settings,
    users,
    drivers,
    inspectors,
    vehicles: vehiclesAdmin,
    verifications,
  },
  dashboardInspector: {
    history: inspectorHistory,
    inspections: inspectorInspections,
    inspectionDetail: inspectorInspectionDetail,
    profile: inspectorProfile,
  },
  deleteNotificationDialog,
};

export default en;
