package com.ubiverse.core.data.repository

import com.ubiverse.core.database.AppDatabase
import com.ubiverse.core.model.quran.QuranProgress
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class QuranRepository @Inject constructor(
    private val database: AppDatabase
) : QuranRepository {

    override suspend fun saveProgress(progress: QuranProgress) {
        database.quranDao().insert(progress)
    }

    override fun getProgress(): Flow<QuranProgress> {
        return database.quranDao().getAllProgress("default")
            .map { it.firstOrNull() ?: QuranProgress() }
    }

    override suspend fun sync() {
        // TODO: Implement Firebase sync
    }
}
