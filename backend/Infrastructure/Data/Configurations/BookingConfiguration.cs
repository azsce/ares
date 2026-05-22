using Backend.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Infrastructure.Data.Configurations
{
    public class BookingConfiguration : IEntityTypeConfiguration<Booking>
    {
        public void Configure(EntityTypeBuilder<Booking> builder)
        {
            builder
                .HasOne(b => b.User)
                .WithMany()
                .HasForeignKey(b => b.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder
                .HasOne(b => b.Vehicle)
                .WithMany()
                .HasForeignKey(b => b.VehicleId)
                .OnDelete(DeleteBehavior.Restrict);

            builder
                .HasOne(b => b.Driver)
                .WithMany()
                .HasForeignKey(b => b.DriverId)
                .OnDelete(DeleteBehavior.Restrict);

            builder
                .HasIndex(b => b.BookingNumber)
                .IsUnique();

            builder
                .Property(b => b.Status)
                .HasConversion<string>()
                .HasMaxLength(50);

            // ─── Inspection workflow ─────────────────────────────────────
            builder
                .HasOne(b => b.AssignedInspector)
                .WithMany()
                .HasForeignKey(b => b.AssignedInspectorId)
                .OnDelete(DeleteBehavior.Restrict);

            builder
                .Property(b => b.InspectionStatus)
                .HasConversion<string>()
                .HasMaxLength(20)
                .HasDefaultValue(Backend.Domain.Entities.Enums.BookingInspectionStatus.NotRequired);

            builder
                .HasIndex(b => b.AssignedInspectorId);
        }
    }
}
