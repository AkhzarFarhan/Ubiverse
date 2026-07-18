package com.ubiverse.core.database

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.ubiverse.core.model.salah.SalahEntry
import kotlinx.coroutines.flow.Flow

@Dao
interface SalahDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(entries: List<SalahEntry>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(entry: SalahEntry)

    @Query("SELECT * FROM salah_entry ORDER BY date DESC")
    fun getAll(): Flow<List<SalahEntry>>

    @Query("DELETE FROM salah_entry")
    suspend fun clear()
}
