<#
.SYNOPSIS
  Builds the Chaoxing submission ZIP without node_modules or real environment files.

.EXAMPLE
  .\scripts\package-submission.ps1 -StudentId "12345678" -StudentName "AlexChen"
#>
param(
  [Parameter(Mandatory = $true)]
  [string]$StudentId,

  [Parameter(Mandatory = $true)]
  [string]$StudentName
)

$ErrorActionPreference = 'Stop'

$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$safeName = ($StudentName -replace '[^a-zA-Z0-9\u4e00-\u9fa5_-]', '')
$safeId = ($StudentId -replace '[^a-zA-Z0-9_-]', '')

if (-not $safeName -or -not $safeId) {
  throw 'StudentId and StudentName must contain at least one letter/number.'
}

$zipName = "${safeId}_${safeName}_CapstoneProject.zip"
$zipPath = Join-Path $root $zipName
$staging = Join-Path $root '.submission-staging'

if ((Resolve-Path $root).Path -ne $root) {
  throw "Unexpected project root: $root"
}

if (Test-Path -LiteralPath $staging) {
  Remove-Item -LiteralPath $staging -Recurse -Force
}
New-Item -ItemType Directory -Path $staging | Out-Null

Write-Host 'Copying project files (excluding dependencies, secrets, and build output)...'
$excludeDirs = @(
  'node_modules',
  'dist',
  '.git',
  '.github',
  '.npm-cache',
  '.tmp',
  '.submission-staging',
  'coverage',
  '.mongodb-binaries',
  '.tools'
)
$excludeFiles = @('.env', '.env.local', '*.zip', 'npm-debug.log*')

$robocopyArgs = @(
  $root,
  $staging,
  '/E',
  '/NFL',
  '/NDL',
  '/NJH',
  '/NJS',
  '/XD'
) + $excludeDirs + @('/XF') + $excludeFiles

& robocopy @robocopyArgs | Out-Null
if ($LASTEXITCODE -ge 8) {
  throw "robocopy failed with exit code $LASTEXITCODE."
}

# Never ship a copied .env even if a platform ignores the exclude pattern.
Get-ChildItem -LiteralPath $staging -Recurse -Force -File |
  Where-Object { $_.Name -eq '.env' -or $_.Name -like '.env.*' } |
  Where-Object { $_.Name -ne '.env.example' -and $_.Name -ne '.env.production.example' } |
  Remove-Item -Force

if (-not (Test-Path (Join-Path $staging 'README.md'))) {
  throw 'README.md is missing from the staging folder.'
}
if (-not (Test-Path (Join-Path $staging 'server')) -or -not (Test-Path (Join-Path $staging 'client'))) {
  throw 'server/ or client/ is missing from the staging folder.'
}

if (Test-Path -LiteralPath $zipPath) {
  Remove-Item -LiteralPath $zipPath -Force
}

Write-Host 'Creating ZIP...'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$zipStream = [System.IO.Compression.ZipFile]::Open(
  $zipPath,
  [System.IO.Compression.ZipArchiveMode]::Create
)
try {
  Get-ChildItem -LiteralPath $staging -Recurse -File | ForEach-Object {
    $relativePath = $_.FullName.Substring($staging.Length + 1).Replace('\', '/')
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
      $zipStream,
      $_.FullName,
      $relativePath,
      [System.IO.Compression.CompressionLevel]::Optimal
    ) | Out-Null
  }
} finally {
  $zipStream.Dispose()
}

$archive = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
try {
  $names = $archive.Entries.FullName
  # Compress-Archive on Windows may use backslashes; normalise before checking.
  $normalizedNames = $names | ForEach-Object { $_ -replace '\\', '/' }
  $bad = $normalizedNames | Where-Object {
    $_ -match '(^|/)node_modules/' -or
    $_ -match '(^|/)dist/' -or
    $_ -match '(^|/)\.env$' -or
    $_ -match '(^|/)\.env\.local$' -or
    $_ -match '(^|/)\.npm-cache/' -or
    $_ -match '(^|/)\.tools/' -or
    $_ -match '(^|/)\.mongodb-binaries/'
  }
  if ($bad) {
    throw "Archive contains excluded files:`n$($bad -join "`n")"
  }
} finally {
  $archive.Dispose()
}

Remove-Item -LiteralPath $staging -Recurse -Force

$sizeMb = [math]::Round((Get-Item -LiteralPath $zipPath).Length / 1MB, 2)
Write-Host ''
Write-Host "Created: $zipPath"
Write-Host "Size:    $sizeMb MB"
Write-Host "Entries: $($names.Count)"
