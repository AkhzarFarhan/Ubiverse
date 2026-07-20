package com.ubiverse.core.data.repository

import com.ubiverse.core.database.AppDatabase
import com.ubiverse.core.model.lte.LteSpec
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class LteRepository @Inject constructor(
    private val database: AppDatabase
)  {

    fun getSpec(): Flow<LteSpec> {
        // TODO: Load from assets
        return kotlinx.coroutines.flow.flowOf(LteSpec(
            title = "",
            expertOverview = "",
            standardReferences = emptyList(),
            overallExpertCommentary = com.ubiverse.core.model.lte.LteExpertCommentary(
                architectureAssessment = "",
                keyDesignPrinciples = emptyList(),
                knownLimitations = emptyList(),
                comparisonToNr = ""
            ),
            diagrams = null,
            macRlcInteractions = emptyList(),
            macRrcInteractions = emptyList(),
            macPhyInteractions = emptyList(),
            summaryInteractionCount = com.ubiverse.core.model.lte.LteInteractionCount(0, 0, 0)
        ))
    }

    suspend fun sync() {
        // TODO: Implement Firebase sync
    }
}
