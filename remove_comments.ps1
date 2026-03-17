# PowerShell script to remove comments from code files
# Removes // comments, /* */ comments, <!-- --> comments

param(
    [string]$Path = "."
)

Get-ChildItem -Path $Path -Recurse -Include *.cs,*.ts,*.tsx,*.js,*.jsx,*.java,*.py,*.cpp,*.c,*.h,*.html,*.css,*.scss -File | ForEach-Object {
    $file = $_.FullName
    Write-Host "Processing $file"
    
    $content = Get-Content -Path $file -Raw
    
    # Remove /* */ comments (multi-line)
    $content = $content -replace '(?s)/\*.*?\*/', ''
    
    # Remove // comments (single-line)
    $content = $content -replace '//.*', ''
    
    # Remove <!-- --> comments (HTML)
    $content = $content -replace '(?s)<!--.*?-->', ''
    
    # Remove empty lines that were left
    $content = $content -replace '(?m)^\s*$', ''
    
    Set-Content -Path $file -Value $content
}