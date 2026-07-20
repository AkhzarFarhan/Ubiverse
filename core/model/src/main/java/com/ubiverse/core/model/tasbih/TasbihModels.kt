package com.ubiverse.core.model.tasbih

import androidx.room.Entity
import androidx.room.PrimaryKey
import kotlinx.serialization.Serializable

@Serializable
@Entity(tableName = "tasbih_state")
data class TasbihState(
    @PrimaryKey val username: String = "",
    val mode: TasbihMode = TasbihMode.Standard,
    val count: Int = 0,
    val phase: Int = 0,
    val customTarget: Int = 100
) : java.io.Serializable

enum class TasbihMode {
    Standard, Custom
}

@Serializable
data class TasbihPhase(
    val arabic: String,
    val label: String,
    val count: Int
) : java.io.Serializable

object TasbihConstants {
    val PHASES = listOf(
        TasbihPhase("سُبْحَانَ ٱللَّٰهِ", "SubhanAllah", 33),
        TasbihPhase("ٱلْحَمْدُ لِلَّٰهِ", "Alhamdulillah", 33),
        TasbihPhase("ٱللَّٰهُ أَكْبَرُ", "Allahu Akbar", 34)
    )
    val TOTAL_STANDARD = 100
}
