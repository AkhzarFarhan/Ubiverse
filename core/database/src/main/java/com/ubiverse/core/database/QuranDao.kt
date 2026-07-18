package com.ubiverse.core.database

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.ubiverse.core.model.quran.QuranProgress
import kotlinx.coroutines.flow.Flow

@Dao
interface QuranDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(progress: QuranProgress)

    @Query("SELECT * FROM quran_progress WHERE username = :username AND surahIndex = :surahIndex")
    fun getProgress(username: String, surahIndex: Int): Flow<QuranProgress?>

    @Query("SELECT * FROM quran_progress WHERE username = :username")
    fun getAllProgress(username: String): Flow<List<QuranProgress>>

    @Query("DELETE FROM quran_progress WHERE username = :username")
    suspend fun clear(username: String)
}
