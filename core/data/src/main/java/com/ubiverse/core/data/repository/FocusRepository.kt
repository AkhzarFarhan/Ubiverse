package com.ubiverse.core.data.repository

import com.ubiverse.core.database.AppDatabase
import com.ubiverse.core.model.focus.FocusProgress
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class FocusRepository @Inject constructor(
    private val database: AppDatabase
) : FocusRepository {

    override suspend fun saveProgress(progress: FocusProgress) {
        database.focusDao().insert(progress)
    }

    override fun getProgress(): Flow<FocusProgress> {
        return database.focusDao().getProgress("default")
    }

    override suspend fun sync() {
        // TODO: Implement Firebase sync
    }
}
