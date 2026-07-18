package com.ubiverse.core.data.repository

import com.ubiverse.core.database.AppDatabase
import com.ubiverse.core.model.salah.SalahEntry
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SalahRepository @Inject constructor(
    private val database: AppDatabase
) : SalahRepository {

    override suspend fun addEntry(entry: SalahEntry) {
        database.salahDao().insert(entry)
    }

    override fun getEntries(): Flow<List<SalahEntry>> {
        return database.salahDao().getAll()
    }

    override suspend fun sync() {
        // TODO: Implement Firebase sync
    }
}
