using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CabinConnect.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CabinRegistration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "amenities",
                columns: table => new
                {
                    code = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    active = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_amenities", x => x.code);
                });

            migrationBuilder.CreateTable(
                name: "cabins",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    owner_id = table.Column<Guid>(type: "uuid", nullable: false),
                    community_id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    address = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    capacity = table.Column<int>(type: "integer", nullable: false),
                    amenities = table.Column<List<string>>(type: "text[]", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_cabins", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "ix_cabins_community_id",
                table: "cabins",
                column: "community_id");

            migrationBuilder.CreateIndex(
                name: "ix_cabins_owner_id",
                table: "cabins",
                column: "owner_id",
                unique: true);

            // Defence-in-depth: capacity is validated at the API boundary but a
            // CHECK constraint ensures direct DB writes (seeds, ops scripts)
            // cannot bypass it. Keep in sync with CabinsEndpoints.cs.
            migrationBuilder.Sql(
                "ALTER TABLE cabins ADD CONSTRAINT ck_cabins_capacity "
                + "CHECK (capacity BETWEEN 1 AND 50);");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("ALTER TABLE cabins DROP CONSTRAINT IF EXISTS ck_cabins_capacity;");

            migrationBuilder.DropTable(
                name: "amenities");

            migrationBuilder.DropTable(
                name: "cabins");
        }
    }
}
