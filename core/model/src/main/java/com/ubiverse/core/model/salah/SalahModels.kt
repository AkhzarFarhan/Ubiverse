package com.ubiverse.core.model.salah

import androidx.room.Entity
import androidx.room.PrimaryKey
import kotlinx.serialization.Serializable

@Serializable
@Entity(tableName = "salah_entry")
data class SalahEntry(
    val prayers: IntArray, // [Fajr, Zohar, Asr, Maghrib, Isha] - cumulative debt
    val timestamp: String, // "DD-MM-YYYY HH:MM:SS AM/PM"
    @PrimaryKey val date: String // "YYYY-MM-DD"
) : java.io.Serializable

@Serializable
data class SalahPrediction(
    val predictedDays: IntArray,
    val actualDays: IntArray
) : java.io.Serializable

object SalahConstants {
    val PRAYERS = arrayOf("Fajr", "Zohar", "Asr", "Maghrib", "Isha")
    val FARZ_RAKA = intArrayOf(2, 4, 4, 3, 4)
    val JAMAAT_MULTIPLIER = 27
}
