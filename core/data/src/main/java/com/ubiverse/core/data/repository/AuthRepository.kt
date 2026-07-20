package com.ubiverse.core.data.repository

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.GoogleAuthProvider
import com.ubiverse.core.model.auth.AuthState
import com.ubiverse.core.model.auth.User
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepository @Inject constructor() {

    private val firebaseAuth = FirebaseAuth.getInstance()

    val authState = callbackFlow<AuthState> {
        val listener = FirebaseAuth.AuthStateListener { firebaseAuth ->
            val user = firebaseAuth.currentUser
            if (user != null) {
                try {
                    trySend(AuthState.Authenticated(User.fromFirebaseUser(user)))
                } catch (e: Exception) {
                    trySend(AuthState.Unauthenticated)
                }
            } else {
                trySend(AuthState.Unauthenticated)
            }
        }
        firebaseAuth.addAuthStateListener(listener)
        awaitClose { firebaseAuth.removeAuthStateListener(listener) }
    }

    suspend fun signInWithGoogle(idToken: String): User {
        val credential = GoogleAuthProvider.getCredential(idToken, null)
        val authResult = firebaseAuth.signInWithCredential(credential).await()
        return User.fromFirebaseUser(authResult.user!!)
    }

    suspend fun signOut() {
        firebaseAuth.signOut()
    }

    fun getCurrentUser(): User? {
        return firebaseAuth.currentUser?.let { User.fromFirebaseUser(it) }
    }
}
