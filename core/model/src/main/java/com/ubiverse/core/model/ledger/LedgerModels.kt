package com.ubiverse.core.model.ledger

import androidx.room.Entity
import androidx.room.PrimaryKey
import kotlinx.serialization.Serializable

@Serializable
@Entity(tableName = "ledger_entry")
data class LedgerEntry(
    @PrimaryKey val transactionId: Int,
    val credit: Double,
    val debit: Double,
    val mode: String,
    val details: String,
    val cash: Double,
    val bank: Double,
    val total: Double,
    val timestamp: String // "DD-MM-YYYY HH:MM:SS AM/PM"
) : java.io.Serializable

@Serializable
data class LedgerMode(
    val name: String,
    val shortCode: String
) : java.io.Serializable

object LedgerConstants {
    val MODES = listOf(
        LedgerMode("Cash", "CA"),
        LedgerMode("PhonePe", "PP"),
        LedgerMode("PayTM", "UPI"),
        LedgerMode("Other UPI", "UPI"),
        LedgerMode("Card", "CRD"),
        LedgerMode("Net Banking", "NB"),
        LedgerMode("CashToBank", "CTB"),
        LedgerMode("BankToCash", "BTC")
    )
}

@Serializable
data class LedgerMonthlySummary(
    val month: String, // "YYYY-MM"
    val totalCredit: Double,
    val totalDebit: Double
) : java.io.Serializable

