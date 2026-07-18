package com.ubiverse.core.database

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.ubiverse.core.model.daily.DailyEntry
import kotlinx.coroutines.flow.Flow

@Dao
interface DailyDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(entries: List<DailyEntry>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(entry: DailyEntry)

    @Query("SELECT * FROM daily_entry ORDER BY timestamp DESC")
    fun getAll(): Flow<List<DailyEntry>>

    @Query("DELETE FROM daily_entry")
    suspend fun clear()
}
