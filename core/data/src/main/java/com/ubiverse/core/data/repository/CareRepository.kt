package com.ubiverse.core.data.repository

import com.ubiverse.core.database.AppDatabase
import com.ubiverse.core.model.care.CareDevice
import com.ubiverse.core.model.care.CareAggregatedAppUsage
import com.ubiverse.core.model.care.CareAggregatedWebHistory
import com.ubiverse.core.model.care.CareLocation
import com.ubiverse.core.model.care.CareFilter
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CareRepository @Inject constructor(
    private val database: AppDatabase
) : CareRepository {

    override suspend fun saveDeviceId(deviceId: String) {
        // TODO: Save to DataStore
    }

    override fun getDeviceId(): Flow<String?> {
        // TODO: Load from DataStore
        return kotlinx.coroutines.flow.flowOf(null)
    }

    override fun getDevice(): Flow<CareDevice?> {
        return database.careDao().getDevice("default")
    }

    override fun getAppUsage(filter: CareFilter): Flow<List<CareAggregatedAppUsage>> {
        return database.careDao().getAppUsage("default")
    }

    override fun getWebHistory(filter: CareFilter): Flow<List<CareAggregatedWebHistory>> {
        return database.careDao().getWebHistory("default")
    }

    override fun getLocation(filter: CareFilter): Flow<List<CareLocation>> {
        return database.careDao().getLocations("default")
    }

    override fun getPermissions(): Flow<List<com.ubiverse.core.model.care.CarePermission>> {
        // TODO: Implement
        return kotlinx.coroutines.flow.flowOf(emptyList())
    }

    override suspend fun refresh() {
        // TODO: Implement Firebase refresh
    }

    override suspend fun sync() {
        // TODO: Implement Firebase sync
    }
}
