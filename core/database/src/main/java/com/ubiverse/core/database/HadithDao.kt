package com.ubiverse.core.database

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.ubiverse.core.model.hadith.HadithBook
import kotlinx.coroutines.flow.Flow

@Dao
interface HadithDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(books: List<HadithBook>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(book: HadithBook)

    @Query("SELECT * FROM hadith_book ORDER BY id ASC")
    fun getAll(): Flow<List<HadithBook>>

    @Query("DELETE FROM hadith_book")
    suspend fun clear()
}
