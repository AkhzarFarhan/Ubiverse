package com.ubiverse.core.database

import androidx.room.TypeConverter
import com.ubiverse.core.model.salah.SalahEntry
import com.ubiverse.core.model.sudoku.SudokuState
import com.ubiverse.core.model.tasbih.TasbihState
import kotlinx.serialization.json.Json

class Converters {

    @TypeConverter
    fun fromIntArray(value: IntArray?): String? {
        return value?.let { Json { ignoreUnknownKeys = true }.encodeToString(IntArray.serializer(), it) }
    }

    @TypeConverter
    fun toIntArray(value: String?): IntArray? {
        return value?.let { Json { ignoreUnknownKeys = true }.decodeFromString(IntArray.serializer(), it) }
    }

    @TypeConverter
    fun fromIntArray2D(value: Array<IntArray>?): String? {
        return value?.let { Json { ignoreUnknownKeys = true }.encodeToString(Array(IntArray.serializer()), it) }
    }

    @TypeConverter
    fun toIntArray2D(value: String?): Array<IntArray>? {
        return value?.let { Json { ignoreUnknownKeys = true }.decodeFromString(Array(IntArray.serializer()), it) }
    }

    @TypeConverter
    fun fromIntArray3D(value: Array<Array<Array<Int>>>?): String? {
        return value?.let { Json { ignoreUnknownKeys = true }.encodeToString(Array(Array(IntArray.serializer())), it) }
    }

    @TypeConverter
    fun toIntArray3D(value: String?): Array<Array<Array<Int>>>? {
        return value?.let { Json { ignoreUnknownKeys = true }.decodeFromString(Array(Array(IntArray.serializer())), it) }
    }

    @TypeConverter
    fun fromSalahEntry(value: SalahEntry?): String? {
        return value?.let { Json { ignoreUnknownKeys = true }.encodeToString(SalahEntry.serializer(), it) }
    }

    @TypeConverter
    fun toSalahEntry(value: String?): SalahEntry? {
        return value?.let { Json { ignoreUnknownKeys = true }.decodeFromString(SalahEntry.serializer(), it) }
    }

    @TypeConverter
    fun fromTasbihState(value: TasbihState?): String? {
        return value?.let { Json { ignoreUnknownKeys = true }.encodeToString(TasbihState.serializer(), it) }
    }

    @TypeConverter
    fun toTasbihState(value: String?): TasbihState? {
        return value?.let { Json { ignoreUnknownKeys = true }.decodeFromString(TasbihState.serializer(), it) }
    }

    @TypeConverter
    fun fromSudokuState(value: SudokuState?): String? {
        return value?.let { Json { ignoreUnknownKeys = true }.encodeToString(SudokuState.serializer(), it) }
    }

    @TypeConverter
    fun toSudokuState(value: String?): SudokuState? {
        return value?.let { Json { ignoreUnknownKeys = true }.decodeFromString(SudokuState.serializer(), it) }
    }
}
