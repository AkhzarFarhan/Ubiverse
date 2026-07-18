package com.ubiverse.core.database

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.ubiverse.core.model.tasbih.TasbihState
import kotlinx.coroutines.flow.Flow

@Dao
interface TasbihDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(state: TasbihState)

    @Query("SELECT * FROM tasbih_state WHERE username = :username")
    fun getState(username: String): Flow<TasbihState?>

    @Query("DELETE FROM tasbih_state WHERE username = :username")
    suspend fun clear(username: String)
}
