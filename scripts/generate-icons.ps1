Add-Type -AssemblyName System.Drawing

$iconsDir = Join-Path $PSScriptRoot "..\public\icons"

foreach ($size in @(192, 512)) {
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = "AntiAlias"
    $g.Clear([System.Drawing.Color]::White)

    $red = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(229, 57, 53))
    $green = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(67, 160, 71))
    $scale = $size / 512.0

    $g.FillEllipse($red, [int](126 * $scale), [int](145 * $scale), [int](260 * $scale), [int](290 * $scale))
    $g.FillRectangle($green, [int](248 * $scale), [int](115 * $scale), [int](16 * $scale), [int](30 * $scale))

    $outPath = Join-Path $iconsDir "icon-$size.png"
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Created $outPath"
}
