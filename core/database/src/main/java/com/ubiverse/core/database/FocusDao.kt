package com.ubiverse.core.database

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.ubiverse.core.model.focus.FocusProgress
import kotlinx.coroutines.flow.Flow

@Dao
interface FocusDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(progress: FocusProgress)

    @Query("SELECT * FROM focus_progress WHERE username = :username")
    fun getProgress(username: String): Flow<FocusProgress?>

    @Query("DELETE FROM focus_progress WHERE username = :username")
    suspend fun clear(username: String)
}
