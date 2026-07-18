package com.ubiverse.core.model.care

import kotlinx.serialization.Serializable
import java.io.Serializable

@Serializable
data class CareDevice(
    val deviceName: String,
    val lastSeenAt: Long,
    val model: String,
    val androidVersion: String,
    val batteryLevel: Int,
    val isCharging: Boolean
) : Serializable

@Serializable
data class CarePermission(
    val camera: Boolean,
    val microphone: Boolean,
    val location: Boolean,
    val contacts: Boolean,
    val sms: Boolean,
    val phone: Boolean,
    val storage: Boolean
) : Serializable

@Serializable
data class CareAppUsage(
    val packageName: String,
    val startTime: Long,
    val endTime: Long,
    val duration: Long
) : Serializable

@Serializable
data class CareWebHistory(
    val url: String,
    val title: String,
    val timestamp: Long,
    val duration: Long
) : Serializable

@Serializable
data class CareLocation(
    val latitude: Double,
    val longitude: Double,
    val accuracy: Float,
    val timestamp: Long
) : Serializable

@Serializable
data class CareAggregatedAppUsage(
    val packageName: String,
    val appName: String,
    val icon: String,
    val totalTime: Long,
    val sessionCount: Int,
    val lastUsed: Long,
    val sessions: List<CareAppUsage>
) : Serializable

@Serializable
data class CareAggregatedWebHistory(
    val domain: String,
    val visitCount: Int,
    val totalTime: Long,
    val visits: List<CareWebHistory>
) : Serializable
