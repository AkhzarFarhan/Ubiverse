package com.ubiverse.core.model.auth

import androidx.room.Entity
import androidx.room.PrimaryKey
import kotlinx.serialization.Serializable

@Serializable
@Entity(tableName = "user")
data class User(
    @PrimaryKey val uid: String,
    val email: String,
    val displayName: String?,
    val photoUrl: String?,
    val username: String, // email prefix, lowercased
    val firstName: String // first name from displayName or username
) {
    companion object {
        fun fromFirebaseUser(firebaseUser: com.google.firebase.auth.FirebaseUser): User {
            val email = firebaseUser.email ?: ""
            val username = email.substringBefore("@").lowercase()
            val displayName = firebaseUser.displayName
            val firstName = displayName?.split(" ")?.first() ?: username
            return User(
                uid = firebaseUser.uid,
                email = email,
                displayName = displayName,
                photoUrl = firebaseUser.photoUrl?.toString(),
                username = username,
                firstName = firstName
            )
        }
    }
}

sealed interface AuthState {
    data class Authenticated(val user: User) : AuthState
    object Unauthenticated : AuthState
    object Loading : AuthState
}
