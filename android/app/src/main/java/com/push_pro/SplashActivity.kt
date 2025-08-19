package com.push_pro

import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.View
import android.view.animation.AnimationUtils
import androidx.appcompat.app.AppCompatActivity

class SplashActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            // For Android 12+ (API 31+), directly start MainActivity
            startActivity(Intent(this, MainActivity::class.java))
            finish()
            return
        }

        // For Android 11 and below, show custom splash screen
        setContentView(R.layout.launch_screen)

        // Apply fade-in animation
        val fadeIn = AnimationUtils.loadAnimation(this, R.anim.fade_in)
        findViewById<View>(android.R.id.content).startAnimation(fadeIn)

        Handler(Looper.getMainLooper()).postDelayed({
            startActivity(Intent(this, MainActivity::class.java))
            finish()
        }, 2000) // 2 seconds delay
    }
}
