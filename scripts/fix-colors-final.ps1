# Final comprehensive color replacement script
$paths = @(
    "D:\Capstone\elderly-home-care-app\app",
    "D:\Capstone\elderly-home-care-app\components"
)

# Comprehensive color mappings - replace all non-orange colors
$colorReplacements = @{
    # Red shades
    '#FF6B6B' = '#FF6B35'
    '#dc3545' = '#FF6B35'
    '#DD0000' = '#E85D2A'
    
    # Green/Teal shades
    '#4ECDC4' = '#FF8E53'
    '#6BCF7F' = '#FFA07A'
    '#28a745' = '#FFA07A'
    '#30A0E0' = '#FF8E53'
    
    # Yellow shades
    '#FFD93D' = '#FFB84D'
    '#ffc107' = '#FFB84D'
    
    # Purple/Blue shades
    '#667eea' = '#FF6B35'
    '#764ba2' = '#E85D2A'
    '#007bff' = '#FF6B35'
    
    # Gray/Neutral shades (keep as is - these are for text/borders)
    # '#2c3e50' = keep
    # '#6c757d' = keep
    # '#f8f9fa' = keep
    # '#e9ecef' = keep
}

foreach ($targetPath in $paths) {
    Get-ChildItem -Path $targetPath -Filter "*.tsx" -Recurse | ForEach-Object {
        $file = $_
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        $modified = $false
        
        foreach ($old in $colorReplacements.Keys) {
            $new = $colorReplacements[$old]
            if ($content -match [regex]::Escape($old)) {
                $content = $content -replace [regex]::Escape($old), $new
                $modified = $true
            }
        }
        
        if ($modified) {
            Write-Host "Updated: $($file.FullName)"
            $content | Set-Content $file.FullName -Encoding UTF8 -NoNewline
        }
    }
}

Write-Host "`nFinal color replacement completed!"
