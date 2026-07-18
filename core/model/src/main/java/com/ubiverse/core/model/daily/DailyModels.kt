package com.ubiverse.core.model.daily

import kotlinx.serialization.Serializable
import java.io.Serializable

@Serializable
data class DailyEntry(
    val message: String,
    val rating: Int, // 1-10
    val timestamp: String // "DD-MM-YYYY HH:MM:SS AM/PM"
) : Serializable
