import BookingsClient from "./_components/BookingsClient";

export const metadata = {
  title: "Bookings Management | Admin Dashboard",
  description: "Manage all vehicle bookings, view details, and perform bulk actions.",
};

export default function AdminBookingsPage() {
  // فصلنا الكلاينت عن السيرفر لضمان سرعة تحميل الصفحة الأساسية
  // ولجعل الـ SEO أفضل إن لزم الأمر لاحقاً.
  return <BookingsClient />;
}