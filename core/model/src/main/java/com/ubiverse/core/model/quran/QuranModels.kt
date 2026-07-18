package com.ubiverse.core.model.quran

import kotlinx.serialization.Serializable
import java.io.Serializable

@Serializable
data class Surah(
    val index: Int,
    val name: String, // Arabic name
    val ename: String, // English name
    val ayahs: Int
) : Serializable

@Serializable
data class Ayah(
    val index: Int,
    val text: String,
    val bismillah: String? = null
) : Serializable

@Serializable
data class QuranProgress(
    val lastAyah: Int = 0,
    val completed: Boolean = false,
    val timestamp: String = ""
) : Serializable

object QuranConstants {
    // Surah 1 (Al-Fatihah): Bismillah IS ayah 1
    // Surah 9 (At-Tawbah): NO Bismillah
    // Others: Bismillah from first ayah's bismillah attribute
    const val SURAH_AL_FATIHAH = 1
    const val SURAH_AT_TAWBAH = 9
}
