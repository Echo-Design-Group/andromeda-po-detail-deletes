$ErrorActionPreference = "Continue"

# --- Project paths ---
$ProjectDir = "C:\Users\dotnetapp\Desktop\Projects\Andromeda\andromeda-po-detail-deletes"
$IndexJs    = Join-Path $ProjectDir "index.js"
$CrashJs    = Join-Path $ProjectDir "sendCrashReport.js"
$OomTestJs  = Join-Path $ProjectDir "oom-test.js"

# Toggle this when you want to test a forced OOM
$UseOomTest = $false

# --- Explicit Node path ---
$NodeExe = "C:\Program Files\nodejs\node.exe"
if (!(Test-Path $NodeExe)) { $NodeExe = "node" }

Set-Location $ProjectDir

# Build node args as an array (avoids quote/escape problems)
if ($UseOomTest) {
    $nodeArgs = @("--max-old-space-size=64", $OomTestJs)
} else {
    $nodeArgs = @("--max-old-space-size=8192", $IndexJs)
}

# Start Node and wait (capture output so it can't block)
$proc = Start-Process -FilePath $NodeExe -ArgumentList $nodeArgs -NoNewWindow -Wait -PassThru
$ExitCode = $proc.ExitCode

if ($ExitCode -ne 0) {
    Write-Host ("Node crashed with exit code {0} - sending crash report..." -f $ExitCode)

    $crashProc = Start-Process -FilePath $NodeExe -ArgumentList @($CrashJs) -NoNewWindow -Wait -PassThru
    $CrashExit = $crashProc.ExitCode

    Write-Host ("Crash reporter exit code: {0}" -f $CrashExit)
}

exit $ExitCode
