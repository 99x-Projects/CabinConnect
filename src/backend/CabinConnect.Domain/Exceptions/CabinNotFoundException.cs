namespace CabinConnect.Domain.Exceptions;

public class CabinNotFoundException(Guid id) : Exception($"Cabin '{id}' was not found.");
