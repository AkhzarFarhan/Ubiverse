package com.ubiverse.core.database

import androidx.room.TypeConverter
import com.ubiverse.core.model.salah.SalahEntry
import com.ubiverse.core.model.sudoku.SudokuState
import com.ubiverse.core.model.tasbih.TasbihState
import kotlinx.serialization.json.Json
import kotlinx.serialization.encodeToString
import kotlinx.serialization.decodeFromString

class Converters {

    @TypeConverter
    fun fromIntArray(value: IntArray?): String? {
        return value?.let { Json { ignoreUnknownKeys = true }.encodeToString(it) }
    }

    @TypeConverter
    fun toIntArray(value: String?): IntArray? {
        return value?.let { Json { ignoreUnknownKeys = true }.decodeFromString(it) }
    }

    @TypeConverter
    fun fromIntArray2D(value: Array<IntArray>?): String? {
        return value?.let { Json { ignoreUnknownKeys = true }.encodeToString(it) }
    }

    @TypeConverter
    fun toIntArray2D(value: String?): Array<IntArray>? {
        return value?.let { Json { ignoreUnknownKeys = true }.decodeFromString(it) }
    }

    @TypeConverter
    fun fromIntArray3D(value: Array<Array<Array<Int>>>?): String? {
        return value?.let { Json { ignoreUnknownKeys = true }.encodeToString(it) }
    }

    @TypeConverter
    fun toIntArray3D(value: String?): Array<Array<Array<Int>>>? {
        return value?.let { Json { ignoreUnknownKeys = true }.decodeFromString(it) }
    }

    @TypeConverter
    fun fromSalahEntry(value: SalahEntry?): String? {
        return value?.let { Json { ignoreUnknownKeys = true }.encodeToString(it) }
    }

    @TypeConverter
    fun toSalahEntry(value: String?): SalahEntry? {
        return value?.let { Json { ignoreUnknownKeys = true }.decodeFromString(it) }
    }

    @TypeConverter
    fun fromTasbihState(value: TasbihState?): String? {
        return value?.let { Json { ignoreUnknownKeys = true }.encodeToString(it) }
    }

    @TypeConverter
    fun toTasbihState(value: String?): TasbihState? {
        return value?.let { Json { ignoreUnknownKeys = true }.decodeFromString(it) }
    }

    @TypeConverter
    fun fromSudokuState(value: SudokuState?): String? {
        return value?.let { Json { ignoreUnknownKeys = true }.encodeToString(it) }
    }

    @TypeConverter
    fun toSudokuState(value: String?): SudokuState? {
        return value?.let { Json { ignoreUnknownKeys = true }.decodeFromString(it) }
    }

    // List<String>
    @TypeConverter
    fun fromStringList(value: List<String>?): String? {
        return value?.let { Json { ignoreUnknownKeys = true }.encodeToString(it) }
    }

    @TypeConverter
    fun toStringList(value: String?): List<String>? {
        return value?.let { Json { ignoreUnknownKeys = true }.decodeFromString(it) }
    }

    // Map<String, Int>
    @TypeConverter
    fun fromStringIntMap(value: Map<String, Int>?): String? {
        return value?.let { Json { ignoreUnknownKeys = true }.encodeToString(it) }
    }

    @TypeConverter
    fun toStringIntMap(value: String?): Map<String, Int>? {
        return value?.let { Json { ignoreUnknownKeys = true }.decodeFromString(it) }
    }

    // List<CareAppUsage>
    @TypeConverter
    fun fromCareAppUsageList(value: List<com.ubiverse.core.model.care.CareAppUsage>?): String? {
        return value?.let { Json { ignoreUnknownKeys = true }.encodeToString(it) }
    }

    @TypeConverter
    fun toCareAppUsageList(value: String?): List<com.ubiverse.core.model.care.CareAppUsage>? {
        return value?.let { Json { ignoreUnknownKeys = true }.decodeFromString(it) }
    }

    // List<CareWebHistory>
    @TypeConverter
    fun fromCareWebHistoryList(value: List<com.ubiverse.core.model.care.CareWebHistory>?): String? {
        return value?.let { Json { ignoreUnknownKeys = true }.encodeToString(it) }
    }

    @TypeConverter
    fun toCareWebHistoryList(value: String?): List<com.ubiverse.core.model.care.CareWebHistory>? {
        return value?.let { Json { ignoreUnknownKeys = true }.decodeFromString(it) }
    }

    // SyncOperationType
    @TypeConverter
    fun fromSyncOperationType(value: com.ubiverse.core.database.sync.SyncOperationType?): String? {
        return value?.name
    }

    @TypeConverter
    fun toSyncOperationType(value: String?): com.ubiverse.core.database.sync.SyncOperationType? {
        return value?.let { com.ubiverse.core.database.sync.SyncOperationType.valueOf(it) }
    }
}
