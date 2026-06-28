import type { AuthLabels } from "./auth";
import type { ActivateLabels } from "./auth/activate";
import type { ForgotPasswordLabels } from "./auth/forgot-password";
import type { GoogleSignInLabels } from "./auth/google-signin";
import type { ResetPasswordLabels } from "./auth/reset-password";
import type { SignInLabels } from "./auth/signin";
import type { SignUpPageLabels } from "./auth/signup";
import type { VerifyEmailLabels } from "./auth/verify-email";
import type { AccountBookingsLabels } from "./customer/account-bookings";
import type { AccountProfileLabels } from "./customer/account-profile";
import type { BookingDetailLabels } from "./customer/booking-detail";
import type { BookingPaymentLabels } from "./customer/booking-payment";
import type { CustomerBookingsLabels } from "./customer/bookings";
import type { DriverSelectionLabels } from "./customer/driver-selection";
import type { CommonLabels } from "./common";
import type { ErrorsLabels } from "./errors";
import type { HeaderLabels } from "./header";
import type { AdminSidebarLabels } from "./dashboard/admin-sidebar";
import type { DriverSidebarLabels } from "./dashboard/driver-sidebar";
import type { SupplierSidebarLabels } from "./dashboard/supplier-sidebar";
import type { InspectorSidebarLabels } from "./dashboard/inspector-sidebar";
import type { DashboardLabels } from "./dashboard/shell";
import type { LogoutDialogLabels } from "./dashboard/logout-dialog";
import type { DeleteNotificationDialogLabels } from "./delete-notification-dialog";
import type { AdminComplianceLabels } from "./dashboard/admin/admin/compliance";
import type { AdminSecurityLabels } from "./dashboard/admin/admin/security";
import type { AdminVehiclesMgmtLabels } from "./dashboard/admin/admin/vehicles";
import type { BankDetailsLabels } from "./dashboard/admin/bank-details";
import type { AdminLocationsEditLabels } from "./dashboard/admin/locations/edit";
import type { AdminNotificationsLabels } from "./dashboard/admin/notifications";
import type { AdminSchedulerLabels } from "./dashboard/admin/scheduler";
import type { AdminSettingsLabels } from "./dashboard/admin/settings";
import type { AdminUsersLabels } from "./dashboard/admin/users";
import type { AdminDriversLabels } from "./dashboard/admin/drivers";
import type { AdminInspectorsLabels } from "./dashboard/admin/inspectors";
import type { AdminVehiclesLabels } from "./dashboard/admin/vehicles";
import type { AdminVerificationsLabels } from "./dashboard/admin/verifications";
import type { InspectorHistoryLabels } from "./dashboard/inspector/history";
import type { InspectorInspectionsLabels } from "./dashboard/inspector/inspections";
import type { InspectorInspectionDetailLabels } from "./dashboard/inspector/inspection-detail";
import type { InspectorProfileLabels } from "./dashboard/inspector/profile";

export type {
  AuthLabels,
  AccountBookingsLabels,
  AccountProfileLabels,
  ActivateLabels,
  BookingDetailLabels,
  BookingPaymentLabels,
  CommonLabels,
  CustomerBookingsLabels,
  DriverSelectionLabels,
  ErrorsLabels,
  ForgotPasswordLabels,
  GoogleSignInLabels,
  HeaderLabels,
  ResetPasswordLabels,
  SignInLabels,
  SignUpPageLabels,
  VerifyEmailLabels,
  AdminSidebarLabels,
  DriverSidebarLabels,
  SupplierSidebarLabels,
  InspectorSidebarLabels,
  DashboardLabels,
  LogoutDialogLabels,
  DeleteNotificationDialogLabels,
  AdminComplianceLabels,
  AdminSecurityLabels,
  AdminVehiclesMgmtLabels,
  BankDetailsLabels,
  AdminLocationsEditLabels,
  AdminNotificationsLabels,
  AdminSchedulerLabels,
  AdminSettingsLabels,
  AdminUsersLabels,
  AdminDriversLabels,
  AdminInspectorsLabels,
  AdminVehiclesLabels,
  AdminVerificationsLabels,
  InspectorHistoryLabels,
  InspectorInspectionsLabels,
  InspectorInspectionDetailLabels,
  InspectorProfileLabels,
};

export type AuthPagesSchema = {
  readonly signin: SignInLabels;
  readonly googleSignIn: GoogleSignInLabels;
  readonly signup: SignUpPageLabels;
  readonly forgotPassword: ForgotPasswordLabels;
  readonly resetPassword: ResetPasswordLabels;
  readonly activate: ActivateLabels;
  readonly verifyEmail: VerifyEmailLabels;
};

export type CustomerSchema = {
  readonly accountProfile: AccountProfileLabels;
  readonly accountBookings: AccountBookingsLabels;
  readonly bookingDetail: BookingDetailLabels;
  readonly driverSelection: DriverSelectionLabels;
  readonly bookingPayment: BookingPaymentLabels;
  readonly bookings: CustomerBookingsLabels;
};

export type DashboardSchema = {
  readonly shell: DashboardLabels;
  readonly adminSidebar: AdminSidebarLabels;
  readonly driverSidebar: DriverSidebarLabels;
  readonly supplierSidebar: SupplierSidebarLabels;
  readonly inspectorSidebar: InspectorSidebarLabels;
  readonly logoutDialog: LogoutDialogLabels;
};

export type DashboardAdminAdminSchema = {
  readonly compliance: AdminComplianceLabels;
  readonly security: AdminSecurityLabels;
  readonly vehicles: AdminVehiclesMgmtLabels;
};

export type DashboardAdminSchema = {
  readonly admin: DashboardAdminAdminSchema;
  readonly bankDetails: BankDetailsLabels;
  readonly locationsEdit: AdminLocationsEditLabels;
  readonly notifications: AdminNotificationsLabels;
  readonly scheduler: AdminSchedulerLabels;
  readonly settings: AdminSettingsLabels;
  readonly users: AdminUsersLabels;
  readonly drivers: AdminDriversLabels;
  readonly inspectors: AdminInspectorsLabels;
  readonly vehicles: AdminVehiclesLabels;
  readonly verifications: AdminVerificationsLabels;
};

export type DashboardInspectorSchema = {
  readonly history: InspectorHistoryLabels;
  readonly inspections: InspectorInspectionsLabels;
  readonly inspectionDetail: InspectorInspectionDetailLabels;
  readonly profile: InspectorProfileLabels;
};

export type MessageSchema = {
  readonly common: CommonLabels;
  readonly auth: AuthLabels;
  readonly errors: ErrorsLabels;
  readonly authPages: AuthPagesSchema;
  readonly customer: CustomerSchema;
  readonly header: HeaderLabels;
  readonly dashboard: DashboardSchema;
  readonly dashboardAdmin: DashboardAdminSchema;
  readonly dashboardInspector: DashboardInspectorSchema;
  readonly deleteNotificationDialog: DeleteNotificationDialogLabels;
};
