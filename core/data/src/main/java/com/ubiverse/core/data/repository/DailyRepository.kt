package com.ubiverse.core.data.repository

import com.ubiverse.core.data.repository.DailyRepository
import com.ubiverse.core.database.AppDatabase
import com.ubiverse.core.model.daily.DailyEntry
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DailyRepository @Inject constructor(
    private val database: AppDatabase
)  {

    suspend fun addEntry(entry: DailyEntry) {
        database.dailyDao().insert(entry)
    }

    fun getEntries(): Flow<List<DailyEntry>> {
        return database.dailyDao().getAll()
    }

    suspend fun sync() {
        // TODO: Implement Firebase sync
    }
}
