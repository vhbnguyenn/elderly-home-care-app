# Script to seed sample users into backend
# Usage: .\seed_users.ps1

$BASE_URL = "http://localhost:3000"  # Change this to your backend URL
$USERS_FILE = "sample_users.json"

Write-Host "🌱 Seeding Sample Users..." -ForegroundColor Green
Write-Host ""

# Check if users file exists
if (-not (Test-Path $USERS_FILE)) {
    Write-Host "❌ Error: $USERS_FILE not found!" -ForegroundColor Red
    exit 1
}

# Load users from JSON
$users = Get-Content $USERS_FILE | ConvertFrom-Json

Write-Host "📋 Found $($users.Count) users to seed" -ForegroundColor Cyan
Write-Host ""

# Counter
$success = 0
$failed = 0

# Seed each user
foreach ($user in $users) {
    Write-Host "👤 Creating user: $($user.name) ($($user.email))" -ForegroundColor Yellow
    
    try {
        # Prepare user data for API
        $userData = @{
            id = $user.id
            email = $user.email
            password = $user.password
            role = $user.role
            name = $user.name
            phone = $user.phone
            address = $user.address
            avatar = $user.avatar
            created_at = $user.created_at
        }
        
        # Add caregiver profile if exists
        if ($user.caregiver_profile) {
            $userData.caregiver_profile = $user.caregiver_profile
        }
        
        # Convert to JSON
        $body = $userData | ConvertTo-Json -Depth 10
        
        # Send POST request
        $response = Invoke-RestMethod -Uri "$BASE_URL/users" -Method Post -Body $body -ContentType "application/json"
        
        Write-Host "   ✅ Success: User created with ID: $($response.id)" -ForegroundColor Green
        $success++
    }
    catch {
        Write-Host "   ❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
    
    Write-Host ""
}

# Summary
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "📊 Summary:" -ForegroundColor Green
Write-Host "   ✅ Success: $success users" -ForegroundColor Green
Write-Host "   ❌ Failed: $failed users" -ForegroundColor Red
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Print test accounts
if ($success -gt 0) {
    Write-Host "🔑 Test Accounts:" -ForegroundColor Green
    Write-Host ""
    Write-Host "   Care Seeker:" -ForegroundColor Yellow
    Write-Host "   Email: seeker1@test.com" -ForegroundColor White
    Write-Host "   Password: seeker123" -ForegroundColor White
    Write-Host ""
    Write-Host "   Caregiver:" -ForegroundColor Yellow
    Write-Host "   Email: caregiver1@test.com" -ForegroundColor White
    Write-Host "   Password: giver123" -ForegroundColor White
    Write-Host ""
}
