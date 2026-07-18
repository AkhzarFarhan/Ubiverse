package com.ubiverse.core.model.salah

import kotlinx.serialization.Serializable
import java.io.Serializable

@Serializable
data class SalahEntry(
    val prayers: IntArray, // [Fajr, Zohar, Asr, Maghrib, Isha] - cumulative debt
    val timestamp: String, // "DD-MM-YYYY HH:MM:SS AM/PM"
    val date: String // "YYYY-MM-DD"
) : Serializable

@Serializable
data class SalahPrediction(
    val predictedDays: IntArray,
    val actualDays: IntArray
) : Serializable

object SalahConstants {
    val PRAYERS = arrayOf("Fajr", "Zohar", "Asr", "Maghrib", "Isha")
    val FARZ_RAKA = intArrayOf(2, 4, 4, 3, 4)
    val JAMAAT_MULTIPLIER = 27
}
