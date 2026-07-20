package com.ubiverse.core.data.repository

import com.ubiverse.core.database.AppDatabase
import com.ubiverse.core.model.tasbih.TasbihState
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TasbihRepository @Inject constructor(
    private val database: AppDatabase
)  {

    suspend fun saveState(state: TasbihState) {
        database.tasbihDao().insert(state)
    }

    fun getState(): Flow<TasbihState> {
        return database.tasbihDao().getState("default")
            .map { it ?: TasbihState() }
    }

    suspend fun sync() {
        // TODO: Implement Firebase sync
    }
}
