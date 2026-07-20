package com.ubiverse.core.data.repository

import com.ubiverse.core.database.AppDatabase
import com.ubiverse.core.model.hadith.HadithBook
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class HadithRepository @Inject constructor(
    private val database: AppDatabase
)  {

    fun getBooks(): Flow<List<HadithBook>> {
        return database.hadithDao().getAll()
    }

    fun getHadiths(bookId: String): Flow<List<com.ubiverse.core.model.hadith.Hadith>> {
        // TODO: Implement hadith loading from assets
        return kotlinx.coroutines.flow.flowOf(emptyList())
    }

    suspend fun sync() {
        // TODO: Implement Firebase sync
    }
}
