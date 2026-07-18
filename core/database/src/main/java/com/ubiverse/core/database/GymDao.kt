package com.ubiverse.core.database

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.ubiverse.core.model.gym.GymEntry
import kotlinx.coroutines.flow.Flow

@Dao
interface GymDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(entries: List<GymEntry>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(entry: GymEntry)

    @Query("SELECT * FROM gym_entry ORDER BY timestamp DESC")
    fun getAll(): Flow<List<GymEntry>>

    @Query("DELETE FROM gym_entry")
    suspend fun clear()
}
