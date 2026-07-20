package com.ubiverse.core.model.car

import androidx.room.Entity
import androidx.room.PrimaryKey
import kotlinx.serialization.Serializable

@Serializable
@Entity(tableName = "car_entry")
data class CarEntry(
    @PrimaryKey val date: String, // "YYYY-MM-DD"
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
) : java.io.Serializable
