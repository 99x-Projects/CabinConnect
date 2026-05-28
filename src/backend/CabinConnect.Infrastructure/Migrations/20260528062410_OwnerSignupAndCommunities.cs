using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CabinConnect.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class OwnerSignupAndCommunities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "communities",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    region = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    active = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_communities", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    display_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    email = table.Column<string>(type: "character varying(320)", maxLength: 320, nullable: false),
                    role = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_users", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "ix_communities_name",
                table: "communities",
                column: "name");

            migrationBuilder.CreateIndex(
                name: "ix_users_email",
                table: "users",
                column: "email",
                unique: true);

            // Whitelist of allowed values for users.role. Keep in sync with the
            // CabinConnect.Domain.Users.UserRole enum. Adding a new value here
            // requires a new migration.
            migrationBuilder.Sql(
                "ALTER TABLE users ADD CONSTRAINT ck_users_role "
                + "CHECK (role IN ('owner', 'admin', 'resident', 'volunteer'));");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("ALTER TABLE users DROP CONSTRAINT IF EXISTS ck_users_role;");

            migrationBuilder.DropTable(
                name: "communities");

            migrationBuilder.DropTable(
                name: "users");
        }
    }
}
