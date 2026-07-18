package com.ubiverse.core.model.carpool

import kotlinx.serialization.Serializable
import java.io.Serializable

@Serializable
data class CarpoolRide(
    val ownerName: String,
    val ownerPhone: String,
    val vehicleType: String, // "Car" or "Bike"
    val totalSeats: Int,
    val masjidName: String,
    val departureTime: String, // "HH:mm"
    val extraHelmet: Boolean,
    val pickupPoint: String?,
    val createdAt: Long // timestamp
) : Serializable

@Serializable
data class CarpoolPrefill(
    val ownerPhone: String = "",
    val vehicleType: String = "Car",
    val totalSeats: Int = 1,
    val masjidName: String = "",
    val departureTime: String = "",
    val extraHelmet: Boolean = false,
    val pickupPoint: String = ""
) : Serializable
