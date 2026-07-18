package com.ubiverse.core.model.hadith

import kotlinx.serialization.Serializable
import java.io.Serializable

@Serializable
data class HadithBook(
    val id: Int,
    val name: String, // Urdu name
    val count: Int
) : Serializable

@Serializable
data class Hadith(
    val no: Int,
    val text: String
) : Serializable
