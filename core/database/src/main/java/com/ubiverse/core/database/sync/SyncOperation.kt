package com.ubiverse.core.database.sync

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "sync_queue")
data class SyncOperation(
    @PrimaryKey(autoGenerate = true) val id: Long? = null,
    val syncId: String,
    val operation: SyncOperationType,
    val endpoint: String,
    val payload: String,
    val retryCount: Int = 0,
    val lastAttempt: Long = 0
)
