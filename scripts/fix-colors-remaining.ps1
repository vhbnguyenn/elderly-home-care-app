# Script to replace remaining colors (red, yellow, teal, amber) with orange theme
$paths = @(
    "D:\Capstone\elderly-home-care-app\app",
    "D:\Capstone\elderly-home-care-app\components"
)

# Additional color mappings for remaining colors
$colorReplacements = @{
    '#EF4444' = '#FF6B35'  # Red -> Orange
    '#F59E0B' = '#FFA500'  # Amber/Yellow -> Orange amber
    '#14B8A6' = '#FF8E53'  # Teal -> Light orange
    '#06B6D4' = '#FF6B35'  # Cyan -> Orange
    '#2563EB' = '#FF6B35'  # Blue -> Orange
    '#DC2626' = '#E85D2A'  # Red 600 -> Dark orange
    '#F97316' = '#FF6B35'  # Orange 500 (keep similar)
    '#EA580C' = '#E85D2A'  # Orange 600 (keep similar dark)
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

Write-Host "`nAll remaining colors replaced!"
