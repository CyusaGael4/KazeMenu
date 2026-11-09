# Generates the KazeMenu Open Graph share image (1200 x 630).
# Windows-only: uses System.Drawing, available in Windows PowerShell 5.1.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$iconPath = Join-Path $root 'public/icons/kazemenu-512.png'
$outputPath = Join-Path $root 'public/og-image.png'

$width = 1200
$height = 630
$cream = [System.Drawing.ColorTranslator]::FromHtml('#FFFDF9')
$orange = [System.Drawing.ColorTranslator]::FromHtml('#FF5232')
$deepOrange = [System.Drawing.ColorTranslator]::FromHtml('#D93B1E')
$ink = [System.Drawing.ColorTranslator]::FromHtml('#111111')
$muted = [System.Drawing.ColorTranslator]::FromHtml('#4A4641')
$line = [System.Drawing.ColorTranslator]::FromHtml('#E7DFD6')
$soft = [System.Drawing.ColorTranslator]::FromHtml('#F4EDE3')
$peach = [System.Drawing.ColorTranslator]::FromHtml('#FFE9E1')
$white = [System.Drawing.Color]::White

function New-RoundedPath([single]$x, [single]$y, [single]$w, [single]$h, [single]$r) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $r * 2
  $path.AddArc($x, $y, $d, $d, 180, 90)
  $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  return $path
}

function Fill-RoundedRect($g, $brush, [single]$x, [single]$y, [single]$w, [single]$h, [single]$r) {
  $path = New-RoundedPath $x $y $w $h $r
  $g.FillPath($brush, $path)
  $path.Dispose()
}

function Draw-RoundedRect($g, $pen, [single]$x, [single]$y, [single]$w, [single]$h, [single]$r) {
  $path = New-RoundedPath $x $y $w $h $r
  $g.DrawPath($pen, $path)
  $path.Dispose()
}

$bitmap = New-Object System.Drawing.Bitmap $width, $height
$g = [System.Drawing.Graphics]::FromImage($bitmap)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

$bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  (New-Object System.Drawing.Point 0, 0),
  (New-Object System.Drawing.Point $width, $height),
  $cream,
  [System.Drawing.ColorTranslator]::FromHtml('#FFF6EF')
)
$g.FillRectangle($bg, 0, 0, $width, $height)
$bg.Dispose()

# Soft editorial accent shapes on the right.
$peachBrush = New-Object System.Drawing.SolidBrush $peach
$g.FillEllipse($peachBrush, 800, -170, 610, 610)
$g.FillEllipse($peachBrush, 980, 330, 340, 340)
$peachBrush.Dispose()

$orangeBrush = New-Object System.Drawing.SolidBrush $orange
$g.FillEllipse($orangeBrush, 1060, 72, 22, 22)
$g.FillEllipse($orangeBrush, 1110, 118, 10, 10)

# Top rule and an orange block punctuation.
$linePen = New-Object System.Drawing.Pen $line, 1
$g.DrawLine($linePen, 72, 152, 720, 152)
$linePen.Dispose()
$g.FillRectangle($orangeBrush, 72, 146, 54, 8)

# App icon + wordmark.
$icon = [System.Drawing.Image]::FromFile($iconPath)
$iconClip = New-RoundedPath 72 58 70 70 16
$oldClip = $g.Clip
$g.SetClip($iconClip)
$g.DrawImage($icon, 72, 58, 70, 70)
$g.ResetClip()
$iconClip.Dispose()
$icon.Dispose()
$iconBorder = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(30, 17, 17, 17)), 1
Draw-RoundedRect $g $iconBorder 72 58 70 70 16
$iconBorder.Dispose()

$brandFont = New-Object System.Drawing.Font('Segoe UI', 34, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$inkBrush = New-Object System.Drawing.SolidBrush $ink
$g.DrawString('KazeMenu', $brandFont, $inkBrush, [single]158, [single]71)

# Headline.
$headlineFont = New-Object System.Drawing.Font('Segoe UI', 66, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$g.DrawString('Digital menus,', $headlineFont, $inkBrush, [single]70, [single]186)
$g.DrawString('table orders,', $headlineFont, $inkBrush, [single]70, [single]264)
$g.DrawString('one place.', $headlineFont, $orangeBrush, [single]70, [single]342)

# Supporting line.
$bodyFont = New-Object System.Drawing.Font('Segoe UI', 22, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$mutedBrush = New-Object System.Drawing.SolidBrush $muted
$g.DrawString('Guests order from their phone. Your team runs service', $bodyFont, $mutedBrush, [single]74, [single]432)
$g.DrawString('from one calm, live portal.', $bodyFont, $mutedBrush, [single]74, [single]466)

# Website lockup.
$g.FillRectangle($orangeBrush, 74, 558, 30, 3)
$urlFont = New-Object System.Drawing.Font('Segoe UI', 19, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$g.DrawString('kazemenu.app', $urlFont, $inkBrush, [single]120, [single]540)

# Live badge above the phone.
$badgeShadow = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(16, 17, 17, 17))
Fill-RoundedRect $g $badgeShadow 944 38 178 42 21
$badgeShadow.Dispose()
$whiteBrush = New-Object System.Drawing.SolidBrush $white
Fill-RoundedRect $g $whiteBrush 938 32 178 42 21
$badgeBorder = New-Object System.Drawing.Pen $line, 1
Draw-RoundedRect $g $badgeBorder 938 32 178 42 21
$badgeBorder.Dispose()
$greenBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#22A24E'))
$g.FillEllipse($greenBrush, 956, 48, 10, 10)
$greenBrush.Dispose()
$badgeFont = New-Object System.Drawing.Font('Segoe UI', 15, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$g.DrawString('Live orders', $badgeFont, $inkBrush, [single]974, [single]44)

# Phone shadow.
$shadow1 = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(14, 17, 17, 17))
Fill-RoundedRect $g $shadow1 812 118 280 480 48
$shadow1.Dispose()
$shadow2 = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(28, 17, 17, 17))
Fill-RoundedRect $g $shadow2 822 108 268 474 46
$shadow2.Dispose()

# Phone body and screen.
$phoneBrush = New-Object System.Drawing.SolidBrush $ink
Fill-RoundedRect $g $phoneBrush 830 96 252 470 38
$screenBrush = New-Object System.Drawing.SolidBrush $cream
Fill-RoundedRect $g $screenBrush 840 106 232 450 30

# Notch.
Fill-RoundedRect $g $phoneBrush 926 114 60 9 4

# Screen header.
$tableFont = New-Object System.Drawing.Font('Segoe UI', 18, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$tinyFont = New-Object System.Drawing.Font('Segoe UI', 11, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$g.DrawString('Kigali Grillz', $tableFont, $inkBrush, [single]858, [single]140)
$g.DrawString('TABLE 04', $tinyFont, $orangeBrush, [single]858, [single]166)

# Search field.
$softBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#F5EFE8'))
Fill-RoundedRect $g $softBrush 854 192 204 32 10
$g.FillEllipse($mutedBrush, 866, 202, 9, 9)
Fill-RoundedRect $g $mutedBrush 880 203 84 5 2

# Menu rows.
$rowYs = @(238, 316, 394)
$foodColors = @('#E7A35F', '#C96A45', '#D8B36A')
for ($i = 0; $i -lt 3; $i++) {
  $y = $rowYs[$i]
  $cardBorder = New-Object System.Drawing.Pen $line, 1
  Draw-RoundedRect $g $cardBorder 854 $y 204 66 10
  $cardBorder.Dispose()
  $foodBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml($foodColors[$i]))
  Fill-RoundedRect $g $foodBrush 862 ($y + 10) 46 46 9
  $foodBrush.Dispose()
  Fill-RoundedRect $g $inkBrush 918 ($y + 15) 76 7 3
  $mutedSoft = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#B9AEA2'))
  Fill-RoundedRect $g $mutedSoft 918 ($y + 29) 56 5 2
  Fill-RoundedRect $g $orangeBrush 918 ($y + 43) 38 6 3
  $mutedSoft.Dispose()
  $g.FillEllipse($orangeBrush, 1024, ($y + 20), 24, 24)
  $plusPen = New-Object System.Drawing.Pen $white, 2
  $g.DrawLine($plusPen, 1036, ($y + 26), 1036, ($y + 38))
  $g.DrawLine($plusPen, 1030, ($y + 32), 1042, ($y + 32))
  $plusPen.Dispose()
}

# Orange mobile order bar.
Fill-RoundedRect $g $orangeBrush 854 484 204 42 12
$barFont = New-Object System.Drawing.Font('Segoe UI', 14, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$g.DrawString('View order', $barFont, $whiteBrush, [single]868, [single]495)
$g.DrawString('11,000 RWF', $tinyFont, $whiteBrush, [single]972, [single]499)

# QR table card overlapping the phone.
$qrShadow = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(22, 17, 17, 17))
Fill-RoundedRect $g $qrShadow 1042 434 144 168 16
$qrShadow.Dispose()
$whiteBrush3 = New-Object System.Drawing.SolidBrush $white
Fill-RoundedRect $g $whiteBrush3 1036 426 144 168 16
$qrBorder = New-Object System.Drawing.Pen $line, 1
Draw-RoundedRect $g $qrBorder 1036 426 144 168 16
$qrBorder.Dispose()

# Pseudo QR code.
$qrX = 1058
$qrY = 442
$cell = 4.2
$rnd = New-Object System.Random 17
for ($row = 0; $row -lt 21; $row++) {
  for ($col = 0; $col -lt 21; $col++) {
    $inFinder = (($row -lt 7 -and $col -lt 7) -or ($row -lt 7 -and $col -gt 13) -or ($row -gt 13 -and $col -lt 7))
    if ($inFinder) { continue }
    if ($rnd.NextDouble() -gt 0.52) {
      $g.FillRectangle($inkBrush, [single]($qrX + ($col * $cell)), [single]($qrY + ($row * $cell)), [single]$cell, [single]$cell)
    }
  }
}
foreach ($corner in @(@(0, 0), @(14, 0), @(0, 14))) {
  $cx = $qrX + ($corner[1] * $cell)
  $cy = $qrY + ($corner[0] * $cell)
  $g.FillRectangle($inkBrush, [single]$cx, [single]$cy, [single](7 * $cell), [single](7 * $cell))
  $g.FillRectangle($whiteBrush3, [single]($cx + $cell), [single]($cy + $cell), [single](5 * $cell), [single](5 * $cell))
  $g.FillRectangle($inkBrush, [single]($cx + (2 * $cell)), [single]($cy + (2 * $cell)), [single](3 * $cell), [single](3 * $cell))
}
$qrCaptionFont = New-Object System.Drawing.Font('Segoe UI', 11, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$qrCaptionSize = $g.MeasureString('SCAN TO ORDER', $qrCaptionFont)
$g.DrawString('SCAN TO ORDER', $qrCaptionFont, $mutedBrush, [single](1036 + ((144 - $qrCaptionSize.Width) / 2)), [single]566)

# Bottom edge punctuation.
$g.FillRectangle($orangeBrush, 0, $height - 10, $width, 10)

$g.Dispose()
$bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bitmap.Dispose()

Write-Output "Saved $outputPath"
