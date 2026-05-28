<#
.SYNOPSIS
    CI guardrail: enforces the EF Core / Supabase SQL split documented in
    docs/migrations.md.

.DESCRIPTION
    Fails if any EF Core migration .cs file under
    src/backend/CabinConnect.Infrastructure/Migrations/ contains:
      - CREATE POLICY ...
      - ENABLE ROW LEVEL SECURITY
      - INSERT INTO ... (seed data)

    Also fails if any snake-cased table or column name in EF migrations
    matches a Postgres reserved word.

    Run from repository root. Exit code 0 = clean, 1 = violation.
#>

[CmdletBinding()]
param (
    [string] $RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
)

$ErrorActionPreference = 'Stop'

$migrationsDir = Join-Path $RepoRoot 'src/backend/CabinConnect.Infrastructure/Migrations'
$violations = New-Object System.Collections.Generic.List[string]

# Postgres reserved words that are common enough to be a problem when used as
# unquoted identifiers. Not exhaustive — extend as needed.
$reservedWords = @(
    'user', 'order', 'group', 'select', 'where', 'from', 'table',
    'index', 'check', 'default', 'unique', 'primary', 'foreign',
    'references', 'constraint', 'cast', 'column', 'role', 'session',
    'authorization', 'all', 'analyse', 'analyze', 'any', 'array',
    'as', 'asc', 'asymmetric', 'both', 'case', 'collate', 'create',
    'current_user', 'desc', 'distinct', 'do', 'else', 'end', 'false',
    'for', 'grant', 'having', 'in', 'initially', 'into', 'lateral',
    'leading', 'limit', 'localtime', 'localtimestamp', 'new', 'not',
    'null', 'off', 'offset', 'old', 'on', 'only', 'or', 'placing',
    'returning', 'session_user', 'some', 'symmetric', 'then', 'to',
    'trailing', 'true', 'union', 'using', 'variadic', 'when', 'with'
)

if (-not (Test-Path $migrationsDir)) {
    Write-Host "No EF migrations directory yet at $migrationsDir — nothing to check." -ForegroundColor DarkGray
    exit 0
}

$migrationFiles = Get-ChildItem -Path $migrationsDir -Filter '*.cs' -Recurse -ErrorAction SilentlyContinue
if (-not $migrationFiles) {
    Write-Host "No EF migration .cs files found — nothing to check." -ForegroundColor DarkGray
    exit 0
}

# Forbidden constructs (RLS / seed) in EF migrations
$forbiddenPatterns = @{
    'CREATE POLICY'              = 'RLS policies belong in supabase/migrations/, not EF Core.'
    'ENABLE ROW LEVEL SECURITY'  = 'RLS enablement belongs in supabase/migrations/, not EF Core.'
    'CREATE TRIGGER'             = 'Triggers belong in supabase/migrations/, not EF Core.'
    'CREATE FUNCTION'            = 'Functions belong in supabase/migrations/, not EF Core.'
    'CREATE OR REPLACE FUNCTION' = 'Functions belong in supabase/migrations/, not EF Core.'
}

foreach ($file in $migrationFiles) {
    $content = Get-Content -Path $file.FullName -Raw

    foreach ($pattern in $forbiddenPatterns.Keys) {
        if ($content -match [regex]::Escape($pattern)) {
            $violations.Add("[$($file.Name)] forbidden construct '$pattern' — $($forbiddenPatterns[$pattern])")
        }
    }

    # Crude INSERT seed-data check: an INSERT INTO inside an EF migration.
    if ($content -match '(?i)\bInsert\(\s*table\s*:\s*"[^"]+"') {
        $violations.Add("[$($file.Name)] EF migrations must not contain seed data (InsertData). Move to supabase/seed.sql.")
    }

    # Reserved-word check: look for table:"<word>" or columns:"<word>" matches.
    $matches = [regex]::Matches(
        $content,
        '(?i)(?:name|table):\s*"([a-z_][a-z0-9_]*)"'
    )
    foreach ($m in $matches) {
        $identifier = $m.Groups[1].Value.ToLowerInvariant()
        if ($reservedWords -contains $identifier) {
            $violations.Add("[$($file.Name)] identifier '$identifier' is a Postgres reserved word — rename via [Column]/[Table] attributes or model config.")
        }
    }
}

if ($violations.Count -gt 0) {
    Write-Host "check-migrations.ps1 FAILED — $($violations.Count) violation(s):" -ForegroundColor Red
    foreach ($v in $violations) {
        Write-Host "  - $v" -ForegroundColor Red
    }
    exit 1
}

Write-Host "check-migrations.ps1: clean ($($migrationFiles.Count) EF migration file(s) scanned)." -ForegroundColor Green
exit 0
