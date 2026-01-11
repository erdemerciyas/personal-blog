$files = @(
    "src\app\admin\services\edit\[id]\page.tsx",
    "src\app\admin\products\edit\[id]\page.tsx",
    "src\app\admin\news\[id]\edit\page.tsx",
    "src\app\admin\services\[action]\page.tsx",
    "src\app\admin\themes\[id]\page.tsx",
    "src\app\admin\themes\[id]\edit\page.tsx",
    "src\app\admin\plugins\[slug]\page.tsx"
)

foreach ($file in $files) {
    $fullPath = Join-Path "c:\Users\erdem\Personal-Blog" $file
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw
        
        # Remove AdminLayout import (various patterns)
        $content = $content -replace "import AdminLayout from [^;]+;`r?`n", ""
        
        # Remove opening AdminLayout tag with props (multiline)
        $content = $content -replace "(?s)<AdminLayout[^>]*>`r?`n", ""
        
        # Remove closing AdminLayout tag
        $content = $content -replace "`s*</AdminLayout>`r?`n", ""
        
        Set-Content $fullPath $content -NoNewline
        Write-Host "Updated: $file" -ForegroundColor Green
    } else {
        Write-Host "Not found: $file" -ForegroundColor Yellow
    }
}

Write-Host "`nAll remaining files updated!" -ForegroundColor Cyan
