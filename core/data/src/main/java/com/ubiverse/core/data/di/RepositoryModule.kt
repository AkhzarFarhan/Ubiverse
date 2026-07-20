package com.ubiverse.core.data.di

import com.ubiverse.core.database.AppDatabase
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
    fun provideDailyRepository(database: AppDatabase): DailyRepository = DailyRepository(database)

    @Provides
    @Singleton
    fun provideGymRepository(database: AppDatabase): GymRepository = GymRepository(database)

    @Provides
    @Singleton
    fun provideTexterRepository(database: AppDatabase): TexterRepository = TexterRepository(database)

    @Provides
    @Singleton
    fun provideTasbihRepository(database: AppDatabase): TasbihRepository = TasbihRepository(database)

    @Provides
    @Singleton
    fun provideLedgerRepository(database: AppDatabase): LedgerRepository = LedgerRepository(database)

    @Provides
    @Singleton
    fun provideCarRepository(database: AppDatabase): CarRepository = CarRepository(database)

    @Provides
    @Singleton
    fun provideSalahRepository(database: AppDatabase): SalahRepository = SalahRepository(database)

    @Provides
    @Singleton
    fun provideQuranRepository(database: AppDatabase): QuranRepository = QuranRepository(database)

    @Provides
    @Singleton
    fun provideHadithRepository(database: AppDatabase): HadithRepository = HadithRepository(database)

    @Provides
    @Singleton
    fun provideCarpoolRepository(database: AppDatabase): CarpoolRepository = CarpoolRepository(database)

    @Provides
    @Singleton
    fun provideSudokuRepository(database: AppDatabase): SudokuRepository = SudokuRepository(database)

    @Provides
    @Singleton
    fun provideCareRepository(database: AppDatabase): CareRepository = CareRepository(database)

    @Provides
    @Singleton
    fun provideFocusRepository(database: AppDatabase): FocusRepository = FocusRepository(database)

    @Provides
    @Singleton
    fun provideLteRepository(database: AppDatabase): LteRepository = LteRepository(database)
}
