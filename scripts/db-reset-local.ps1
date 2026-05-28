<#
.SYNOPSIS
    Rebuilds the local development database from a clean slate.

.DESCRIPTION
    1. `npx supabase db reset` — rebuilds Postgres from supabase/migrations + seed.
       (Requires Docker. If you don't have Docker, point CONNSTR at your
       dev-cloud Postgres and skip this step manually.)
    2. `dotnet ef database update` — applies EF Core schema migrations.

    Run from repository root.
#>

[CmdletBinding()]
param (
    [switch] $SkipSupabaseReset
)

$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Push-Location $repoRoot

try {
    if (-not $SkipSupabaseReset) {
        Write-Host "==> npx supabase db reset" -ForegroundColor Cyan
        npx supabase db reset
        if ($LASTEXITCODE -ne 0) {
            throw "supabase db reset failed (exit $LASTEXITCODE). Pass -SkipSupabaseReset to skip the local stack."
        }
    } else {
        Write-Host "==> Skipping supabase db reset (--SkipSupabaseReset)" -ForegroundColor DarkYellow
    }

    Write-Host "==> dotnet ef database update" -ForegroundColor Cyan
    dotnet ef database update `
        --project src/backend/CabinConnect.Infrastructure `
        --startup-project src/backend/CabinConnect.Api
    if ($LASTEXITCODE -ne 0) {
        throw "dotnet ef database update failed (exit $LASTEXITCODE)."
    }

    Write-Host "Done." -ForegroundColor Green
}
finally {
    Pop-Location
}
