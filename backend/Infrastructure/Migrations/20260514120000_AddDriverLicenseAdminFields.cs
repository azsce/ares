using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    /// <summary>
    /// Adds admin-review columns to the Drivers table so the admin
    /// verification UI can approve/reject driver license submissions with
    /// rejection reasons and reviewer attribution.
    ///
    /// All new columns are nullable to preserve backward compatibility with
    /// existing driver rows that pre-date the admin review flow.
    /// </summary>
    public partial class AddDriverLicenseAdminFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "VerificationStatus",
                table: "Drivers",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RejectionReason",
                table: "Drivers",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<System.Guid>(
                name: "ReviewedBy",
                table: "Drivers",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<System.DateTime>(
                name: "ReviewedAt",
                table: "Drivers",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "VerificationStatus",
                table: "Drivers");

            migrationBuilder.DropColumn(
                name: "RejectionReason",
                table: "Drivers");

            migrationBuilder.DropColumn(
                name: "ReviewedBy",
                table: "Drivers");

            migrationBuilder.DropColumn(
                name: "ReviewedAt",
                table: "Drivers");
        }
    }
}
