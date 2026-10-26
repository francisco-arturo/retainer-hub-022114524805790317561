# init.ps1 - Windows verification entrypoint for the HoldThatSmile demo.
# Fails fast. Pure Node checks; no dependencies are installed.
$ErrorActionPreference = 'Stop'

function Invoke-NodeCheck {
    param([string]$Label, [string[]]$Arguments)
    Write-Host "=== $Label ==="
    & node @Arguments
    if ($LASTEXITCODE -ne 0) { throw "Check failed ($Label) with exit code $LASTEXITCODE" }
}

Write-Host '=== HoldThatSmile verification ==='
Invoke-NodeCheck -Label 'Syntax: seed data' -Arguments @('--check', 'js/data.js')
Invoke-NodeCheck -Label 'Syntax: store' -Arguments @('--check', 'js/store.js')
Invoke-NodeCheck -Label 'Syntax: application' -Arguments @('--check', 'js/app.js')
Invoke-NodeCheck -Label 'Syntax: local server' -Arguments @('--check', 'dev-server.mjs')
Invoke-NodeCheck -Label 'Order, payment, account and admin logic' -Arguments @('scripts/verify.mjs')
Invoke-NodeCheck -Label 'Render all customer routes and admin interactions' -Arguments @('scripts/render-smoke.mjs')
Invoke-NodeCheck -Label 'Static route smoke test' -Arguments @('scripts/smoke.mjs')

Write-Host ''
Write-Host '=== Verification Complete ==='
Write-Host 'Local demo: npm start  ->  http://127.0.0.1:4176'
Write-Host 'Staff demo PIN: 2468'
