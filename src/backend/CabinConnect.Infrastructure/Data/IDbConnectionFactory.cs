using System.Data;

namespace CabinConnect.Infrastructure.Data;

public interface IDbConnectionFactory
{
    IDbConnection Create();
}
