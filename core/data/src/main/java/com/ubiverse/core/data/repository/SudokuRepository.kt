package com.ubiverse.core.data.repository

import com.ubiverse.core.database.AppDatabase
import com.ubiverse.core.model.sudoku.SudokuState
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SudokuRepository @Inject constructor(
    private val database: AppDatabase
)  {

    suspend fun saveState(state: SudokuState) {
        database.sudokuDao().insert(state)
    }

    fun getState(): Flow<SudokuState?> {
        return database.sudokuDao().getState("default")
    }

    suspend fun sync() {
        // TODO: Implement Firebase sync
    }
}
