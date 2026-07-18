package com.ubiverse.core.model.gym

import kotlinx.serialization.Serializable
import java.io.Serializable

@Serializable
data class GymEntry(
    val message: String, // comma-separated muscle groups
    val timestamp: String // "DD-MM-YYYY HH:MM:SS AM/PM"
) : Serializable
