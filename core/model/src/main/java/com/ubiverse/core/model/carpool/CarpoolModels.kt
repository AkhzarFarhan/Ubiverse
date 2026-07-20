package com.ubiverse.core.model.carpool

import androidx.room.Entity
import androidx.room.PrimaryKey
import kotlinx.serialization.Serializable

@Serializable
@Entity(tableName = "carpool_ride")
data class CarpoolRide(
    val ownerName: String,
    val ownerPhone: String,
    val vehicleType: String, // "Car" or "Bike"
    val totalSeats: Int,
    val masjidName: String,
    val departureTime: String, // "HH:mm"
    val extraHelmet: Boolean,
    val pickupPoint: String?,
    @PrimaryKey val createdAt: Long // timestamp
) : java.io.Serializable

@Serializable
data class CarpoolPrefill(
    val ownerPhone: String = "",
    val vehicleType: String = "Car",
    val totalSeats: Int = 1,
    val masjidName: String = "",
    val departureTime: String = "",
    val extraHelmet: Boolean = false,
    val pickupPoint: String = ""
) : java.io.Serializable
