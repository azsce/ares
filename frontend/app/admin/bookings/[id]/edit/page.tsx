import EditBookingClient from "./_components/EditBookingClient";

export const metadata = {
  title: "Edit Booking | Admin Dashboard",
  description: "View booking details and update booking status.",
};

export default function EditBookingPage({ params }: { params: { id: string } }) {
  // تمرير الـ id الخاص بالحجز من مسار الصفحة إلى الـ Client Component
  return <EditBookingClient bookingId={params.id} />;
}