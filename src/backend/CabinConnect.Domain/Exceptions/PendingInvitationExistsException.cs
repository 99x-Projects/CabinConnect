namespace CabinConnect.Domain.Exceptions;

public class PendingInvitationExistsException(string email)
    : Exception($"A pending invitation already exists for '{email}'.");
