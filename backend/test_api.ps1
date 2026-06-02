# API Integration Tests

Write-Host "--- 1. Testing Login API ---" -ForegroundColor Cyan
$loginBody = @{
    email = "admin@platform.com"
    password = "AdminPass123!"
} | ConvertTo-Json

try {
    $loginRes = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginRes.token
    Write-Host "SUCCESS: Logged in as Admin. Token received." -ForegroundColor Green
} catch {
    Write-Host "ERROR: Login failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n--- 2. Testing Stats API (Protected Admin Route) ---" -ForegroundColor Cyan
$headers = @{
    Authorization = "Bearer $token"
}

try {
    $stats = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/stats" -Headers $headers
    Write-Host "SUCCESS: Stats received:" -ForegroundColor Green
    Write-Host "Total Users: $($stats.totalUsers)"
    Write-Host "Total Stores: $($stats.totalStores)"
    Write-Host "Total Ratings: $($stats.totalRatings)"
} catch {
    Write-Host "ERROR: Fetching stats failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n--- 3. Testing Strict Name Validation (Min 20 chars check) ---" -ForegroundColor Cyan
$invalidUserBody = @{
    name = "Short Name" # 10 chars, should fail!
    email = "test.short@platform.com"
    password = "UserPass123!"
    address = "123 Valid Street, NY 10001"
    role = "User"
} | ConvertTo-Json

try {
    $res = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/users" -Method Post -Body $invalidUserBody -ContentType "application/json" -Headers $headers
    Write-Host "ERROR: Short name check allowed insertion (unexpected)." -ForegroundColor Red
    exit 1
} catch {
    $errObj = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($errObj)
    $responseBody = $reader.ReadToEnd()
    Write-Host "SUCCESS: Rejected as expected. Response:" -ForegroundColor Green
    Write-Host $responseBody -ForegroundColor Yellow
}

Write-Host "`n--- 4. Testing Password Complexity Validation ---" -ForegroundColor Cyan
$invalidPassBody = @{
    name = "Valid Long Name Standard Account" # 30 chars
    email = "test.pass@platform.com"
    password = "simple" # No uppercase, no special, too short, should fail!
    address = "123 Valid Street, NY 10001"
    role = "User"
} | ConvertTo-Json

try {
    $res = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/users" -Method Post -Body $invalidPassBody -ContentType "application/json" -Headers $headers
    Write-Host "ERROR: Simple password check allowed insertion (unexpected)." -ForegroundColor Red
    exit 1
} catch {
    $errObj = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($errObj)
    $responseBody = $reader.ReadToEnd()
    Write-Host "SUCCESS: Rejected as expected. Response:" -ForegroundColor Green
    Write-Host $responseBody -ForegroundColor Yellow
}

Write-Host "`n--- 5. Testing Store Listing API ---" -ForegroundColor Cyan
try {
    $stores = Invoke-RestMethod -Uri "http://localhost:5000/api/admin/stores" -Headers $headers
    Write-Host "SUCCESS: Stores list received. Total stores: $($stores.Length)" -ForegroundColor Green
    foreach ($s in $stores) {
        Write-Host "Store: $($s.name) | Avg Rating: $($s.rating)"
    }
} catch {
    Write-Host "ERROR: Fetching stores failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n--- API Verification Completed Successfully ---" -ForegroundColor Green
