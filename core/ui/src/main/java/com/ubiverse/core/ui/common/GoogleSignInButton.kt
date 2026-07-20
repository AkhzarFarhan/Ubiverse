package com.ubiverse.core.ui.common

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun GoogleSignInButton(
    onClick: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    Button(
        onClick = { onClick("dummy_google_id_token") },
        modifier = modifier.padding(8.dp)
    ) {
        Text(text = "Sign in with Google")
    }
}
