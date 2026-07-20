package com.ubiverse.core.model.gym

import androidx.room.Entity
import androidx.room.PrimaryKey
import kotlinx.serialization.Serializable

@Serializable
@Entity(tableName = "gym_entry")
data class GymEntry(
    val message: String, // comma-separated muscle groups
    @PrimaryKey val timestamp: String // "DD-MM-YYYY HH:MM:SS AM/PM"
) : java.io.Serializable
