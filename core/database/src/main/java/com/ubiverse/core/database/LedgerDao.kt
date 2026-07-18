package com.ubiverse.core.database

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.ubiverse.core.model.ledger.LedgerEntry
import kotlinx.coroutines.flow.Flow

@Dao
interface LedgerDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(entries: List<LedgerEntry>)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(entry: LedgerEntry)

    @Query("SELECT * FROM ledger_entry ORDER BY timestamp DESC")
    fun getAll(): Flow<List<LedgerEntry>>

    @Query("DELETE FROM ledger_entry")
    suspend fun clear()
}
