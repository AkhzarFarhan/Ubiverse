package com.ubiverse.core.data.repository

import com.ubiverse.core.database.AppDatabase
import com.ubiverse.core.model.quran.QuranProgress
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class QuranRepository @Inject constructor(
    private val database: AppDatabase
)  {

    suspend fun saveProgress(progress: QuranProgress) {
        database.quranDao().insert(progress)
    }

    fun getProgress(): Flow<QuranProgress> {
        return database.quranDao().getAllProgress("default")
            .map { it.firstOrNull() ?: QuranProgress() }
    }

    suspend fun sync() {
        // TODO: Implement Firebase sync
    }
}
