package com.ubiverse.core.data.repository

import com.ubiverse.core.database.AppDatabase
import com.ubiverse.core.model.ledger.LedgerEntry
import com.ubiverse.core.model.ledger.LedgerMonthlySummary
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class LedgerRepository @Inject constructor(
    private val database: AppDatabase
)  {

    suspend fun addEntry(entry: LedgerEntry) {
        database.ledgerDao().insert(entry)
    }

    fun getEntries(): Flow<List<LedgerEntry>> {
        return database.ledgerDao().getAll()
    }

    fun getMonthlySummary(): Flow<List<LedgerMonthlySummary>> {
        // TODO: Implement monthly aggregation
        return kotlinx.coroutines.flow.flowOf(emptyList())
    }

    suspend fun sync() {
        // TODO: Implement Firebase sync
    }
}
