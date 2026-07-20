package com.ubiverse.core.common

import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.withStyle
import kotlinx.datetime.Clock
import kotlinx.datetime.LocalDateTime
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toJavaLocalDateTime
import kotlinx.datetime.toLocalDateTime
import java.time.format.DateTimeFormatter
import kotlinx.serialization.json.Json
import java.text.NumberFormat
import java.util.Locale
import java.util.concurrent.TimeUnit

object Formatters {

    // Indian Rupee formatting: ₹1,23,456.78 (3-2-2 grouping)
    private val INR_FORMAT = NumberFormat.getCurrencyInstance(Locale("en", "IN")).apply {
        minimumFractionDigits = 2
        maximumFractionDigits = 2
    }

    fun getINR(amount: Double): String {
        return INR_FORMAT.format(amount)
    }

    fun getINR(amount: Long): String = getINR(amount.toDouble())

    // Kolkata/IST timestamp: "DD-MM-YYYY HH:MM:SS AM/PM"
    private val KOLKATA_ZONE = TimeZone.of("Asia/Kolkata")
    private val KOLKATA_FORMATTER = DateTimeFormatter.ofPattern("dd-MM-yyyy hh:mm:ss a")

    fun getKolkataTimestamp(): String {
        val now = Clock.System.now().toLocalDateTime(KOLKATA_ZONE)
        return now.toJavaLocalDateTime().format(KOLKATA_FORMATTER)
    }

    // Kolkata date: "YYYY-MM-DD"
    private val KOLKATA_DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd")

    fun getKolkataDate(): String {
        val now = Clock.System.now().toLocalDateTime(KOLKATA_ZONE)
        return now.toJavaLocalDateTime().format(KOLKATA_DATE_FORMATTER)
    }

    // Format "YYYY-MM-DD" to "DD MMM YYYY"
    private val DISPLAY_DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy", Locale("en", "IN"))

    fun formatDate(dateStr: String): String {
        try {
            val date = java.time.LocalDateTime.parse(dateStr + "T00:00:00", DateTimeFormatter.ISO_LOCAL_DATE_TIME)
            return date.format(DISPLAY_DATE_FORMATTER)
        } catch (e: Exception) {
            return dateStr
        }
    }

    // Safe division
    fun DIV(x: Double, y: Double): Double {
        return if (y == 0.0) 0.0 else x / y
    }

    // Sanitize username
    fun sanitizeUsername(username: String): Boolean {
        return username.matches(Regex("^[a-zA-Z0-9]+$"))
    }

    // Format duration in milliseconds to human readable
    fun formatDuration(ms: Long): String {
        if (ms <= 0) return "0s"
        val totalSec = ms / 1000
        if (totalSec < 60) return "${totalSec}s"
        val mins = totalSec / 60
        val secs = totalSec % 60
        if (mins < 60) return "${mins}m ${secs}s"
        val hours = mins / 60
        val remMins = mins % 60
        return "${hours}h ${remMins}m"
    }

    fun formatDurationLong(ms: Long): String {
        if (ms <= 0) return "0 seconds"
        val totalSec = ms / 1000
        if (totalSec < 60) return "${totalSec} second${if (totalSec != 1L) "s" else ""}"
        val mins = totalSec / 60
        if (mins < 60) {
            val secs = totalSec % 60
            return "${mins} min${if (mins != 1L) "s" else ""}${if (secs > 0) " $secs s" else ""}"
        }
        val hours = mins / 60
        val remMins = mins % 60
        return "${hours} hr${if (hours != 1L) "s" else ""}${if (remMins > 0) " $remMins min" else ""}"
    }

    // Time ago from epoch milliseconds
    fun timeAgo(epochMs: Long): String {
        val diff = System.currentTimeMillis() - epochMs
        if (diff < 0) return "Just now"
        val secs = diff / 1000
        if (secs < 60) return "${secs}s ago"
        val mins = secs / 60
        if (mins < 60) return "${mins}m ago"
        val hours = mins / 60
        if (hours < 24) return "${hours}h ${mins % 60}m ago"
        val days = hours / 24
        return "${days}d ago"
    }

    // Format time from epoch
    private val TIME_FORMATTER = DateTimeFormatter.ofPattern("hh:mm a", Locale("en", "IN"))

    fun formatTime(epochMs: Long): String {
        val dt = kotlinx.datetime.Instant.fromEpochMilliseconds(epochMs).toLocalDateTime(KOLKATA_ZONE)
        return dt.toJavaLocalDateTime().format(TIME_FORMATTER)
    }

    // Format date time from epoch
    private val DATETIME_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a", Locale("en", "IN"))

    fun formatDateTime(epochMs: Long): String {
        val dt = kotlinx.datetime.Instant.fromEpochMilliseconds(epochMs).toLocalDateTime(KOLKATA_ZONE)
        return dt.toJavaLocalDateTime().format(DATETIME_FORMATTER)
    }

    // Extract domain from URL
    fun extractDomain(url: String): String {
        var cleaned = url.replace(Regex("^https?://"), "").replace(Regex("^www\\."), "")
        val slashIdx = cleaned.indexOf('/')
        if (slashIdx > 0) cleaned = cleaned.substring(0, slashIdx)
        return cleaned
    }

    // JSON helpers
    private val json = Json { ignoreUnknownKeys = true }

    fun <T> fromJson(type: kotlinx.serialization.KSerializer<T>, jsonStr: String): T? {
        return try {
            json.decodeFromString(type, jsonStr)
        } catch (e: Exception) {
            null
        }
    }

    fun <T> toJson(type: kotlinx.serialization.KSerializer<T>, obj: T): String {
        return json.encodeToString(type, obj)
    }
}
