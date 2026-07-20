package com.ubiverse.core.model.focus

import androidx.room.Entity
import androidx.room.PrimaryKey
import kotlinx.serialization.Serializable

@Serializable
data class FocusConceptChapter(
    val id: String,
    val title: String,
    val icon: String,
    val difficulty: String,
    val topics: List<FocusTopic>
) : java.io.Serializable

@Serializable
data class FocusTopic(
    val id: String,
    val title: String,
    val content: String, // Markdown-ish
    val code: String? = null,
    val quiz: FocusQuiz? = null
) : java.io.Serializable

@Serializable
data class FocusQuiz(
    val question: String,
    val options: List<String>,
    val correctAnswer: Int
) : java.io.Serializable

@Serializable
data class FocusPatternChapter(
    val id: String,
    val title: String,
    val icon: String,
    val difficulty: String,
    val problems: List<FocusProblem>
) : java.io.Serializable

@Serializable
data class FocusProblem(
    val id: String,
    val title: String,
    val difficulty: String,
    val pattern: String,
    val description: String,
    val solution: String,
    val code: String,
    val leetcodeLinks: List<String>
) : java.io.Serializable

@Serializable
@Entity(tableName = "focus_progress")
data class FocusProgress(
    @PrimaryKey val username: String = "",
    val completedTopics: List<String> = emptyList(),
    val completedProblems: List<String> = emptyList(),
    val completedChapters: List<String> = emptyList(),
    val quizScores: Map<String, Int> = emptyMap()
) : java.io.Serializable
