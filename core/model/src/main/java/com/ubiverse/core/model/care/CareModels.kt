package com.ubiverse.core.model.care

import androidx.room.Entity
import androidx.room.PrimaryKey
import kotlinx.serialization.Serializable

@Serializable
@Entity(tableName = "care_device")
data class CareDevice(
    @PrimaryKey val username: String = "",
    val deviceName: String,
    val lastSeenAt: Long,
    val model: String,
    val androidVersion: String,
    val batteryLevel: Int,
    val isCharging: Boolean
) : java.io.Serializable

@Serializable
data class CarePermission(
    val camera: Boolean,
    val microphone: Boolean,
    val location: Boolean,
    val contacts: Boolean,
    val sms: Boolean,
    val phone: Boolean,
    val storage: Boolean
) : java.io.Serializable

@Serializable
data class CareAppUsage(
    val packageName: String,
    val startTime: Long,
    val endTime: Long,
    val duration: Long
) : java.io.Serializable

@Serializable
data class CareWebHistory(
    val url: String,
    val title: String,
    val timestamp: Long,
    val duration: Long
) : java.io.Serializable

@Serializable
@Entity(
    tableName = "care_location",
    primaryKeys = ["username", "timestamp"]
)
data class CareLocation(
    val username: String = "",
    val latitude: Double,
    val longitude: Double,
    val accuracy: Float,
    val timestamp: Long
) : java.io.Serializable

@Serializable
@Entity(
    tableName = "care_aggregated_app_usage",
    primaryKeys = ["username", "packageName"]
)
data class CareAggregatedAppUsage(
    val username: String = "",
    val packageName: String,
    val appName: String,
    val icon: String,
    val totalTime: Long,
    val sessionCount: Int,
    val lastUsed: Long,
    val sessions: List<CareAppUsage>
) : java.io.Serializable

@Serializable
@Entity(
    tableName = "care_aggregated_web_history",
    primaryKeys = ["username", "domain"]
)
data class CareAggregatedWebHistory(
    val username: String = "",
    val domain: String,
    val visitCount: Int,
    val totalTime: Long,
    val visits: List<CareWebHistory>
) : java.io.Serializable

@Serializable
enum class CareFilter {
    Today, Yesterday, Week, Month
}
