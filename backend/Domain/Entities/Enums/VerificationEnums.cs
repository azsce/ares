namespace Backend.Domain.Entities.Enums
{
    public enum VerificationRequestStatus
    {
        Pending,
        Approved,
        Rejected
    }

    public enum VerificationDocumentType
    {
        NationalID,
        Passport
    }

    /// <summary>
    /// Admin review state for a driver license. Mirrors
    /// <see cref="VerificationRequestStatus"/> but uses domain-specific
    /// terminology ("Verified" instead of "Approved") to match the UI.
    /// </summary>
    public enum DriverLicenseStatus
    {
        Pending,
        Verified,
        Rejected
    }
}
