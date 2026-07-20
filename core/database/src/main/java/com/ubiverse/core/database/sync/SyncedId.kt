package com.ubiverse.core.database.sync

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "synced_ids")
data class SyncedId(
    @PrimaryKey val syncId: String,
    val timestamp: Long = System.currentTimeMillis()
)
