package com.ubiverse.core.ui.screens.auth

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ubiverse.core.designsystem.theme.Theme
import com.ubiverse.core.ui.common.GoogleSignInButton

@Composable
fun LoginScreen(
    onSignInClick: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    Theme {
        androidx.compose.material3.Surface(
            modifier = modifier.fillMaxSize(),
            color = androidx.compose.material3.MaterialTheme.colorScheme.background
        ) {
            Column(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.Center,
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Logo/Brand
                Card(
                    modifier = Modifier.padding(24.dp),
                    elevation = androidx.compose.material3.CardDefaults.cardElevation(defaultElevation = 8.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(32.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        // App icon placeholder
                        androidx.compose.foundation.layout.Box(
                            modifier = Modifier.size(80.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "🌌",
                                fontSize = 48.sp
                            )
                        }
                        androidx.compose.foundation.layout.Spacer(modifier = Modifier.padding(16.dp))
                        Text(
                            text = "Ubiverse",
                            fontSize = 28.sp,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.primary
                        )
                        androidx.compose.foundation.layout.Spacer(modifier = Modifier.padding(8.dp))
                        Text(
                            text = "An Endless Possibility",
                            fontSize = 16.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        androidx.compose.foundation.layout.Spacer(modifier = Modifier.padding(24.dp))
                        GoogleSignInButton(onClick = onSignInClick)
                    }
                }
            }
        }
    }
}
