package com.ubiverse.core.data.di

import com.ubiverse.core.data.repository.AuthRepository
import com.ubiverse.core.data.repository.DailyRepository
import com.ubiverse.core.data.repository.GymRepository
import com.ubiverse.core.data.repository.TexterRepository
import com.ubiverse.core.data.repository.TasbihRepository
import com.ubiverse.core.data.repository.LedgerRepository
import com.ubiverse.core.data.repository.CarRepository
import com.ubiverse.core.data.repository.SalahRepository
import com.ubiverse.core.data.repository.QuranRepository
import com.ubiverse.core.data.repository.HadithRepository
import com.ubiverse.core.data.repository.CarpoolRepository
import com.ubiverse.core.data.repository.SudokuRepository
import com.ubiverse.core.data.repository.CareRepository
import com.ubiverse.core.data.repository.FocusRepository
import com.ubiverse.core.data.repository.LteRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object RepositoryModule {

    @Provides
    @Singleton
    fun provideAuthRepository(): AuthRepository = AuthRepository()

    @Provides
    @Singleton
    fun provideDailyRepository(): DailyRepository = DailyRepository()

    @Provides
    @Singleton
    fun provideGymRepository(): GymRepository = GymRepository()

    @Provides
    @Singleton
    fun provideTexterRepository(): TexterRepository = TexterRepository()

    @Provides
    @Singleton
    fun provideTasbihRepository(): TasbihRepository = TasbihRepository()

    @Provides
    @Singleton
    fun provideLedgerRepository(): LedgerRepository = LedgerRepository()

    @Provides
    @Singleton
    fun provideCarRepository(): CarRepository = CarRepository()

    @Provides
    @Singleton
    fun provideSalahRepository(): SalahRepository = SalahRepository()

    @Provides
    @Singleton
    fun provideQuranRepository(): QuranRepository = QuranRepository()

    @Provides
    @Singleton
    fun provideHadithRepository(): HadithRepository = HadithRepository()

    @Provides
    @Singleton
    fun provideCarpoolRepository(): CarpoolRepository = CarpoolRepository()

    @Provides
    @Singleton
    fun provideSudokuRepository(): SudokuRepository = SudokuRepository()

    @Provides
    @Singleton
    fun provideCareRepository(): CareRepository = CareRepository()

    @Provides
    @Singleton
    fun provideFocusRepository(): FocusRepository = FocusRepository()

    @Provides
    @Singleton
    fun provideLteRepository(): LteRepository = LteRepository()
}
