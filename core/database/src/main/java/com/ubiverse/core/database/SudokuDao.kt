package com.ubiverse.core.database

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.ubiverse.core.model.sudoku.SudokuState
import kotlinx.coroutines.flow.Flow

@Dao
interface SudokuDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(state: SudokuState)

    @Query("SELECT * FROM sudoku_state WHERE username = :username")
    fun getState(username: String): Flow<SudokuState?>

    @Query("DELETE FROM sudoku_state WHERE username = :username")
    suspend fun clear(username: String)
}
