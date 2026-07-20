pluginManagement {
    repositories {
        gradlePluginPortal()
        google()
        mavenCentral()
    }
    resolutionStrategy {
        eachPlugin {
            if (requested.id.id == "com.android.application") {
                useModule("com.android.tools.build:gradle:8.5.0")
            }
            if (requested.id.id == "org.jetbrains.kotlin.android" || requested.id.id == "kotlin-android" || requested.id.id == "kotlin-kapt") {
                useModule("org.jetbrains.kotlin:kotlin-gradle-plugin:1.9.24")
            }
            if (requested.id.id == "org.jetbrains.kotlin.plugin.serialization") {
                useModule("org.jetbrains.kotlin:kotlin-serialization:1.9.24")
            }
            if (requested.id.id == "com.google.dagger.hilt.android") {
                useModule("com.google.dagger:hilt-android-gradle-plugin:2.51.1")
            }
            if (requested.id.id == "com.google.gms.google-services") {
                useModule("com.google.gms:google-services:4.4.1")
            }
        }
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
        maven { url = uri("https://jitpack.io") }
    }
}

rootProject.name = "Ubiverse"

include(":app")
include(":core:data")
include(":core:database")
include(":core:model")
include(":core:common")
include(":core:ui")
include(":core:designsystem")
include(":core:datastore")
include(":core:network")
include(":core:testing")

// Feature modules will be added as we implement them
include(":feature:daily")
// include(":feature:gym")
// include(":feature:texter")
// include(":feature:tasbih")
// include(":feature:ledger")
// include(":feature:car")
// include(":feature:salah")
// include(":feature:quran")
// include(":feature:hadith")
// include(":feature:carpool")
// include(":feature:sudoku")
// include(":feature:care")
// include(":feature:focus")
// include(":feature:lte")
