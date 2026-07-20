package com.ubiverse.core.data.repository

import com.ubiverse.core.database.AppDatabase
import com.ubiverse.core.model.texter.TexterEntry
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TexterRepository @Inject constructor(
    private val database: AppDatabase
)  {

    suspend fun addEntry(entry: TexterEntry) {
        database.texterDao().insert(entry)
    }

    suspend fun shareNote(targetUsername: String, note: String) {
        // TODO: Implement Firebase share
    }

    suspend fun copyNote(index: Int) {
        // TODO: Implement clipboard copy
    }

    suspend fun deleteNote(index: Int) {
        // TODO: Implement delete
    }

    fun getEntries(): Flow<List<TexterEntry>> {
        return database.texterDao().getAll()
    }

    suspend fun sync() {
        // TODO: Implement Firebase sync
    }
}
