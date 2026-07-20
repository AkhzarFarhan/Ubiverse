package com.ubiverse.core.model.hadith

import androidx.room.Entity
import androidx.room.PrimaryKey
import kotlinx.serialization.Serializable

@Serializable
@Entity(tableName = "hadith_book")
data class HadithBook(
    @PrimaryKey val id: Int,
    val name: String, // Urdu name
    val count: Int
) : java.io.Serializable

@Serializable
data class Hadith(
    val no: Int,
    val text: String
) : java.io.Serializable
