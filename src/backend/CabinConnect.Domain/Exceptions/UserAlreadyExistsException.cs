namespace CabinConnect.Domain.Exceptions;

public class UserAlreadyExistsException(string email)
    : Exception($"A user with email '{email}' is already registered.");
