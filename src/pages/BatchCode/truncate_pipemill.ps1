$file = "PipeMill.jsx"
$lines = Get-Content $file
$kept = $lines[0..1169]
$kept | Set-Content $file -Encoding UTF8
Write-Host "Done: $($kept.Count) lines"


