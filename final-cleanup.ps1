# Final cleanup script - removes all AdminLayout references
$ErrorActionPreference = "Stop"

$files = @(
    "src\app\admin\themes\[id]\page.tsx",
    "src\app\admin\themes\[id]\edit\page.tsx",
    "src\app\admin\services\[action]\page.tsx",
    "src\app\admin\products\edit\[id]\page.tsx",
    "src\app\admin\plugins\[slug]\page.tsx",
    "src\app\admin\news\[id]\edit\page.tsx"
)

foreach ($file in $files) {
    $fullPath = "c:\Users\erdem\Personal-Blog\$file"
    
    if (Test-Path $fullPath) {
        Write-Host "Processing: $file" -ForegroundColor Cyan
        
        # Read file content
        $content = Get-Content $fullPath -Raw -Encoding UTF8
        
        # Remove import statement
        $content = $content -replace "import AdminLayout from [^;]+;[\r\n]+", ""
        
        # Remove opening tags (with or without props)
        $content = $content -replace "<AdminLayout[^>]*>[\r\n]*", ""
        
        # Remove closing tags
        $content = $content -replace "[\r\n]*\s*</AdminLayout>", ""
        
        # Write back
        Set-Content $fullPath $content -Encoding UTF8 -NoNewline
        
        Write-Host "  ✓ Updated successfully" -ForegroundColor Green
    }
    else {
        Write-Host "  ✗ File not found: $fullPath" -ForegroundColor Red
    }
}

Write-Host "`n✅ All files processed!" -ForegroundColor Green
