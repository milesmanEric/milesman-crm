<#
Registers a Task Scheduler task that starts Frequent Flyer Tracker
(hidden, no console window) whenever you log in to Windows.

Run once, from an ordinary PowerShell prompt in this folder (elevation
not required):

    powershell -ExecutionPolicy Bypass -File .\install-startup-task.ps1

Requires `npm install` and `npx playwright install chromium` to have
already been run in the parent folder at least once.
#>

$ErrorActionPreference = 'Stop'

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$vbsPath = Join-Path $scriptDir 'start-hidden.vbs'
$appDir = Split-Path -Parent $scriptDir
$taskName = 'FrequentFlyerTracker'

if (-not (Test-Path $vbsPath)) {
    throw "Could not find start-hidden.vbs next to this script."
}

$action = New-ScheduledTaskAction -Execute 'wscript.exe' -Argument "`"$vbsPath`"" -WorkingDirectory $appDir
$trigger = New-ScheduledTaskTrigger -AtLogOn
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -MultipleInstances IgnoreNew

if (Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue) {
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
}

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings `
    -Description 'Runs the Frequent Flyer Tracker dashboard + background balance refresh at login.' | Out-Null

Write-Host "Installed. '$taskName' will start automatically at your next login."
Write-Host "To start it right now without logging out, run:"
Write-Host "    Start-ScheduledTask -TaskName $taskName"
Write-Host "Logs will appear in: $appDir\logs\output.log"
