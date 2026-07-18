package com.ubiverse.core.database

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.ubiverse.core.model.care.CareDevice
import com.ubiverse.core.model.care.CareAggregatedAppUsage
import com.ubiverse.core.model.care.CareAggregatedWebHistory
import com.ubiverse.core.model.care.CareLocation
import kotlinx.coroutines.flow.Flow

@Dao
interface CareDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(device: CareDevice)

    @Query("SELECT * FROM care_device WHERE username = :username")
    fun getDevice(username: String): Flow<CareDevice?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAppUsage(usage: CareAggregatedAppUsage)

    @Query("SELECT * FROM care_aggregated_app_usage WHERE username = :username ORDER BY totalTime DESC")
    fun getAppUsage(username: String): Flow<List<CareAggregatedAppUsage>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertWebHistory(history: CareAggregatedWebHistory)

    @Query("SELECT * FROM care_aggregated_web_history WHERE username = :username ORDER BY totalTime DESC")
    fun getWebHistory(username: String): Flow<List<CareAggregatedWebHistory>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertLocation(location: CareLocation)

    @Query("SELECT * FROM care_location WHERE username = :username ORDER BY timestamp DESC")
    fun getLocations(username: String): Flow<List<CareLocation>>

    @Query("DELETE FROM care_device WHERE username = :username")
    suspend fun clearDevice(username: String)

    @Query("DELETE FROM care_aggregated_app_usage WHERE username = :username")
    suspend fun clearAppUsage(username: String)

    @Query("DELETE FROM care_aggregated_web_history WHERE username = :username")
    suspend fun clearWebHistory(username: String)

    @Query("DELETE FROM care_location WHERE username = :username")
    suspend fun clearLocations(username: String)
}
