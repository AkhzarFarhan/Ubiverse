package com.ubiverse.core.model.texter

import androidx.room.Entity
import androidx.room.PrimaryKey
import kotlinx.serialization.Serializable

@Serializable
@Entity(tableName = "texter_entry")
data class TexterEntry(
    val note: String,
    @PrimaryKey val timestamp: String, // "DD-MM-YYYY HH:MM:SS AM/PM"
    val sharedBy: String? = null
) : java.io.Serializable
