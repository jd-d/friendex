param(
    [string]$StartFolder = $HOME,
    [string]$Title = "ChatGPT File Helper",
    [switch]$CloseOnExit
)

$host.UI.RawUI.WindowTitle = $Title

try {
    Set-Location $StartFolder
} catch {
    Set-Location $HOME
}

$raw = $Host.UI.RawUI
$raw.BackgroundColor = 'White'
$raw.ForegroundColor = 'Black'
Clear-Host

Write-Host "ChatGPT File Helper" -ForegroundColor Black -BackgroundColor White
Write-Host "" 
Write-Host "Ask for help with files, folders, pictures, and cleanup." -ForegroundColor Black -BackgroundColor White
Write-Host "Codex will still ask for approval before risky actions if configured that way." -ForegroundColor Black -BackgroundColor White
Write-Host "" 

function chatgpt {
    codex @args
}

chatgpt

if (-not $CloseOnExit) {
    Write-Host ""
    Write-Host "Session ended. Press Enter to close." -ForegroundColor Black -BackgroundColor White
    Read-Host | Out-Null
}
