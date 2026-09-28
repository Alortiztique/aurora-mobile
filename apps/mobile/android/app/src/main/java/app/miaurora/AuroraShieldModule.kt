package app.miaurora

import android.content.Context
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class AuroraShieldModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "AuroraShieldNative"

    @ReactMethod
    fun updateShieldSettings(porn: Boolean, doomscroll: Boolean, cravings: Boolean) {
        updateShieldSettingsWithCustom(porn, doomscroll, cravings, "")
    }

    @ReactMethod
    fun updateShieldSettingsWithCustom(porn: Boolean, doomscroll: Boolean, cravings: Boolean, customSites: String) {
        val prefs = reactContext.getSharedPreferences("aurora_shield_settings", Context.MODE_PRIVATE)
        prefs.edit()
            .putBoolean("block_porn", porn)
            .putBoolean("block_doomscroll", doomscroll)
            .putBoolean("block_cravings", cravings)
            .putString("custom_sites", customSites)
            .apply()
    }

    @ReactMethod
    fun getBlockStats(promise: com.facebook.react.bridge.Promise) {
        try {
            val prefs = reactContext.getSharedPreferences("aurora_shield_settings", Context.MODE_PRIVATE)
            val blocks = prefs.getInt("total_blocks_count", 0)
            promise.resolve(blocks)
        } catch (e: Exception) {
            promise.resolve(0)
        }
    }
}
