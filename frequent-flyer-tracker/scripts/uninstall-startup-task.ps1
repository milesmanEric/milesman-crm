<#
Removes the auto-start Task Scheduler entry created by
install-startup-task.ps1. Does not stop an already-running instance —
close its window / end the node.exe process separately if it's running.
#>

$ErrorActionPreference = 'Stop'
$taskName = 'FrequentFlyerTracker'

if (Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue) {
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
    Write-Host "Removed scheduled task '$taskName'."
} else {
    Write-Host "No scheduled task named '$taskName' was found."
}
