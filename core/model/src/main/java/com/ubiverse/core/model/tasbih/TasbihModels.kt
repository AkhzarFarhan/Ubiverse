package com.ubiverse.core.model.tasbih

import kotlinx.serialization.Serializable
import java.io.Serializable

@Serializable
data class TasbihState(
    val mode: TasbihMode = TasbihMode.Standard,
    val count: Int = 0,
    val phase: Int = 0,
    val customTarget: Int = 100
) : Serializable

enum class TasbihMode {
    Standard, Custom
}

@Serializable
data class TasbihPhase(
    val arabic: String,
    val label: String,
    val count: Int
) : Serializable

object TasbihConstants {
    val PHASES = listOf(
        TasbihPhase("سُبْحَانَ ٱللَّٰهِ", "SubhanAllah", 33),
        TasbihPhase("ٱلْحَمْدُ لِلَّٰهِ", "Alhamdulillah", 33),
        TasbihPhase("ٱللَّٰهُ أَكْبَرُ", "Allahu Akbar", 34)
    )
    val TOTAL_STANDARD = 100
}
