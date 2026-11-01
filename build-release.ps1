$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $Root

function Write-Step {
  param([string]$Message)
  Write-Host ""
  Write-Host "== $Message ==" -ForegroundColor Cyan
}

function New-ZipArchive {
  param([string]$StageDir, [string]$ZipPath)
  if (Test-Path -LiteralPath $ZipPath) {
    Remove-Item -LiteralPath $ZipPath -Force
  }
  $parent = Split-Path -Parent $StageDir
  $leaf = Split-Path -Leaf $StageDir
  tar.exe -a -c -f $ZipPath -C $parent $leaf
  if ($LASTEXITCODE -ne 0) {
    throw "压缩失败：$ZipPath"
  }
}

$appText = Get-Content -LiteralPath (Join-Path $Root "app.py") -Raw -Encoding UTF8
if ($appText -notmatch '(?m)^APP_VERSION = "([^"]+)"') {
  throw "无法读取 APP_VERSION"
}
$Version = $Matches[1]
$SourceName = "OpenCode-Desktop-$Version-source-win64"
$PortableName = "OpenCode-Desktop-$Version-portable-x64"
$BuildDir = Join-Path $Root "build"
$ReleaseDir = Join-Path $Root "release"
$BuildVenv = Join-Path $Root ".build-venv"
$BuildPython = Join-Path $BuildVenv "Scripts\python.exe"

New-Item -ItemType Directory -Force -Path $BuildDir, $ReleaseDir | Out-Null

Write-Step "检查打包依赖"
if (-not (Test-Path -LiteralPath $BuildPython)) {
  try {
    & py -3.13 -m venv $BuildVenv
  } catch {
    & python -m venv $BuildVenv
  }
  if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $BuildPython)) {
    throw "无法创建构建虚拟环境"
  }
}
& $BuildPython -m pip install --disable-pip-version-check -r (Join-Path $Root "requirements.txt") -r (Join-Path $Root "requirements-build.txt")
if ($LASTEXITCODE -ne 0) {
  throw "构建依赖安装失败"
}
$PyInstallerVersion = (& $BuildPython -m PyInstaller --version).Trim()
Write-Host "PyInstaller $PyInstallerVersion"

Write-Step "准备 WebView2 安装引导程序"
$WebViewDir = Join-Path $Root "packaging\webview2"
$WebViewSetup = Join-Path $WebViewDir "MicrosoftEdgeWebView2Setup.exe"
New-Item -ItemType Directory -Force -Path $WebViewDir | Out-Null
if (-not (Test-Path -LiteralPath $WebViewSetup)) {
  Invoke-WebRequest -Uri "https://go.microsoft.com/fwlink/p/?LinkId=2124703" -OutFile $WebViewSetup -MaximumRedirection 10
}
if (-not (Test-Path -LiteralPath $WebViewSetup) -or (Get-Item -LiteralPath $WebViewSetup).Length -lt 1000000) {
  throw "WebView2 安装引导程序无效"
}
$webViewSignature = Get-AuthenticodeSignature -LiteralPath $WebViewSetup
if ($webViewSignature.Status -ne "Valid" -or $webViewSignature.SignerCertificate.Subject -notmatch "Microsoft") {
  throw "WebView2 安装引导程序签名无效"
}
Write-Host "WebView2 安装引导程序签名有效"

Write-Step "定位 OpenCode CLI"
$CliSource = $env:OPENCODE_CLI_SOURCE
if (-not $CliSource) {
  $CliSource = Join-Path $env:APPDATA "npm\node_modules\opencode-ai\bin\opencode.exe"
}
if (-not (Test-Path -LiteralPath $CliSource)) {
  throw "未找到 OpenCode CLI：$CliSource。可通过 OPENCODE_CLI_SOURCE 指定路径。"
}
$CliSource = (Resolve-Path -LiteralPath $CliSource).Path
$CliPackage = Split-Path -Parent (Split-Path -Parent $CliSource)
$CliLicense = Join-Path $CliPackage "LICENSE"
if (-not (Test-Path -LiteralPath $CliLicense)) {
  throw "未找到 OpenCode CLI LICENSE：$CliLicense"
}
$CliVersion = (& $CliSource --version).Trim()
if ($LASTEXITCODE -ne 0) {
  throw "OpenCode CLI 无法运行"
}
Write-Host "OpenCode CLI $CliVersion ($CliSource)"

Write-Step "构建便携版程序"
$PyInstallerDist = Join-Path $BuildDir "pyinstaller-dist"
$PyInstallerWork = Join-Path $BuildDir "pyinstaller-work"
& $BuildPython -m PyInstaller --noconfirm --clean --distpath $PyInstallerDist --workpath $PyInstallerWork (Join-Path $Root "packaging\opencode_desktop.spec")
if ($LASTEXITCODE -ne 0) {
  throw "PyInstaller 构建失败"
}
$PyInstallerApp = Join-Path $PyInstallerDist "OpenCodeDesktop"
if (-not (Test-Path -LiteralPath (Join-Path $PyInstallerApp "OpenCodeDesktop.exe"))) {
  throw "PyInstaller 输出不完整"
}

Write-Step "生成源码分发包"
$SourceStage = Join-Path $BuildDir "source\$SourceName"
if (Test-Path -LiteralPath $SourceStage) {
  Remove-Item -LiteralPath $SourceStage -Recurse -Force
}
New-Item -ItemType Directory -Force -Path (Join-Path $SourceStage "static"), (Join-Path $SourceStage "webview2") | Out-Null
Copy-Item -LiteralPath (Join-Path $Root "app.py"), (Join-Path $Root "requirements.txt"), (Join-Path $Root "icon.ico") -Destination $SourceStage
Get-ChildItem -LiteralPath (Join-Path $Root "static") -Force |
  Where-Object { $_.Name -notin @("app.js.old-terminal.bak", "__pycache__") } |
  Copy-Item -Destination (Join-Path $SourceStage "static") -Recurse
Get-ChildItem -LiteralPath $Root -Filter "*.bat" -File |
  Copy-Item -Destination $SourceStage
Copy-Item -LiteralPath $WebViewSetup -Destination (Join-Path $SourceStage "webview2")
Copy-Item -LiteralPath (Join-Path $Root "packaging\README-source.txt") -Destination (Join-Path $SourceStage "使用说明.txt")
Copy-Item -LiteralPath (Join-Path $Root "packaging\登录 OpenCode.bat") -Destination $SourceStage

Write-Step "生成便携分发包"
$PortableStage = Join-Path $BuildDir "portable\$PortableName"
if (Test-Path -LiteralPath $PortableStage) {
  Remove-Item -LiteralPath $PortableStage -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $PortableStage, (Join-Path $PortableStage "cli"), (Join-Path $PortableStage "webview2") | Out-Null
Copy-Item -Path (Join-Path $PyInstallerApp "*") -Destination $PortableStage -Recurse
Copy-Item -LiteralPath $CliSource -Destination (Join-Path $PortableStage "cli\opencode.exe")
Copy-Item -LiteralPath $CliLicense -Destination (Join-Path $PortableStage "cli\LICENSE")
Copy-Item -LiteralPath $WebViewSetup -Destination (Join-Path $PortableStage "webview2")
Copy-Item -LiteralPath (Join-Path $Root "packaging\README-portable.txt") -Destination (Join-Path $PortableStage "使用说明.txt")
Copy-Item -LiteralPath (Join-Path $Root "packaging\登录 OpenCode.bat") -Destination $PortableStage

$VersionInfo = @(
  "OpenCode 桌面版本: $Version",
  "OpenCode CLI 版本: $CliVersion",
  "构建时间: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
)
[System.IO.File]::WriteAllLines((Join-Path $PortableStage "版本信息.txt"), $VersionInfo, (New-Object System.Text.UTF8Encoding($false)))

Write-Step "压缩发布包"
$SourceZip = Join-Path $ReleaseDir "$SourceName.zip"
$PortableZip = Join-Path $ReleaseDir "$PortableName.zip"
New-ZipArchive -StageDir $SourceStage -ZipPath $SourceZip
New-ZipArchive -StageDir $PortableStage -ZipPath $PortableZip

$hashLines = foreach ($file in Get-ChildItem -LiteralPath $ReleaseDir -Filter "*.zip" | Sort-Object Name) {
  $hash = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash.ToLower()
  "$hash  $($file.Name)"
}
[System.IO.File]::WriteAllLines((Join-Path $ReleaseDir "SHA256SUMS.txt"), $hashLines, (New-Object System.Text.UTF8Encoding($false)))

Get-ChildItem -LiteralPath $ReleaseDir -Filter "*.zip" |
  ForEach-Object { [PSCustomObject]@{ Name = $_.Name; MB = [math]::Round($_.Length / 1MB, 1) } } |
  Format-Table -AutoSize

Write-Step "构建完成"
Write-Host "源码包: $SourceZip"
Write-Host "便携包: $PortableZip"
Write-Host "校验和: $(Join-Path $ReleaseDir 'SHA256SUMS.txt')"
