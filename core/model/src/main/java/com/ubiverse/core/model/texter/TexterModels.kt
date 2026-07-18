package com.ubiverse.core.model.texter

import kotlinx.serialization.Serializable
import java.io.Serializable

@Serializable
data class TexterEntry(
    val note: String,
    val timestamp: String, // "DD-MM-YYYY HH:MM:SS AM/PM"
    val sharedBy: String? = null
) : Serializable
