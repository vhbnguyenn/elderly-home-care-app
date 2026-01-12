# Script to replace all non-orange colors with orange theme colors in components
$targetPath = "D:\Capstone\elderly-home-care-app\components"

# Color mappings (old -> new)
$colorReplacements = @{
    '#68C2E8' = '#FF6B35'  # Cyan -> Orange
    '#5AB9E0' = '#FF8E53'  # Light cyan -> Light orange
    '#3B82F6' = '#FF6B35'  # Blue -> Orange
    '#0284C7' = '#FF6B35'  # Sky blue -> Orange
    '#8B5CF6' = '#FF8E53'  # Purple -> Light orange
    '#10B981' = '#FFA07A'  # Green -> Light coral orange
    '#E0F2FE' = '#FFE5D9'  # Light blue bg -> Light orange bg
}

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

Write-Host "`nColor replacement in components completed!"
