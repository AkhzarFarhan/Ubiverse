package com.ubiverse.core.model.lte

import kotlinx.serialization.Serializable

@Serializable
data class LteSpec(
    val title: String,
    val expertOverview: String,
    val standardReferences: List<String>,
    val overallExpertCommentary: LteExpertCommentary,
    val diagrams: LteDiagrams? = null,
    val macRlcInteractions: List<LteInteraction>,
    val macRrcInteractions: List<LteInteraction>,
    val macPhyInteractions: List<LteInteraction>,
    val summaryInteractionCount: LteInteractionCount
) : java.io.Serializable

@Serializable
data class LteExpertCommentary(
    val architectureAssessment: String,
    val keyDesignPrinciples: List<String>,
    val knownLimitations: List<String>,
    val comparisonToNr: String
) : java.io.Serializable

@Serializable
data class LteDiagrams(
    val architecture: String? = null,
    val protocolStack: String? = null
) : java.io.Serializable

@Serializable
data class LteInteraction(
    val title: String,
    val description: String
) : java.io.Serializable

@Serializable
data class LteInteractionCount(
    val rlcCount: Int,
    val rrcCount: Int,
    val phyCount: Int
) : java.io.Serializable
