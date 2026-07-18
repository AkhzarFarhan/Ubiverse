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
) : LedgerRepository {

    override suspend fun addEntry(entry: LedgerEntry) {
        database.ledgerDao().insert(entry)
    }

    override fun getEntries(): Flow<List<LedgerEntry>> {
        return database.ledgerDao().getAll()
    }

    override fun getMonthlySummary(): Flow<List<LedgerMonthlySummary>> {
        // TODO: Implement monthly aggregation
        return kotlinx.coroutines.flow.flowOf(emptyList())
    }

    override suspend fun sync() {
        // TODO: Implement Firebase sync
    }
}
