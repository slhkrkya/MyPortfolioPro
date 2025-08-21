param(
  [Parameter(Mandatory=$true)] [string]$SshKeyPath,   # e.g. C:\Users\Salih\.ssh\myportfoliopro-key.pem
  [Parameter(Mandatory=$true)] [string]$ServerIp,     # e.g. 63.33.62.239
  [Parameter(Mandatory=$true)] [string]$ApiProjPath,  # e.g. D:\MyPortfolioPro\backend\API\API.csproj
  [string]$OutDir = "$(Split-Path $ApiProjPath -Parent)\out",
  [string]$RemoteTmp = "/tmp/api",
  [string]$RemoteAppDir = "/var/www/api",
  [string]$ServiceName = "portfolio"
)

$ErrorActionPreference = "Stop"
function Log($m){ Write-Host ">> $m" }

if (!(Test-Path $ApiProjPath)) { throw "API.csproj not found: $ApiProjPath" }
if (!(Test-Path $SshKeyPath)) { throw "SSH key not found: $SshKeyPath" }

# 1) Clean
Log "Cleaning bin/obj and NuGet cache..."
$apiRoot = Split-Path $ApiProjPath -Parent
$solutionRoot = Split-Path (Split-Path $apiRoot -Parent) -Parent
dotnet clean "$solutionRoot\MyPortfolioPro.sln"
dotnet nuget locals all --clear | Out-Null
"API","Application","Infrastructure" | ForEach-Object {
  Remove-Item -Recurse -Force "$solutionRoot\backend\$_\bin" -ErrorAction SilentlyContinue
  Remove-Item -Recurse -Force "$solutionRoot\backend\$_\obj" -ErrorAction SilentlyContinue
}
Log "Clean done."

# 2) Restore/Build/Publish (net8.0, framework-dependent DLL)
Log "Restore + Build..."
dotnet restore "$solutionRoot\MyPortfolioPro.sln"
dotnet build   "$ApiProjPath" -c Release

Log "Publish net8.0 -> $OutDir ..."
if (Test-Path $OutDir) { Remove-Item -Recurse -Force $OutDir }
dotnet publish "$ApiProjPath" -c Release -f net8.0 -o $OutDir

# 3) Sanity check: no 9.0 in deps
$depsFile = Join-Path $OutDir "API.deps.json"
if (!(Test-Path $depsFile)) { throw "API.deps.json missing. Publish failed?" }
if (Select-String -Path $depsFile -Pattern '"9.0.0"' -SimpleMatch) {
  throw "Found 9.0.0 in API.deps.json. Ensure all packages are 8.x and try again."
}
Log "Deps OK (no 9.0)."

# 4) Copy to server (scp)
Log "Copying files to server (scp)..."
$scpSrc = Join-Path $OutDir "*"
& scp -i $SshKeyPath -r $scpSrc "ubuntu@${ServerIp}:$RemoteTmp"
Log "Copy complete."

# 5) Update service on server (ssh)
Log "Updating systemd service and restarting..."
$remoteCmd = "sudo systemctl stop $ServiceName || true; " +
             "sudo rm -rf $RemoteAppDir/*; " +
             "sudo mkdir -p $RemoteAppDir; " +
             "sudo cp -r $RemoteTmp/* $RemoteAppDir/; " +
             "sudo chown -R www-data:www-data $RemoteAppDir; " +
             "sudo sed -i 's|ExecStart=.*|ExecStart=/usr/bin/dotnet $RemoteAppDir/API.dll|' /etc/systemd/system/$ServiceName.service; " +
             "sudo systemctl daemon-reload; " +
             "sudo systemctl restart $ServiceName; " +
             "sudo systemctl status $ServiceName --no-pager --full || true; " +
             "curl -sI http://localhost:5000/ || true"

& ssh -i $SshKeyPath "ubuntu@${ServerIp}" $remoteCmd

Log "Done. Test at: http://$ServerIp/api/<your-endpoint>"
