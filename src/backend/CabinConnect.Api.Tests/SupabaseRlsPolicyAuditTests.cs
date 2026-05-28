using System.Text.RegularExpressions;
using Xunit;

namespace CabinConnect.Api.Tests;

public sealed class SupabaseRlsPolicyAuditTests
{
    [Fact]
    public void Users_table_has_owner_scoped_select_insert_update_policies()
    {
        var sql = ReadMigration("20260528100000_owner_signup_and_communities.sql");

        Assert.Contains("ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;", sql, StringComparison.Ordinal);
        Assert.Contains("CREATE POLICY users_select_own", sql, StringComparison.Ordinal);
        Assert.Contains("CREATE POLICY users_insert_own", sql, StringComparison.Ordinal);
        Assert.Contains("CREATE POLICY users_update_own", sql, StringComparison.Ordinal);
        Assert.Contains("USING (auth.uid() = id);", sql, StringComparison.Ordinal);
        Assert.Contains("WITH CHECK (auth.uid() = id);", sql, StringComparison.Ordinal);

        // Negative guard: owner-scoped users policies must not degrade to global allow.
        Assert.DoesNotContain("users_select_all", sql, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("ON public.users\n    FOR SELECT\n    TO authenticated\n    USING (true);", sql, StringComparison.Ordinal);
    }

    [Fact]
    public void Cabins_table_has_owner_scoped_crud_policies()
    {
        var sql = ReadMigration("20260528120000_cabin_registration.sql");

        Assert.Contains("ALTER TABLE public.cabins ENABLE ROW LEVEL SECURITY;", sql, StringComparison.Ordinal);
        Assert.Contains("CREATE POLICY cabins_select_own", sql, StringComparison.Ordinal);
        Assert.Contains("CREATE POLICY cabins_insert_own", sql, StringComparison.Ordinal);
        Assert.Contains("CREATE POLICY cabins_update_own", sql, StringComparison.Ordinal);
        Assert.Contains("CREATE POLICY cabins_delete_own", sql, StringComparison.Ordinal);
        Assert.Contains("USING (auth.uid() = owner_id);", sql, StringComparison.Ordinal);
        Assert.Contains("WITH CHECK (auth.uid() = owner_id);", sql, StringComparison.Ordinal);

        // Negative guard: owner-scoped cabins policies must not degrade to global allow.
        Assert.DoesNotContain("ON public.cabins\n    FOR SELECT\n    TO authenticated\n    USING (true);", sql, StringComparison.Ordinal);
    }

    [Fact]
    public void Operational_details_table_has_owner_scoped_crud_policies_via_parent_cabin()
    {
        var sql = ReadMigration("20260528130000_cabin_operational_details.sql");

        Assert.Contains("ALTER TABLE public.cabin_operational_details ENABLE ROW LEVEL SECURITY;", sql, StringComparison.Ordinal);
        Assert.Contains("CREATE POLICY cabin_operational_details_select_own", sql, StringComparison.Ordinal);
        Assert.Contains("CREATE POLICY cabin_operational_details_insert_own", sql, StringComparison.Ordinal);
        Assert.Contains("CREATE POLICY cabin_operational_details_update_own", sql, StringComparison.Ordinal);
        Assert.Contains("CREATE POLICY cabin_operational_details_delete_own", sql, StringComparison.Ordinal);

        // Positive guard: every owner check should route through cabins.owner_id = auth.uid().
        var ownerCheckPattern = @"c\.owner_id\s*=\s*auth\.uid\(\)";
        var matches = Regex.Matches(sql, ownerCheckPattern, RegexOptions.Multiline);
        Assert.True(matches.Count >= 4, "Expected owner checks in all operational RLS policies.");

        // Negative guard: no broad allow condition on operational table.
        Assert.DoesNotContain("ON public.cabin_operational_details\n    FOR SELECT\n    TO authenticated\n    USING (true);", sql, StringComparison.Ordinal);
    }

    private static string ReadMigration(string fileName)
    {
        var repoRoot = FindRepoRoot();
        var fullPath = Path.Combine(repoRoot, "supabase", "migrations", fileName);
        Assert.True(File.Exists(fullPath), $"Expected migration file not found: {fullPath}");
        return File.ReadAllText(fullPath);
    }

    private static string FindRepoRoot()
    {
        var dir = new DirectoryInfo(AppContext.BaseDirectory);
        while (dir is not null)
        {
            var supabaseDir = Path.Combine(dir.FullName, "supabase", "migrations");
            if (Directory.Exists(supabaseDir))
            {
                return dir.FullName;
            }

            dir = dir.Parent;
        }

        throw new InvalidOperationException("Could not locate repository root from test base directory.");
    }
}
