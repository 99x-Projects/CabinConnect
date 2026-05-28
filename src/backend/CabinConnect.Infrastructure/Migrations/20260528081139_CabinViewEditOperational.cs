using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CabinConnect.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CabinViewEditOperational : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "cabin_operational_details",
                columns: table => new
                {
                    cabin_id = table.Column<Guid>(type: "uuid", nullable: false),
                    access_codes = table.Column<string>(type: "jsonb", nullable: false),
                    emergency_contacts = table.Column<string>(type: "jsonb", nullable: false),
                    house_rules = table.Column<string>(type: "character varying(5000)", maxLength: 5000, nullable: true),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_cabin_operational_details", x => x.cabin_id);
                    table.ForeignKey(
                        name: "fk_cabin_operational_details_cabins_cabin_id",
                        column: x => x.cabin_id,
                        principalTable: "cabins",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "cabin_operational_details");
        }
    }
}
