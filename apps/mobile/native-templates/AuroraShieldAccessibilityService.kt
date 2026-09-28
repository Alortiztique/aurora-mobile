package app.miaurora

import android.accessibilityservice.AccessibilityService
import android.content.Context
import android.content.Intent
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import android.widget.Toast

class AuroraShieldAccessibilityService : AccessibilityService() {

    companion object {
        private var lastInterceptTimestamp = 0L
        private const val INTERCEPT_COOLDOWN_MS = 2000L

        private val BROWSER_PACKAGES = setOf(
            "com.android.chrome",
            "com.chrome.beta",
            "com.chrome.dev",
            "com.chrome.canary",
            "com.sec.android.app.sbrowser",
            "com.sec.android.app.sbrowser.beta",
            "org.mozilla.firefox",
            "org.mozilla.firefox_beta",
            "org.mozilla.fenix",
            "com.brave.browser",
            "com.brave.browser_nightly",
            "com.brave.browser_beta",
            "com.microsoft.emmx",
            "com.opera.browser",
            "com.opera.mini.native",
            "com.opera.touch",
            "com.duckduckgo.mobile.android",
            "com.kiwibrowser.browser",
            "com.vivaldi.browser",
            "com.ecosia.android",
            "com.coloros.browser",
            "com.heytap.browser",
            "com.mi.globalbrowser"
        )

        private val DOOMSCROLL_PACKAGES = setOf(
            "com.facebook.katana",
            "com.facebook.lite",
            "com.facebook.orca",
            "com.facebook.mlite",
            "com.instagram.android",
            "com.instagram.lite",
            "com.instagram.barcelona",
            "com.zhiliaoapp.musically",
            "com.ss.android.ugc.trill",
            "com.ss.android.ugc.aweme",
            "com.ss.android.ugc.aweme.lite",
            "com.twitter.android",
            "com.twitter.android.lite",
            "com.reddit.frontpage",
            "com.snapchat.android",
            "com.pinterest"
        )

        private val CRAVINGS_PACKAGES = setOf(
            "com.ubercab.eats",
            "com.grability.rappi",
            "com.mcdonalds.app",
            "com.pedidosya",
            "com.glovo",
            "com.didi.passenger",
            "com.dd.doordash",
            "com.grubhub.android"
        )

        private val ADULT_PATTERNS = listOf(
            "pornhub",
            "xvideos",
            "xnxx",
            "xhamster",
            "redtube",
            "youporn",
            "chaturbate",
            "stripchat",
            "onlyfans",
            "fansly",
            "camsoda",
            "livejasmin",
            "rule34",
            "nhentai",
            "spankbang",
            "brazzers",
            "bangbros",
            "eporner",
            "xcafe",
            "beeg",
            "tnaflix",
            "heavy-r",
            "slutload",
            "hentaihaven",
            "daftsex",
            "tube8",
            "txxx",
            "javhd",
            "erome",
            "fapello",
            "hqporner",
            "motherless",
            "adultfriendfinder",
            "fuq.com",
            "cam4",
            "bongacams",
            "myfreecams",
            "camwhores",
            "thothub",
            "coomer.party",
            "coomer.su",
            "kemono.party",
            "kemono.su",
            "pornpics"
        )

        private val DOOMSCROLL_PATTERNS = listOf(
            "facebook.com",
            "m.facebook.com",
            "fb.com",
            "fb.watch",
            "instagram.com",
            "tiktok.com",
            "twitter.com",
            "x.com",
            "reddit.com",
            "threads.net",
            "youtube.com/shorts",
            "snapchat.com",
            "pinterest.com"
        )

        private val CRAVINGS_PATTERNS = listOf(
            "ubereats.com",
            "rappi.com",
            "pedidosya.com",
            "mcdonalds.com",
            "dominos.com",
            "burgerking.com",
            "doordash.com",
            "grubhub.com"
        )
    }

    private val mainHandler = Handler(Looper.getMainLooper())

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null) return

        val pkgName = event.packageName?.toString() ?: return
        val now = SystemClock.elapsedRealtime()
        if (now - lastInterceptTimestamp < INTERCEPT_COOLDOWN_MS) return

        // Read dynamic user preferences from SharedPreferences
        val prefs = getSharedPreferences("aurora_shield_settings", Context.MODE_PRIVATE)
        val blockPorn = prefs.getBoolean("block_porn", true)
        val blockDoomscroll = prefs.getBoolean("block_doomscroll", false)
        val blockCravings = prefs.getBoolean("block_cravings", false)
        val customSitesStr = prefs.getString("custom_sites", "") ?: ""
        val customSitesList = customSitesStr.split(",")
            .map { it.trim().lowercase() }
            .filter { it.isNotEmpty() }

        // 1. Direct App package interceptions
        if (blockDoomscroll && DOOMSCROLL_PACKAGES.contains(pkgName)) {
            lastInterceptTimestamp = now
            interceptAccess(pkgName, "doomscroll")
            return
        }

        if (blockCravings && CRAVINGS_PACKAGES.contains(pkgName)) {
            lastInterceptTimestamp = now
            interceptAccess(pkgName, "cravings")
            return
        }

        if (customSitesList.isNotEmpty()) {
            val lowerPkg = pkgName.lowercase()
            for (customPattern in customSitesList) {
                if (lowerPkg.contains(customPattern)) {
                    lastInterceptTimestamp = now
                    interceptAccess(pkgName, "custom")
                    return
                }
            }
        }

        // 2. Browser URL and Content Inspection
        if (!BROWSER_PACKAGES.contains(pkgName)) return

        // Inspect direct event text
        val eventTexts = event.text
        if (eventTexts != null) {
            for (t in eventTexts) {
                val str = t?.toString() ?: continue
                val match = findMatch(str, blockPorn, blockDoomscroll, blockCravings, customSitesList)
                if (match != null) {
                    lastInterceptTimestamp = now
                    interceptAccess(match.first, match.second)
                    return
                }
            }
        }

        // Inspect event content description
        val desc = event.contentDescription?.toString()
        if (desc != null) {
            val match = findMatch(desc, blockPorn, blockDoomscroll, blockCravings, customSitesList)
            if (match != null) {
                lastInterceptTimestamp = now
                interceptAccess(match.first, match.second)
                return
            }
        }

        // Inspect source node
        val source = event.source
        if (source != null) {
            try {
                val match = inspectNode(source, 0, blockPorn, blockDoomscroll, blockCravings, customSitesList)
                if (match != null) {
                    lastInterceptTimestamp = now
                    interceptAccess(match.first, match.second)
                    return
                }
            } finally {
                source.recycle()
            }
        }

        // Inspect full active window hierarchy
        val rootNode = rootInActiveWindow
        if (rootNode != null) {
            try {
                val match = inspectNode(rootNode, 0, blockPorn, blockDoomscroll, blockCravings, customSitesList)
                if (match != null) {
                    lastInterceptTimestamp = now
                    interceptAccess(match.first, match.second)
                    return
                }
            } finally {
                rootNode.recycle()
            }
        }
    }

    private fun findMatch(
        raw: String,
        blockPorn: Boolean,
        blockDoomscroll: Boolean,
        blockCravings: Boolean,
        customSitesList: List<String>
    ): Pair<String, String>? {
        val s = raw.lowercase().trim()
        if (s.isEmpty()) return null

        if (customSitesList.isNotEmpty()) {
            for (pattern in customSitesList) {
                if (s.contains(pattern)) return Pair(pattern, "custom")
            }
        }

        if (blockPorn) {
            for (pattern in ADULT_PATTERNS) {
                if (s.contains(pattern)) return Pair(pattern, "porn")
            }
            if (s.contains(".xxx") || s.contains("xxx.") || s.contains("/porno") ||
                s.contains("porno.") || s.contains(".porn") || s.contains("/porn")) {
                return Pair("adult_url", "porn")
            }
        }

        if (blockDoomscroll) {
            for (pattern in DOOMSCROLL_PATTERNS) {
                if (s.contains(pattern)) return Pair(pattern, "doomscroll")
            }
        }

        if (blockCravings) {
            for (pattern in CRAVINGS_PATTERNS) {
                if (s.contains(pattern)) return Pair(pattern, "cravings")
            }
        }

        return null
    }

    private fun inspectNode(
        node: AccessibilityNodeInfo,
        depth: Int,
        blockPorn: Boolean,
        blockDoomscroll: Boolean,
        blockCravings: Boolean,
        customSitesList: List<String>
    ): Pair<String, String>? {
        if (depth > 25) return null

        val text = node.text?.toString()
        if (text != null) {
            val match = findMatch(text, blockPorn, blockDoomscroll, blockCravings, customSitesList)
            if (match != null) return match
        }

        val desc = node.contentDescription?.toString()
        if (desc != null) {
            val match = findMatch(desc, blockPorn, blockDoomscroll, blockCravings, customSitesList)
            if (match != null) return match
        }

        val count = node.childCount
        for (i in 0 until count) {
            val child = node.getChild(i) ?: continue
            val found = inspectNode(child, depth + 1, blockPorn, blockDoomscroll, blockCravings, customSitesList)
            child.recycle()
            if (found != null) return found
        }

        return null
    }

    private fun interceptAccess(detectedPattern: String, category: String) {
        // 1. Kick user out to Android home screen immediately
        performGlobalAction(GLOBAL_ACTION_HOME)

        // Increment persistent native block counter in SharedPreferences
        try {
            val prefs = getSharedPreferences("aurora_shield_settings", Context.MODE_PRIVATE)
            val currentBlocks = prefs.getInt("total_blocks_count", 0) + 1
            prefs.edit().putInt("total_blocks_count", currentBlocks).apply()
        } catch (_: Exception) {}

        val categoryMessage = when (category) {
            "doomscroll" -> "🛡️ Aurora Shield: Doomscrolling interceptado"
            "cravings" -> "🛡️ Aurora Shield: Impulso de comida rápida neutralizado"
            "custom" -> "🛡️ Aurora Shield: Sitio o app personalizada interceptada"
            else -> "🛡️ Aurora Shield: Contenido para adultos interceptado"
        }

        // 2. Show clear feedback on MainLooper
        mainHandler.post {
            try {
                Toast.makeText(
                    applicationContext,
                    "$categoryMessage ($detectedPattern)",
                    Toast.LENGTH_LONG
                ).show()
            } catch (_: Exception) {}
        }

        // 3. Bring Aurora App to the foreground with SOS urge intervention
        try {
            val intent = Intent(this, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or
                        Intent.FLAG_ACTIVITY_CLEAR_TOP or
                        Intent.FLAG_ACTIVITY_SINGLE_TOP
                data = android.net.Uri.parse("auroraapp://shield-sos?blocked_pattern=$detectedPattern&category=$category")
                putExtra("aurora_action", "intercept_sos")
                putExtra("blocked_pattern", detectedPattern)
                putExtra("category", category)
            }
            startActivity(intent)
        } catch (_: Exception) {}
    }

    override fun onInterrupt() {
        // Service interrupted by user or system
    }
}
