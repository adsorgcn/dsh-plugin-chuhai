$ErrorActionPreference = 'Stop'
$clean = 'C:\Users\easts\AppData\Local\Temp\claude\fe2cedb7dca095ac\3cc6557f-7b23-4c4c-8f70-869e10352cd8\scratchpad\npm-pub\clean'
Set-Location $clean
$ver = (Get-Content package.json | ConvertFrom-Json).version
Write-Host "publishing dsh-plugin-chuhai $ver from $clean"
$line = Get-Content 'C:\Users\easts\.claude\secrets\npm-ilang-v2.0-2026-11-12.env' | Where-Object { $_ -like 'NPM_TOKEN=*' }
$env:NPM_TOKEN = $line.Substring(10)
'//registry.npmjs.org/:_authToken=${NPM_TOKEN}' | Set-Content -NoNewline -Encoding ascii .npmrc
try {
  npm publish --access public
} finally {
  Remove-Item .npmrc -ErrorAction SilentlyContinue
  $env:NPM_TOKEN = $null
}
Write-Host "--- registry says ---"
npm view dsh-plugin-chuhai version dist.integrity
