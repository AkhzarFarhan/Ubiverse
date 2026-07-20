package com.ubiverse.core.model.daily

import androidx.room.Entity
import androidx.room.PrimaryKey
import kotlinx.serialization.Serializable

@Serializable
@Entity(tableName = "daily_entry")
data class DailyEntry(
    val message: String,
    val rating: Int, // 1-10
    @PrimaryKey val timestamp: String // "DD-MM-YYYY HH:MM:SS AM/PM"
) : java.io.Serializable
