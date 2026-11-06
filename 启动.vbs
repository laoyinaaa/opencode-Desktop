Option Explicit
Dim shell, fso, base, python, pythonw, app, bat, rc
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
base = fso.GetParentFolderName(WScript.ScriptFullName)
python = base & "\.venv\Scripts\python.exe"
pythonw = base & "\.venv\Scripts\pythonw.exe"
app = base & "\app.py"
bat = base & "\" & ChrW(21551) & ChrW(21160) & ".bat"

If Not fso.FileExists(python) Or Not fso.FileExists(pythonw) Then
  rc = 1
Else
  rc = shell.Run("""" & python & """ -c ""import webview, aiohttp""", 0, True)
End If

If rc <> 0 Then
  If fso.FileExists(bat) Then
    shell.Run """" & bat & """", 1, False
  Else
    MsgBox "Run the setup script once before launching.", vbInformation, "OpenCode Desktop"
  End If
  WScript.Quit 0
End If

shell.CurrentDirectory = base
shell.Run """" & pythonw & """ """ & app & """", 0, False
