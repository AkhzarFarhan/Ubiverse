package com.ubiverse.core.model.focus

import kotlinx.serialization.Serializable
import java.io.Serializable

@Serializable
data class FocusConceptChapter(
    val id: String,
    val title: String,
    val icon: String,
    val difficulty: String,
    val topics: List<FocusTopic>
) : Serializable

@Serializable
data class FocusTopic(
    val id: String,
    val title: String,
    val content: String, // Markdown-ish
    val code: String? = null,
    val quiz: FocusQuiz? = null
) : Serializable

@Serializable
data class FocusQuiz(
    val question: String,
    val options: List<String>,
    val correctAnswer: Int
) : Serializable

@Serializable
data class FocusPatternChapter(
    val id: String,
    val title: String,
    val icon: String,
    val difficulty: String,
    val problems: List<FocusProblem>
) : Serializable

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
) : Serializable

@Serializable
data class FocusProgress(
    val completedTopics: List<String> = emptyList(),
    val completedProblems: List<String> = emptyList(),
    val completedChapters: List<String> = emptyList(),
    val quizScores: Map<String, Int> = emptyMap()
) : Serializable
