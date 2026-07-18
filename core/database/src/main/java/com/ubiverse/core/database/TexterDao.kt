package com.ubiverse.core.database

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.ubiverse.core.model.texter.TexterEntry
import kotlinx.coroutines.flow.Flow

@Dao
interface TexterDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(entries: List<TexterEntry>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(entry: TexterEntry)

    @Query("SELECT * FROM texter_entry ORDER BY timestamp DESC")
    fun getAll(): Flow<List<TexterEntry>>

    @Query("DELETE FROM texter_entry")
    suspend fun clear()
}
