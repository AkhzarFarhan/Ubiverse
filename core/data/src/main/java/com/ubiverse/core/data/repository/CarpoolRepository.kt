package com.ubiverse.core.data.repository

import com.ubiverse.core.database.AppDatabase
import com.ubiverse.core.model.carpool.CarpoolRide
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CarpoolRepository @Inject constructor(
    private val database: AppDatabase
) : CarpoolRepository {

    override suspend fun addRide(ride: CarpoolRide) {
        database.carpoolDao().insert(ride)
    }

    override fun getRides(): Flow<List<CarpoolRide>> {
        return database.carpoolDao().getAll()
    }

    override suspend fun deleteRide(rideId: String) {
        database.carpoolDao().deleteById(rideId)
    }

    override suspend fun purgeOldRides() {
        // TODO: Implement cutoff logic
    }

    override suspend fun sync() {
        // TODO: Implement Firebase sync
    }
}
