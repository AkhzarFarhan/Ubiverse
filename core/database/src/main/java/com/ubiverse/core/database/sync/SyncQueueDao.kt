package com.ubiverse.core.database.sync

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface SyncQueueDao {
    @Query("SELECT * FROM sync_queue ORDER BY id ASC")
    fun getAll(): Flow<List<SyncOperation>>

    @Insert
    suspend fun insert(operation: SyncOperation)

    @Query("DELETE FROM sync_queue WHERE id = :id")
    suspend fun deleteById(id: Long)

    @Query("UPDATE sync_queue SET retryCount = retryCount + 1, lastAttempt = :timestamp WHERE id = :id")
    suspend fun incrementRetryCount(id: Long, timestamp: Long)
}
