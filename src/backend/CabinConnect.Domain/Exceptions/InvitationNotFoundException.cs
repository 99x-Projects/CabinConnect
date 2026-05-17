namespace CabinConnect.Domain.Exceptions;

public class InvitationNotFoundException(string email)
    : Exception($"No pending invitation found for '{email}'.");
