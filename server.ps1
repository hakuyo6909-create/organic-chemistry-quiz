# =====================================================================
#  Offline static file server for the chemistry app (no dependencies).
#  Uses only Windows built-in .NET (System.Net.HttpListener).
#  Serves the folder this script lives in, then opens the browser.
#  Launched by start-offline.bat (do not run directly by double-click).
# =====================================================================
$ErrorActionPreference = 'Stop'

$root = $PSScriptRoot
if (-not $root) { $root = (Get-Location).Path }
$rootFull = [System.IO.Path]::GetFullPath($root)

# MIME types (wasm/js correct types are required by browsers)
$mime = @{
  '.html'  = 'text/html; charset=utf-8'
  '.htm'   = 'text/html; charset=utf-8'
  '.js'    = 'text/javascript; charset=utf-8'
  '.mjs'   = 'text/javascript; charset=utf-8'
  '.css'   = 'text/css; charset=utf-8'
  '.json'  = 'application/json; charset=utf-8'
  '.wasm'  = 'application/wasm'
  '.png'   = 'image/png'
  '.gif'   = 'image/gif'
  '.jpg'   = 'image/jpeg'
  '.jpeg'  = 'image/jpeg'
  '.svg'   = 'image/svg+xml'
  '.ico'   = 'image/x-icon'
  '.txt'   = 'text/plain; charset=utf-8'
  '.map'   = 'application/json'
  '.woff'  = 'font/woff'
  '.woff2' = 'font/woff2'
  '.ttf'   = 'font/ttf'
}

# Pick the first free port from the candidate list
$listener = $null
$port = 0
foreach ($p in 8765, 8766, 8780, 8800, 9000, 8080, 8888) {
  try {
    $l = New-Object System.Net.HttpListener
    $l.Prefixes.Add("http://localhost:$p/")
    $l.Start()
    $listener = $l
    $port = $p
    break
  } catch {
    if ($l) { try { $l.Close() } catch {} }
  }
}

if (-not $listener) {
  Write-Host "ERROR: could not open a local port (8765-8888)." -ForegroundColor Red
  Read-Host "Press Enter to exit"
  exit 1
}

$url = "http://localhost:$port/index.html"
Write-Host "======================================================"
Write-Host " Chemistry app - OFFLINE server running"
Write-Host " Folder : $rootFull"
Write-Host " URL    : $url"
Write-Host ""
Write-Host " The browser should open automatically."
Write-Host " KEEP THIS WINDOW OPEN while using the app."
Write-Host " Close this window to stop the server."
Write-Host "======================================================"

if ($env:CHEM_SERVER_NOOPEN -ne '1') { Start-Process $url }

try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $req = $ctx.Request
    $res = $ctx.Response
    try {
      $rel = [System.Uri]::UnescapeDataString($req.Url.AbsolutePath)
      if ($rel -eq '/') { $rel = '/index.html' }
      $rel = $rel.TrimStart('/')
      $full = [System.IO.Path]::GetFullPath((Join-Path $rootFull $rel))

      # Block path traversal outside the served folder
      if (-not $full.StartsWith($rootFull, [System.StringComparison]::OrdinalIgnoreCase)) {
        $res.StatusCode = 403
        $res.Close()
        continue
      }

      if (Test-Path -LiteralPath $full -PathType Leaf) {
        $bytes = [System.IO.File]::ReadAllBytes($full)
        $ext = [System.IO.Path]::GetExtension($full).ToLower()
        $ct = $mime[$ext]
        if (-not $ct) { $ct = 'application/octet-stream' }
        $res.ContentType = $ct
        $res.ContentLength64 = $bytes.Length
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
      } else {
        $res.StatusCode = 404
        $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $rel")
        $res.OutputStream.Write($msg, 0, $msg.Length)
      }
    } catch {
      try { $res.StatusCode = 500 } catch {}
    } finally {
      try { $res.OutputStream.Close() } catch {}
    }
  }
} finally {
  try { $listener.Stop() } catch {}
}
