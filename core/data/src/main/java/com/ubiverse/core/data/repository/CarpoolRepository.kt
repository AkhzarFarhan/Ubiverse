package com.ubiverse.core.data.repository

import com.ubiverse.core.database.AppDatabase
import com.ubiverse.core.model.carpool.CarpoolRide
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CarpoolRepository @Inject constructor(
    private val database: AppDatabase
)  {

    suspend fun addRide(ride: CarpoolRide) {
        database.carpoolDao().insert(ride)
    }

    fun getRides(): Flow<List<CarpoolRide>> {
        return database.carpoolDao().getAll()
    }

    suspend fun deleteRide(createdAt: Long) {
        database.carpoolDao().deleteById(createdAt)
    }

    suspend fun purgeOldRides() {
        // TODO: Implement cutoff logic
    }

    suspend fun sync() {
        // TODO: Implement Firebase sync
    }
}
