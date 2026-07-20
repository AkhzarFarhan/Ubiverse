package com.ubiverse.core.database.sync

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query

@Dao
interface SyncedIdsDao {
    @Query("SELECT syncId FROM synced_ids ORDER BY timestamp DESC LIMIT 500")
    suspend fun getRecentSyncIds(): List<String>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(syncedId: SyncedId)
}
