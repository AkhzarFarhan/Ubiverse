package com.ubiverse.core.model.sudoku

import kotlinx.serialization.Serializable
import java.io.Serializable

@Serializable
data class SudokuState(
    val puzzle: Array<IntArray>, // 9x9 initial clues
    val solution: Array<IntArray>, // 9x9 solved board
    val board: Array<IntArray>, // 9x9 user progress
    val candidates: Array<Array<Array<Int>>>, // 9x9 Set<Int> as arrays
    val difficulty: SudokuDifficulty,
    val elapsedSeconds: Int,
    val startedAt: String,
    val lastSavedAt: String,
    val completed: Boolean
) : Serializable

enum class SudokuDifficulty {
    Easy, Medium, Hard
}

object SudokuConstants {
    val CLUES = mapOf(
        SudokuDifficulty.Easy to 36,
        SudokuDifficulty.Medium to 30,
        SudokuDifficulty.Hard to 24
    )
}
