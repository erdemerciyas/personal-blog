$files = @(
    "src\app\admin\portfolio\new\page.tsx",
    "src\app\admin\services\edit\[id]\page.tsx",
    "src\app\admin\services\new\page.tsx",
    "src\app\admin\services\[action]\page.tsx",
    "src\app\admin\news\[id]\edit\page.tsx",
    "src\app\admin\news\create\page.tsx",
    "src\app\admin\products\edit\[id]\page.tsx",
    "src\app\admin\products\new\page.tsx",
    "src\app\admin\products\media\page.tsx",
    "src\app\admin\products\reviews\page.tsx",
    "src\app\admin\themes\[id]\page.tsx",
    "src\app\admin\themes\[id]\edit\page.tsx",
    "src\app\admin\themes\create\page.tsx",
    "src\app\admin\plugins\[slug]\page.tsx"
)

foreach ($file in $files) {
    $fullPath = Join-Path "c:\Users\erdem\Personal-Blog" $file
    if (Test-Path $fullPath) {
        $content = Get-Content $fullPath -Raw
        
        # Remove AdminLayout import
        $content = $content -replace "import AdminLayout from [^;]+;`r?`n", ""
        
        # Remove opening AdminLayout tag with props
        $content = $content -replace "<AdminLayout[^>]*>`r?`n", ""
        
        # Remove closing AdminLayout tag
        $content = $content -replace "</AdminLayout>`r?`n", ""
        
        Set-Content $fullPath $content -NoNewline
        Write-Host "Updated: $file"
    } else {
        Write-Host "Not found: $file" -ForegroundColor Yellow
    }
}

Write-Host "`nAll files updated!" -ForegroundColor Green
