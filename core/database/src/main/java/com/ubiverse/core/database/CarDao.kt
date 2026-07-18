package com.ubiverse.core.database

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.ubiverse.core.model.car.CarEntry
import kotlinx.coroutines.flow.Flow

@Dao
interface CarDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(entries: List<CarEntry>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(entry: CarEntry)

    @Query("SELECT * FROM car_entry ORDER BY date DESC")
    fun getAll(): Flow<List<CarEntry>>

    @Query("DELETE FROM car_entry")
    suspend fun clear()
}
