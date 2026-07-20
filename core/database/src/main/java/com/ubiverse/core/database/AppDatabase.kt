package com.ubiverse.core.database

import androidx.room.Database
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.ubiverse.core.database.sync.SyncOperation
import com.ubiverse.core.database.sync.SyncedId
import com.ubiverse.core.database.sync.SyncQueueDao
import com.ubiverse.core.database.sync.SyncedIdsDao
import com.ubiverse.core.model.auth.User
import com.ubiverse.core.model.daily.DailyEntry
import com.ubiverse.core.model.gym.GymEntry
import com.ubiverse.core.model.texter.TexterEntry
import com.ubiverse.core.model.tasbih.TasbihState
import com.ubiverse.core.model.ledger.LedgerEntry
import com.ubiverse.core.model.car.CarEntry
import com.ubiverse.core.model.salah.SalahEntry
import com.ubiverse.core.model.quran.QuranProgress
import com.ubiverse.core.model.hadith.HadithBook
import com.ubiverse.core.model.carpool.CarpoolRide
import com.ubiverse.core.model.sudoku.SudokuState
import com.ubiverse.core.model.care.CareDevice
import com.ubiverse.core.model.care.CareAggregatedAppUsage
import com.ubiverse.core.model.care.CareAggregatedWebHistory
import com.ubiverse.core.model.care.CareLocation
import com.ubiverse.core.model.focus.FocusProgress

@Database(
    entities = [
        User::class,
        DailyEntry::class,
        GymEntry::class,
        TexterEntry::class,
        TasbihState::class,
        LedgerEntry::class,
        CarEntry::class,
        SalahEntry::class,
        QuranProgress::class,
        HadithBook::class,
        CarpoolRide::class,
        SudokuState::class,
        CareDevice::class,
        CareAggregatedAppUsage::class,
        CareAggregatedWebHistory::class,
        CareLocation::class,
        FocusProgress::class,
        SyncOperation::class,
        SyncedId::class
    ],
    version = 1,
    exportSchema = false
)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao
    abstract fun dailyDao(): DailyDao
    abstract fun gymDao(): GymDao
    abstract fun texterDao(): TexterDao
    abstract fun tasbihDao(): TasbihDao
    abstract fun ledgerDao(): LedgerDao
    abstract fun carDao(): CarDao
    abstract fun salahDao(): SalahDao
    abstract fun quranDao(): QuranDao
    abstract fun hadithDao(): HadithDao
    abstract fun carpoolDao(): CarpoolDao
    abstract fun sudokuDao(): SudokuDao
    abstract fun careDao(): CareDao
    abstract fun focusDao(): FocusDao
    abstract fun syncQueueDao(): SyncQueueDao
    abstract fun syncedIdsDao(): SyncedIdsDao
}
