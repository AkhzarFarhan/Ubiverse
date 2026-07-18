package com.ubiverse.core.data.repository

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.auth.GoogleAuthProvider
import com.google.firebase.ktx.auth
import com.google.firebase.ktx.firestore
import com.ubiverse.core.model.auth.AuthState
import com.ubiverse.core.model.auth.User
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.tasks.await
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepository @Inject constructor() {

    private val firebaseAuth = FirebaseAuth.getInstance()

    val authState = callbackFlow<AuthState> {
        val listener = firebaseAuth.addAuthStateListener { firebaseAuth ->
            val user = firebaseAuth.currentUser
            if (user != null) {
                try {
                    val tokenResult = user.getIdToken(false).await()
                    val idToken = tokenResult.token
                    // Token is fresh, user is authenticated
                    offer(AuthState.Authenticated(User.fromFirebaseUser(user)))
                } catch (e: Exception) {
                    offer(AuthState.Unauthenticated)
                }
            } else {
                offer(AuthState.Unauthenticated)
            }
        }
        awaitClose { firebaseAuth.removeAuthStateListener(listener) }
    }.distinctUntilChanged()

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
