Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$assets = Join-Path $root "ios\App\App\Assets.xcassets"
$iconPath = Join-Path $assets "AppIcon.appiconset\AppIcon-512@2x.png"
$splashPaths = @(
    (Join-Path $assets "Splash.imageset\splash-2732x2732.png"),
    (Join-Path $assets "Splash.imageset\splash-2732x2732-1.png"),
    (Join-Path $assets "Splash.imageset\splash-2732x2732-2.png")
)

function New-GalleryMark {
    param(
        [System.Drawing.Graphics]$Graphics,
        [float]$CenterX,
        [float]$CenterY,
        [float]$Size
    )

    $frameSize = $Size * 0.64
    $frameX = $CenterX - ($frameSize / 2)
    $frameY = $CenterY - ($frameSize / 2)
    $radius = $Size * 0.11

    $shadowBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(85, 0, 0, 0))
    $whiteBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(248, 248, 250))
    $blueBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(10, 132, 255))
    $cyanBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(87, 217, 255))
    $darkBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(24, 26, 33))

    $shadowRect = New-Object System.Drawing.RectangleF(
        ($frameX + ($Size * 0.035)),
        ($frameY + ($Size * 0.05)),
        $frameSize,
        $frameSize
    )
    $shadowPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $shadowPath.AddArc($shadowRect.X, $shadowRect.Y, $radius, $radius, 180, 90)
    $shadowPath.AddArc($shadowRect.Right - $radius, $shadowRect.Y, $radius, $radius, 270, 90)
    $shadowPath.AddArc($shadowRect.Right - $radius, $shadowRect.Bottom - $radius, $radius, $radius, 0, 90)
    $shadowPath.AddArc($shadowRect.X, $shadowRect.Bottom - $radius, $radius, $radius, 90, 90)
    $shadowPath.CloseFigure()
    $Graphics.FillPath($shadowBrush, $shadowPath)

    $frameRect = New-Object System.Drawing.RectangleF($frameX, $frameY, $frameSize, $frameSize)
    $framePath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $framePath.AddArc($frameRect.X, $frameRect.Y, $radius, $radius, 180, 90)
    $framePath.AddArc($frameRect.Right - $radius, $frameRect.Y, $radius, $radius, 270, 90)
    $framePath.AddArc($frameRect.Right - $radius, $frameRect.Bottom - $radius, $radius, $radius, 0, 90)
    $framePath.AddArc($frameRect.X, $frameRect.Bottom - $radius, $radius, $radius, 90, 90)
    $framePath.CloseFigure()
    $Graphics.FillPath($whiteBrush, $framePath)

    $innerInset = $Size * 0.055
    $innerRect = New-Object System.Drawing.RectangleF(
        ($frameRect.X + $innerInset),
        ($frameRect.Y + $innerInset),
        ($frameRect.Width - (2 * $innerInset)),
        ($frameRect.Height - (2 * $innerInset))
    )
    $Graphics.FillRectangle($darkBrush, $innerRect)

    $sunSize = $Size * 0.13
    $Graphics.FillEllipse(
        $cyanBrush,
        ($innerRect.Right - $sunSize - ($Size * 0.06)),
        ($innerRect.Top + ($Size * 0.06)),
        $sunSize,
        $sunSize
    )

    $mountains = New-Object System.Drawing.Drawing2D.GraphicsPath
    $mountains.AddPolygon(@(
        (New-Object System.Drawing.PointF(($innerRect.Left + ($Size * 0.025)), ($innerRect.Bottom - ($Size * 0.04)))),
        (New-Object System.Drawing.PointF(($innerRect.Left + ($Size * 0.22)), ($innerRect.Top + ($Size * 0.22)))),
        (New-Object System.Drawing.PointF(($innerRect.Left + ($Size * 0.34)), ($innerRect.Top + ($Size * 0.36)))),
        (New-Object System.Drawing.PointF(($innerRect.Left + ($Size * 0.45)), ($innerRect.Top + ($Size * 0.27)))),
        (New-Object System.Drawing.PointF(($innerRect.Right - ($Size * 0.025)), ($innerRect.Bottom - ($Size * 0.04))))
    ))
    $Graphics.FillPath($blueBrush, $mountains)

    $shadowBrush.Dispose()
    $whiteBrush.Dispose()
    $blueBrush.Dispose()
    $cyanBrush.Dispose()
    $darkBrush.Dispose()
    $shadowPath.Dispose()
    $framePath.Dispose()
    $mountains.Dispose()
}

function Save-AppIcon {
    $bitmap = New-Object System.Drawing.Bitmap 1024, 1024
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    $background = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        (New-Object System.Drawing.Rectangle 0, 0, 1024, 1024),
        ([System.Drawing.Color]::FromArgb(8, 9, 13)),
        ([System.Drawing.Color]::FromArgb(27, 29, 38)),
        45
    )
    $graphics.FillRectangle($background, 0, 0, 1024, 1024)
    New-GalleryMark -Graphics $graphics -CenterX 512 -CenterY 500 -Size 650

    $bitmap.Save($iconPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $background.Dispose()
    $graphics.Dispose()
    $bitmap.Dispose()
}

function Save-Splash {
    param([string]$Path)

    $bitmap = New-Object System.Drawing.Bitmap 2732, 2732
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.Clear([System.Drawing.Color]::FromArgb(9, 10, 13))
    New-GalleryMark -Graphics $graphics -CenterX 1366 -CenterY 1290 -Size 620

    $font = New-Object System.Drawing.Font("Arial", 92, [System.Drawing.FontStyle]::Bold)
    $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(245, 245, 247))
    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $graphics.DrawString("Gallery", $font, $brush, (New-Object System.Drawing.PointF 1366, 1660), $format)

    $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $format.Dispose()
    $brush.Dispose()
    $font.Dispose()
    $graphics.Dispose()
    $bitmap.Dispose()
}

Save-AppIcon
$splashPaths | ForEach-Object { Save-Splash -Path $_ }
Write-Output "Generated iOS icon and splash assets."
