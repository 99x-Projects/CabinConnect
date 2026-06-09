using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CabinConnect.Api.Migrations
{
    /// <inheritdoc />
    public partial class CreateCabinsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "cabins",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    host_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "text", nullable: false),
                    description = table.Column<string>(type: "text", nullable: false),
                    location = table.Column<string>(type: "text", nullable: false),
                    base_rate = table.Column<decimal>(type: "numeric", nullable: false),
                    max_guests = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_cabins", x => x.id);
                });

            // Cross-schema FK to auth.users — EF Core cannot model this natively
            migrationBuilder.Sql(
                "ALTER TABLE cabins ADD CONSTRAINT fk_cabins_host FOREIGN KEY (host_id) REFERENCES auth.users(id);");

            migrationBuilder.Sql("ALTER TABLE cabins ENABLE ROW LEVEL SECURITY;");

            // INSERT: JWT sub must match host_id — prevents impersonation (EC-007)
            migrationBuilder.Sql(
                "CREATE POLICY \"Hosts can insert own cabins\" ON cabins FOR INSERT WITH CHECK (auth.uid() = host_id);");

            // SELECT: public reads for cabin browsing
            migrationBuilder.Sql(
                "CREATE POLICY \"Public cabin reads\" ON cabins FOR SELECT USING (true);");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP POLICY IF EXISTS \"Public cabin reads\" ON cabins;");
            migrationBuilder.Sql("DROP POLICY IF EXISTS \"Hosts can insert own cabins\" ON cabins;");
            migrationBuilder.Sql("ALTER TABLE cabins DISABLE ROW LEVEL SECURITY;");
            migrationBuilder.Sql("ALTER TABLE cabins DROP CONSTRAINT IF EXISTS fk_cabins_host;");

            migrationBuilder.DropTable(
                name: "cabins");
        }
    }
}
