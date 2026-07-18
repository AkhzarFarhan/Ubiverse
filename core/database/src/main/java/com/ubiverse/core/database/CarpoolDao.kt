package com.ubiverse.core.database

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.ubiverse.core.model.carpool.CarpoolRide
import kotlinx.coroutines.flow.Flow

@Dao
interface CarpoolDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(rides: List<CarpoolRide>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(ride: CarpoolRide)

    @Query("SELECT * FROM carpool_ride ORDER BY createdAt DESC")
    fun getAll(): Flow<List<CarpoolRide>>

    @Query("DELETE FROM carpool_ride WHERE rideId = :rideId")
    suspend fun deleteById(rideId: String)

    @Query("DELETE FROM carpool_ride WHERE createdAt < :cutoff")
    suspend fun deleteOld(cutoff: Long)

    @Query("DELETE FROM carpool_ride")
    suspend fun clear()
}
