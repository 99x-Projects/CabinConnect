namespace CabinConnect.Domain.Exceptions;

public class CabinOwnershipException(Guid id) : Exception($"You do not own cabin '{id}'.");
