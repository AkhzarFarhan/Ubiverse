package com.ubiverse.app

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import com.ubiverse.core.model.auth.AuthState
import com.ubiverse.core.ui.screens.auth.LoginScreen
import com.ubiverse.core.ui.screens.home.HomeScreen

@Composable
fun AppNavHost(
    navViewModel: NavViewModel,
    authViewModel: AuthViewModel
) {
    val authState by authViewModel.authState.collectAsState()

    when (val state = authState) {
        is AuthState.Authenticated -> {
            HomeScreen(
                user = state.user,
                onSignOutClick = { authViewModel.signOut() }
            )
        }
        else -> {
            LoginScreen(
                onSignInClick = { idToken -> authViewModel.signInWithGoogle(idToken) }
            )
        }
    }
}
