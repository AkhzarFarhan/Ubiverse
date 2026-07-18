package com.ubiverse.core.data.repository

import com.ubiverse.core.database.AppDatabase
import com.ubiverse.core.model.gym.GymEntry
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class GymRepository @Inject constructor(
    private val database: AppDatabase
) : GymRepository {

    override suspend fun addEntry(entry: GymEntry) {
        database.gymDao().insert(entry)
    }

    override fun getEntries(): Flow<List<GymEntry>> {
        return database.gymDao().getAll()
    }

    override suspend fun sync() {
        // TODO: Implement Firebase sync
    }
}
