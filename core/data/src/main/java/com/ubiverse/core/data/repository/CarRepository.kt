package com.ubiverse.core.data.repository

import com.ubiverse.core.database.AppDatabase
import com.ubiverse.core.model.car.CarEntry
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CarRepository @Inject constructor(
    private val database: AppDatabase
) : CarRepository {

    override suspend fun addEntry(entry: CarEntry) {
        database.carDao().insert(entry)
    }

    override fun getEntries(): Flow<List<CarEntry>> {
        return database.carDao().getAll()
    }

    override suspend fun sync() {
        // TODO: Implement Firebase sync
    }
}
