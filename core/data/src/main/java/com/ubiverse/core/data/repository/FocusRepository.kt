package com.ubiverse.core.data.repository

import com.ubiverse.core.database.AppDatabase
import com.ubiverse.core.model.focus.FocusProgress
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class FocusRepository @Inject constructor(
    private val database: AppDatabase
)  {

    suspend fun saveProgress(progress: FocusProgress) {
        database.focusDao().insert(progress)
    }

    fun getProgress(): Flow<FocusProgress> {
        return database.focusDao().getProgress("default")
            .map { it ?: FocusProgress("default") }
    }

    suspend fun sync() {
        // TODO: Implement Firebase sync
    }
}
