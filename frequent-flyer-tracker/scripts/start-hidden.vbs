' Launches "npm start" with no visible console window, logging output to
' logs\output.log. Used by the Task Scheduler entry created by
' install-startup-task.ps1 — see README.md "Run automatically on Windows".

Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")

scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
appDir = fso.GetParentFolderName(scriptDir)
shell.CurrentDirectory = appDir

cmd = "cmd /c ""if not exist logs mkdir logs && npm start >> logs\output.log 2>&1"""

' 0 = hidden window, False = don't wait for it to exit (fire and forget)
shell.Run cmd, 0, False
