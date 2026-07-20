package com.ubiverse.core.designsystem.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.Typography
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

// Colors matching the web app's CSS custom properties
private val LightColorScheme = lightColorScheme(
    primary = Color(0xFF10B981),      // --color-primary: #10b981
    primaryContainer = Color(0xFF6EE7B7), // --color-primary-light: #6ee7b7
    secondary = Color(0xFF64748B),    // --color-secondary: #64748b
    error = Color(0xFFEF4444),        // --color-danger: #ef4444
    errorContainer = Color(0xFFFECACA),
    surface = Color(0xFFFFFFFF),      // --surface: #ffffff
    surfaceVariant = Color(0xFFF1F5F9), // --surface-2: #f1f5f9
    outline = Color(0xFFE2E8F0),      // --border: #e2e8f0
    background = Color(0xFFF8FAFC),   // --bg: #f8fafc
    onPrimary = Color.White,
    onPrimaryContainer = Color(0xFF052E1B),
    onSecondary = Color.White,
    onSecondaryContainer = Color(0xFF1E2D28),
    onError = Color.White,
    onErrorContainer = Color(0xFF410002),
    onSurface = Color(0xFF1E293B),    // --text: #1e293b
    onSurfaceVariant = Color(0xFF64748B), // --text-muted: #64748b
    onBackground = Color(0xFF1E293B),
    inverseSurface = Color(0xFF31363F),
    inverseOnSurface = Color(0xFFF1F5F9),
    outlineVariant = Color(0xFFCBD5E1),
    scrim = Color.Black,
    surfaceTint = Color(0xFF10B981),
)

private val DarkColorScheme = darkColorScheme(
    primary = Color(0xFF6EE7B7),
    primaryContainer = Color(0xFF059669),
    secondary = Color(0xFF94A3B8),
    error = Color(0xFFF87171),
    errorContainer = Color(0xFF7F1D1D),
    surface = Color(0xFF1E293B),
    surfaceVariant = Color(0xFF334155),
    outline = Color(0xFF475569),
    background = Color(0xFF0F172A),
    onPrimary = Color(0xFF052E1B),
    onPrimaryContainer = Color(0xFF6EE7B7),
    onSecondary = Color(0xFF1E2D28),
    onSecondaryContainer = Color(0xFF94A3B8),
    onError = Color(0xFF410002),
    onErrorContainer = Color(0xFFFECACA),
    onSurface = Color(0xFFF1F5F9),
    onSurfaceVariant = Color(0xFF94A3B8),
    onBackground = Color(0xFFF1F5F9),
    inverseSurface = Color(0xFFF1F5F9),
    inverseOnSurface = Color(0xFF1E293B),
    outlineVariant = Color(0xFF475569),
    scrim = Color.Black,
    surfaceTint = Color(0xFF6EE7B7),
)

@Composable
fun Theme(
    darkTheme: Boolean = false, // Force light theme for now to match web app
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
    MaterialTheme(
        colorScheme = colorScheme,
        typography = AppTypography,
        shapes = AppShapes,
        content = content
    )
}

// Typography matching web app's --font: 'Segoe UI', system-ui, -apple-system, sans-serif
val AppTypography = Typography(
    displayLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Bold,
        fontSize = 32.sp,
        lineHeight = 40.sp,
        letterSpacing = 0.5.sp
    ),
    displayMedium = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Bold,
        fontSize = 28.sp,
        lineHeight = 36.sp,
        letterSpacing = 0.25.sp
    ),
    displaySmall = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Bold,
        fontSize = 24.sp,
        lineHeight = 32.sp
    ),
    headlineLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Bold,
        fontSize = 22.sp,
        lineHeight = 28.sp,
        letterSpacing = 0.5.sp
    ),
    headlineMedium = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Bold,
        fontSize = 20.sp,
        lineHeight = 28.sp
    ),
    headlineSmall = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Bold,
        fontSize = 18.sp,
        lineHeight = 24.sp
    ),
    titleLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Bold,
        fontSize = 16.sp,
        lineHeight = 24.sp,
        letterSpacing = 0.15.sp
    ),
    titleMedium = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Medium,
        fontSize = 14.sp,
        lineHeight = 20.sp,
        letterSpacing = 0.1.sp
    ),
    titleSmall = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Medium,
        fontSize = 12.sp,
        lineHeight = 16.sp,
        letterSpacing = 0.5.sp
    ),
    bodyLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 16.sp,
        lineHeight = 24.sp,
        letterSpacing = 0.15.sp
    ),
    bodyMedium = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 14.sp,
        lineHeight = 20.sp,
        letterSpacing = 0.25.sp
    ),
    bodySmall = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 12.sp,
        lineHeight = 16.sp,
        letterSpacing = 0.4.sp
    ),
    labelLarge = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Medium,
        fontSize = 14.sp,
        lineHeight = 20.sp,
        letterSpacing = 0.1.sp
    ),
    labelMedium = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Medium,
        fontSize = 12.sp,
        lineHeight = 16.sp,
        letterSpacing = 0.5.sp
    ),
    labelSmall = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Medium,
        fontSize = 10.sp,
        lineHeight = 16.sp,
        letterSpacing = 0.5.sp
    )
)

// Shapes matching web app's --radius: 10px, --radius-sm: 6px, --radius-lg: 16px
val AppShapes = Shapes(
    extraSmall = RoundedCornerShape(4.dp),
    small = RoundedCornerShape(6.dp),    // --radius-sm
    medium = RoundedCornerShape(10.dp),  // --radius
    large = RoundedCornerShape(16.dp),   // --radius-lg
    extraLarge = RoundedCornerShape(28.dp)
)
