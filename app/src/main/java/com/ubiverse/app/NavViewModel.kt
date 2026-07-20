package com.ubiverse.app

import androidx.lifecycle.ViewModel
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import javax.inject.Inject

@HiltViewModel
class NavViewModel @Inject constructor() : ViewModel() {
    private val _currentScreen = MutableStateFlow<String>("login")
    val currentScreen: StateFlow<String> = _currentScreen

    fun navigateTo(screen: String) {
        _currentScreen.value = screen
    }
}
