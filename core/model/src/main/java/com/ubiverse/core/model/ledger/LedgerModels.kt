package com.ubiverse.core.model.ledger

import kotlinx.serialization.Serializable
import java.io.Serializable

@Serializable
data class LedgerEntry(
    val transactionId: Int,
    val credit: Double,
    val debit: Double,
    val mode: String,
    val details: String,
    val cash: Double,
    val bank: Double,
    val total: Double,
    val timestamp: String // "DD-MM-YYYY HH:MM:SS AM/PM"
) : Serializable

@Serializable
data class LedgerMode(
    val name: String,
    val shortCode: String
) : Serializable

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
