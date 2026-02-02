# Find PostgreSQL installation and add to PATH
Write-Host "Searching for PostgreSQL installation..." -ForegroundColor Cyan

$possiblePaths = @(
    "C:\Program Files\PostgreSQL\*\bin",
    "C:\Program Files (x86)\PostgreSQL\*\bin",
    "C:\PostgreSQL\*\bin",
    "$env:ProgramFiles\PostgreSQL\*\bin",
    "${env:ProgramFiles(x86)}\PostgreSQL\*\bin"
)

$pgPath = $null
foreach ($pattern in $possiblePaths) {
    $found = Get-ChildItem -Path $pattern -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($found) {
        $pgPath = $found.FullName
        break
    }
}

if ($pgPath) {
    Write-Host "Found PostgreSQL at: $pgPath" -ForegroundColor Green
    $env:Path = "$pgPath;$env:Path"
    Write-Host "Added PostgreSQL to PATH for this session" -ForegroundColor Green
    Write-Host ""

    # Test psql command
    Write-Host "Testing psql command..." -ForegroundColor Cyan
    try {
        $version = psql --version
        Write-Host "$version" -ForegroundColor Green
        Write-Host ""
        Write-Host "PostgreSQL is ready. Running database setup..." -ForegroundColor Green
        Write-Host ""

        # Run the setup
        npm run db:create
        if ($LASTEXITCODE -eq 0) {
            npm run db:migrate
            if ($LASTEXITCODE -eq 0) {
                npm run db:seed
            }
        }
    } catch {
        Write-Host "Error testing psql: $_" -ForegroundColor Red
    }
} else {
    Write-Host "PostgreSQL installation not found." -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install PostgreSQL or add it to your PATH manually:" -ForegroundColor Yellow
    Write-Host "1. Find your PostgreSQL installation (usually C:\Program Files\PostgreSQL\15\bin)" -ForegroundColor Yellow
    Write-Host "2. Add it to your PATH environment variable" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Or run this command with your PostgreSQL path:" -ForegroundColor Yellow
    Write-Host '  $env:Path = "C:\Program Files\PostgreSQL\15\bin;$env:Path"' -ForegroundColor Cyan
    exit 1
}
