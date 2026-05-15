namespace CabinConnect.Domain.Exceptions;

public class DuplicateCabinNameException(string name)
    : Exception($"A cabin named '{name}' already exists for this host.");
