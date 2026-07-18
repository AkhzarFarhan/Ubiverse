package com.ubiverse.core.model.car

import kotlinx.serialization.Serializable
import java.io.Serializable

@Serializable
data class CarEntry(
    val date: String, // "YYYY-MM-DD"
    val odometer: Double,
    val fuelVol: Double,
    val fuelCost: Double,
    val ppu: Double, // price per unit
    val fullTank: Boolean,
    val station: String,
    val svcCost: Double,
    val svcDetails: String,
    val mode: String, // "City", "Highway", "Mixed"
    val notes: String,
    val distance: Double,
    val mileage: Double?
) : Serializable
