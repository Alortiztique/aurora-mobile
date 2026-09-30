import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const mobileDir = path.resolve('c:/dev/aurora-mobile');
const outDir = path.join(mobileDir, 'store-assets');
const coreStoreDir = path.resolve('c:/dev/Aurora-App/store-assets');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Convert logo to base64 for embedding in SVGs
const logoBase64 = fs.readFileSync(path.join(mobileDir, 'apps/mobile/assets/aurora-logo.png')).toString('base64');
const logoDataUri = `data:image/png;base64,${logoBase64}`;

// Helper: Status Bar (1179 x 120)
const statusBarSvg = `
  <g id="status-bar">
    <text x="70" y="82" fill="#F0EEF6" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="600" letter-spacing="-0.5">9:41</text>
    <rect x="464" y="32" width="250" height="74" rx="37" fill="#000000" />
    <g transform="translate(1010, 56)" fill="#F0EEF6">
      <rect x="0" y="16" width="6" height="12" rx="2"/>
      <rect x="10" y="12" width="6" height="16" rx="2"/>
      <rect x="20" y="8" width="6" height="20" rx="2"/>
      <rect x="30" y="4" width="6" height="24" rx="2"/>
      <rect x="52" y="4" width="46" height="24" rx="7" fill="none" stroke="#F0EEF6" stroke-width="3"/>
      <rect x="56" y="8" width="34" height="16" rx="4" fill="#4ADE80"/>
      <path d="M100 12 C102 12, 102 14, 102 16 L102 18 C102 20, 102 22, 100 22" fill="#F0EEF6"/>
    </g>
  </g>
`;

// Helper: 4-Tab Native Bottom Navigation Bar (Obsidian Paper Brutalism)
const navBarSvg = (activeTab = 'home') => `
  <g id="bottom-nav">
    <rect x="0" y="2350" width="1179" height="206" fill="#0C0A14" stroke="#261C36" stroke-width="1.5"/>
    <!-- Home Tab -->
    <g transform="translate(147, 2375)" opacity="${activeTab === 'home' ? '1.0' : '0.45'}">
      <circle cx="28" cy="26" r="16" fill="none" stroke="${activeTab === 'home' ? '#D7A4FF' : '#A59DB5'}" stroke-width="4"/>
      <text x="28" y="76" fill="${activeTab === 'home' ? '#D7A4FF' : '#A59DB5'}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="${activeTab === 'home' ? '700' : '500'}" text-anchor="middle">Home</text>
    </g>
    <!-- Map Tab -->
    <g transform="translate(441, 2375)" opacity="${activeTab === 'map' ? '1.0' : '0.45'}">
      <circle cx="28" cy="22" r="12" fill="none" stroke="${activeTab === 'map' ? '#42C7F5' : '#A59DB5'}" stroke-width="4"/>
      <path d="M28 34 L28 46" stroke="${activeTab === 'map' ? '#42C7F5' : '#A59DB5'}" stroke-width="4"/>
      <text x="28" y="76" fill="${activeTab === 'map' ? '#42C7F5' : '#A59DB5'}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="${activeTab === 'map' ? '700' : '500'}" text-anchor="middle">Map</text>
    </g>
    <!-- Community Tab -->
    <g transform="translate(735, 2375)" opacity="${activeTab === 'community' ? '1.0' : '0.45'}">
      <circle cx="18" cy="22" r="10" fill="none" stroke="${activeTab === 'community' ? '#42C7F5' : '#A59DB5'}" stroke-width="3.5"/>
      <circle cx="38" cy="22" r="10" fill="none" stroke="${activeTab === 'community' ? '#42C7F5' : '#A59DB5'}" stroke-width="3.5"/>
      <path d="M6 44 C6 35, 30 35, 30 44" fill="none" stroke="${activeTab === 'community' ? '#42C7F5' : '#A59DB5'}" stroke-width="3.5"/>
      <text x="28" y="76" fill="${activeTab === 'community' ? '#42C7F5' : '#A59DB5'}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="${activeTab === 'community' ? '700' : '500'}" text-anchor="middle">Community</text>
    </g>
    <!-- Shield Tab -->
    <g transform="translate(1029, 2375)" opacity="${activeTab === 'shield' ? '1.0' : '0.45'}">
      <polygon points="28,6 48,16 48,36 28,46 8,36 8,16" fill="none" stroke="${activeTab === 'shield' ? '#D7A4FF' : '#A59DB5'}" stroke-width="4"/>
      <text x="28" y="76" fill="${activeTab === 'shield' ? '#D7A4FF' : '#A59DB5'}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="${activeTab === 'shield' ? '700' : '500'}" text-anchor="middle">Shield</text>
    </g>
    <!-- Home indicator bar -->
    <rect x="419" y="2510" width="340" height="10" rx="5" fill="#FFFFFF" opacity="0.3"/>
  </g>
`;

// SCREENSHOT 1: Home (Neural Clarity Sphere, Metrics & SOS Urge Interceptor)
const svgScreenshot1 = `
<svg width="1179" height="2556" viewBox="0 0 1179 2556" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#08070C"/>
      <stop offset="50%" stop-color="#110C1E"/>
      <stop offset="100%" stop-color="#08070C"/>
    </linearGradient>
    <radialGradient id="sphereGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#42C7F5" stop-opacity="0.8"/>
      <stop offset="55%" stop-color="#1B142F" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#08070C" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="sosGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6E3FF2"/>
      <stop offset="100%" stop-color="#48259A"/>
    </linearGradient>
  </defs>

  <rect width="1179" height="2556" fill="url(#bgGrad1)"/>
  ${statusBarSvg}

  <!-- Header Section with Official Avatar & Support Pill -->
  <g transform="translate(70, 150)">
    <clipPath id="logoClip">
      <circle cx="40" cy="40" r="40"/>
    </clipPath>
    <image href="${logoDataUri}" x="0" y="0" width="80" height="80" clip-path="url(#logoClip)" />
    
    <text x="100" y="32" fill="#8E85A8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="700" letter-spacing="2">AURORA APP</text>
    <text x="100" y="68" fill="#F0EEF6" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="800">Sovereign Clarity</text>

    <!-- Support Pill (RevenueCat Entry) -->
    <rect x="760" y="10" width="190" height="60" rx="30" fill="#181226" stroke="#3D295C" stroke-width="2"/>
    <text x="855" y="48" fill="#42C7F5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="700" text-anchor="middle">👑 SUPPORT</text>

    <!-- Settings Button -->
    <rect x="970" y="10" width="60" height="60" rx="18" fill="#181226" stroke="#3D295C" stroke-width="2"/>
    <circle cx="1000" cy="40" r="10" fill="none" stroke="#F0EEF6" stroke-width="3"/>
  </g>

  <!-- Metrics Row: Blocks, Streak, Reclaimed -->
  <g transform="translate(70, 270)">
    <!-- Blocks -->
    <rect x="0" y="0" width="320" height="150" rx="24" fill="#130F1E" stroke="#251C36" stroke-width="1.5"/>
    <text x="30" y="46" fill="#42C7F5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="700">🛡️ Blocks</text>
    <text x="30" y="115" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="54" font-weight="800">18</text>

    <!-- Clean Streak -->
    <rect x="359" y="0" width="320" height="150" rx="24" fill="#1A112A" stroke="#794BBE" stroke-width="2"/>
    <text x="389" y="46" fill="#D7A4FF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="700">🔥 Streak</text>
    <text x="389" y="115" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="54" font-weight="800">14<tspan font-size="32" fill="#D7A4FF">d</tspan></text>
    <text x="490" y="110" fill="#4ADE80" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="600">Clean days</text>

    <!-- Reclaimed Hours -->
    <rect x="719" y="0" width="320" height="150" rx="24" fill="#130F1E" stroke="#251C36" stroke-width="1.5"/>
    <text x="749" y="46" fill="#4ADE80" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="700">✨ Reclaimed</text>
    <text x="749" y="115" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="54" font-weight="800">24<tspan font-size="32" fill="#4ADE80">h</tspan></text>
  </g>

  <!-- Hero: Neural Clarity Sphere (Centerpiece) -->
  <g transform="translate(589, 780)">
    <circle cx="0" cy="0" r="320" fill="url(#sphereGlow)"/>
    <circle cx="0" cy="0" r="280" fill="none" stroke="#42C7F5" stroke-opacity="0.2" stroke-width="3" stroke-dasharray="12 8"/>
    <circle cx="0" cy="0" r="240" fill="none" stroke="#D7A4FF" stroke-opacity="0.3" stroke-width="2.5"/>
    <circle cx="0" cy="0" r="200" fill="#120D22" stroke="#42C7F5" stroke-width="4"/>

    <!-- Orbital Indicator Node -->
    <circle cx="160" cy="-120" r="14" fill="#42C7F5"/>
    <circle cx="160" cy="-120" r="24" fill="#42C7F5" fill-opacity="0.3"/>

    <!-- Inner Phase Typography -->
    <text x="0" y="-70" fill="#42C7F5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" letter-spacing="3" text-anchor="middle">PHASE II · CLARITY</text>
    <text x="0" y="30" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="110" font-weight="900" text-anchor="middle">14<tspan font-size="54" fill="#42C7F5">d</tspan></text>
    <text x="0" y="85" fill="#B5AED1" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="600" letter-spacing="1" text-anchor="middle">MENTAL CLARITY</text>
  </g>

  <!-- Neurobiological Recovery Phase Card -->
  <g transform="translate(70, 1150)">
    <rect x="0" y="0" width="1039" height="150" rx="26" fill="#130F20" stroke="#2B1E40" stroke-width="1.5"/>
    <circle cx="44" cy="46" r="8" fill="#42C7F5"/>
    <text x="64" y="52" fill="#42C7F5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="700">Receptor Regeneration</text>
    <text x="44" y="100" fill="#B5AED1" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="25" font-weight="400">
      Days 4 to 14: Dopamine D2 receptor upregulation, restorative REM sleep recovery &amp; calm attention.
    </text>
  </g>

  <!-- Locked Core Commitment Card -->
  <g transform="translate(70, 1330)">
    <rect x="0" y="0" width="1039" height="130" rx="24" fill="#140D24" stroke="#42C7F5" stroke-width="1.5"/>
    <text x="40" y="44" fill="#D7A4FF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="800" letter-spacing="2">🔒 YOUR CORE COMMITMENT</text>
    <text x="40" y="88" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-style="italic" font-weight="600">
      “I deserve mental peace and respect in my daily life”
    </text>
  </g>

  <!-- Solid Tactile Urgent SOS Button: Overcome Urge Now (SOS) -->
  <g transform="translate(70, 1490)">
    <rect x="0" y="0" width="1039" height="170" rx="30" fill="url(#sosGrad)" stroke="#8A57FF" stroke-width="2.5"/>
    <g transform="translate(45, 45)">
      <polygon points="35,10 65,22 65,55 35,75 5,55 5,22" fill="#FFFFFF" fill-opacity="0.2" stroke="#FFFFFF" stroke-width="4"/>
      <line x1="35" y1="28" x2="35" y2="46" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round"/>
      <circle cx="35" cy="56" r="3" fill="#FFFFFF"/>
    </g>
    <text x="140" y="70" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="38" font-weight="800">Overcome Urge Now (SOS)</text>
    <text x="140" y="118" fill="#E0D7FF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="25" font-weight="500">
      Tap here if feeling a craving, porn trigger, or compulsive doomscroll
    </text>
  </g>

  <!-- Quick Action Hub: Live Map, Community, Shield -->
  <g transform="translate(70, 1690)">
    <!-- Map Button -->
    <rect x="0" y="0" width="320" height="120" rx="24" fill="#130F1E" stroke="#42C7F5" stroke-width="1.5"/>
    <circle cx="60" cy="60" r="24" fill="#162738"/>
    <text x="60" y="68" fill="#42C7F5" font-size="24" text-anchor="middle">📍</text>
    <text x="105" y="68" fill="#42C7F5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="700">Live Map</text>

    <!-- Community Button -->
    <rect x="359" y="0" width="320" height="120" rx="24" fill="#130F1E" stroke="#251C36" stroke-width="1.5"/>
    <circle cx="419" cy="60" r="24" fill="#241433"/>
    <text x="419" y="68" fill="#D7A4FF" font-size="24" text-anchor="middle">👥</text>
    <text x="464" y="68" fill="#D7A4FF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="700">Community</text>

    <!-- Shield Button -->
    <rect x="719" y="0" width="320" height="120" rx="24" fill="#130F1E" stroke="#251C36" stroke-width="1.5"/>
    <circle cx="779" cy="60" r="24" fill="#221C30"/>
    <text x="779" y="68" fill="#FFFFFF" font-size="24" text-anchor="middle">🛡️</text>
    <text x="824" y="68" fill="#F0EEF6" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="700">Shield</text>
  </g>

  <!-- Weekly Agency Evolution Chart -->
  <g transform="translate(70, 1840)">
    <rect x="0" y="0" width="1039" height="230" rx="28" fill="#100C1A" stroke="#251C36" stroke-width="1.5"/>
    <text x="40" y="52" fill="#42C7F5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="700">✨ Weekly Agency Evolution</text>
    
    <!-- 7 Day Bars -->
    <g transform="translate(50, 80)">
      <!-- Mon -->
      <rect x="0" y="10" width="80" height="90" rx="14" fill="#42C7F5"/>
      <text x="40" y="130" fill="#42C7F5" font-family="sans-serif" font-size="22" font-weight="700" text-anchor="middle">M</text>
      <!-- Tue -->
      <rect x="140" y="20" width="80" height="80" rx="14" fill="#42C7F5"/>
      <text x="180" y="130" fill="#42C7F5" font-family="sans-serif" font-size="22" font-weight="700" text-anchor="middle">T</text>
      <!-- Wed -->
      <rect x="280" y="5" width="80" height="95" rx="14" fill="#42C7F5"/>
      <text x="320" y="130" fill="#42C7F5" font-family="sans-serif" font-size="22" font-weight="700" text-anchor="middle">W</text>
      <!-- Thu -->
      <rect x="420" y="15" width="80" height="85" rx="14" fill="#42C7F5"/>
      <text x="460" y="130" fill="#42C7F5" font-family="sans-serif" font-size="22" font-weight="700" text-anchor="middle">T</text>
      <!-- Fri -->
      <rect x="560" y="0" width="80" height="100" rx="14" fill="#4ADE80"/>
      <text x="600" y="130" fill="#4ADE80" font-family="sans-serif" font-size="22" font-weight="700" text-anchor="middle">F</text>
      <!-- Sat -->
      <rect x="700" y="0" width="80" height="100" rx="14" fill="#4ADE80"/>
      <text x="740" y="130" fill="#4ADE80" font-family="sans-serif" font-size="22" font-weight="700" text-anchor="middle">S</text>
      <!-- Sun -->
      <rect x="840" y="0" width="80" height="100" rx="14" fill="#D7A4FF"/>
      <text x="880" y="130" fill="#D7A4FF" font-family="sans-serif" font-size="22" font-weight="700" text-anchor="middle">S</text>
    </g>
  </g>

  <!-- Open-Source Note -->
  <g transform="translate(70, 2100)">
    <rect x="0" y="0" width="1039" height="110" rx="22" fill="#0C1524" stroke="#1D3E5E" stroke-width="1.5"/>
    <text x="40" y="46" fill="#42C7F5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="700">Open-Source Sanctuary • Next Gen Track</text>
    <text x="40" y="84" fill="#8CB3D9" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="400">Restoring human attention with science-backed neurobiology and zero surveillance.</text>
  </g>

  ${navBarSvg('home')}
</svg>
`;

// SCREENSHOT 2: Shield Tab (Multi-Vector Habit Shield, Deliberate Friction & Accessibility Service)
const svgScreenshot2 = `
<svg width="1179" height="2556" viewBox="0 0 1179 2556" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#08070C"/>
      <stop offset="45%" stop-color="#140C24"/>
      <stop offset="100%" stop-color="#08070C"/>
    </linearGradient>
  </defs>

  <rect width="1179" height="2556" fill="url(#bgGrad2)"/>
  ${statusBarSvg}

  <!-- Header -->
  <g transform="translate(70, 160)">
    <text x="0" y="44" fill="#D7A4FF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="700" letter-spacing="3">AURORA SHIELD • HABIT DEFENSE</text>
    <text x="0" y="112" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="56" font-weight="800">Multi-Vector Habit Shield</text>
    <text x="0" y="165" fill="#B5AED1" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="400">
      Active protection against pornography, doomscrolling feeds &amp; binge food cravings.
    </text>
  </g>

  <!-- Protection Status Badge -->
  <g transform="translate(70, 380)">
    <rect x="0" y="0" width="1039" height="130" rx="26" fill="#111F19" stroke="#22543D" stroke-width="2"/>
    <circle cx="50" cy="65" r="22" fill="#22543D"/>
    <text x="50" y="73" fill="#4ADE80" font-size="22" text-anchor="middle">✓</text>
    <text x="95" y="54" fill="#4ADE80" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="800">SYSTEM SHIELD ACTIVE</text>
    <text x="95" y="94" fill="#86EFAC" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="400">Android Accessibility Service: On-device interception • 0KB data leaves device</text>
  </g>

  <!-- Vector 1: Pornography Blocker -->
  <g transform="translate(70, 540)">
    <rect x="0" y="0" width="1039" height="210" rx="28" fill="#140E24" stroke="#794BBE" stroke-width="2"/>
    <text x="40" y="58" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="700">🔒 Adult &amp; Pornography Filter</text>
    <text x="40" y="105" fill="#B5AED1" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="400">
      Blocks explicit websites, private browsing loops, and high-novelty sexual triggers.
    </text>
    <!-- Toggle Switch ON -->
    <rect x="880" y="35" width="110" height="60" rx="30" fill="#4ADE80"/>
    <circle cx="955" cy="65" r="24" fill="#FFFFFF"/>
    <text x="40" y="165" fill="#4ADE80" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="700">● ACTIVE • D2 Receptor Recovery Shield</text>
  </g>

  <!-- Vector 2: Doomscrolling & Infinite Feeds -->
  <g transform="translate(70, 780)">
    <rect x="0" y="0" width="1039" height="210" rx="28" fill="#140E24" stroke="#251C36" stroke-width="1.5"/>
    <text x="40" y="58" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="700">📱 Doomscrolling &amp; Infinite Feeds</text>
    <text x="40" y="105" fill="#B5AED1" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="400">
      Interrupts compulsive short-form video reels, algorithmic feeds, and endless scrolling.
    </text>
    <!-- Toggle Switch ON -->
    <rect x="880" y="35" width="110" height="60" rx="30" fill="#4ADE80"/>
    <circle cx="955" cy="65" r="24" fill="#FFFFFF"/>
    <text x="40" y="165" fill="#42C7F5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="700">● ACTIVE • 5-Second Conscious Intercept Delay</text>
  </g>

  <!-- Vector 3: Binge Food Cravings -->
  <g transform="translate(70, 1020)">
    <rect x="0" y="0" width="1039" height="210" rx="28" fill="#140E24" stroke="#251C36" stroke-width="1.5"/>
    <text x="40" y="58" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="700">🍽️ Late-Night Binge &amp; Food Cravings</text>
    <text x="40" y="105" fill="#B5AED1" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="400">
      Restricts impulsive midnight delivery apps and ultra-processed food cue triggers.
    </text>
    <!-- Toggle Switch ON -->
    <rect x="880" y="35" width="110" height="60" rx="30" fill="#4ADE80"/>
    <circle cx="955" cy="65" r="24" fill="#FFFFFF"/>
    <text x="40" y="165" fill="#D7A4FF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="700">● ACTIVE • Night Window Lock</text>
  </g>

  <!-- The Psychological Innovation: Deliberate Friction Intervention -->
  <g transform="translate(70, 1260)">
    <rect x="0" y="0" width="1039" height="360" rx="30" fill="#1C112C" stroke="#794BBE" stroke-width="2.5"/>
    <text x="44" y="60" fill="#D7A4FF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" letter-spacing="2">⚠️ DELIBERATE FRICTION DEFENSE</text>
    <text x="44" y="112" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="36" font-weight="800">Conscious Relapse Interruption</text>
    <text x="44" y="165" fill="#B5AED1" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="25" font-weight="400">
      To disable any protection, you must manually type your full personal commitment:
    </text>
    
    <!-- Commitment Input Simulation Box -->
    <rect x="44" y="195" width="950" height="85" rx="18" fill="#0C0717" stroke="#3D295C" stroke-width="2"/>
    <text x="70" y="248" fill="#4ADE80" font-family="monospace" font-size="26" font-weight="600">
      “I deserve mental peace and respect in my daily life”
    </text>

    <text x="44" y="325" fill="#A59DB5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="500">
      Eliminates impulsive overrides during 3-5 minute neurochemical craving spikes.
    </text>
  </g>

  <!-- Custom Domain Blocklist Section -->
  <g transform="translate(70, 1650)">
    <rect x="0" y="0" width="1039" height="310" rx="28" fill="#100C1B" stroke="#251C36" stroke-width="1.5"/>
    <text x="40" y="52" fill="#42C7F5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="700">🌐 Custom Domain Blocklist (4 Active)</text>
    
    <!-- Chips -->
    <g transform="translate(40, 80)">
      <rect x="0" y="0" width="210" height="60" rx="20" fill="#1C142B" stroke="#3D295C" stroke-width="1.5"/>
      <text x="30" y="38" fill="#FFFFFF" font-family="monospace" font-size="22">x.com ✕</text>

      <rect x="230" y="0" width="240" height="60" rx="20" fill="#1C142B" stroke="#3D295C" stroke-width="1.5"/>
      <text x="260" y="38" fill="#FFFFFF" font-family="monospace" font-size="22">tiktok.com ✕</text>

      <rect x="490" y="0" width="270" height="60" rx="20" fill="#1C142B" stroke="#3D295C" stroke-width="1.5"/>
      <text x="520" y="38" fill="#FFFFFF" font-family="monospace" font-size="22">instagram.com ✕</text>

      <rect x="0" y="80" width="230" height="60" rx="20" fill="#1C142B" stroke="#3D295C" stroke-width="1.5"/>
      <text x="30" y="118" fill="#FFFFFF" font-family="monospace" font-size="22">reddit.com ✕</text>

      <rect x="250" y="80" width="200" height="60" rx="20" fill="#122538" stroke="#42C7F5" stroke-width="1.5"/>
      <text x="280" y="118" fill="#42C7F5" font-family="sans-serif" font-size="22" font-weight="700">+ Add URL</text>
    </g>
  </g>

  <!-- Emergency Urge Button Access -->
  <g transform="translate(70, 1990)">
    <rect x="0" y="0" width="1039" height="120" rx="26" fill="#6E3FF2"/>
    <text x="519" y="74" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="800" text-anchor="middle">
      🚨 Launch SOS Urge Interceptor (3-Min Pause)
    </text>
  </g>

  <!-- Open-Source Student Guarantee -->
  <g transform="translate(70, 2140)">
    <text x="519" y="50" fill="#8E85A8" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="500" text-anchor="middle">
      Open-Source Client • Zero Paywalls On Core Sovereignty • Next Gen Track
    </text>
  </g>

  ${navBarSvg('shield')}
</svg>
`;

// SCREENSHOT 3: Map Tab (Live Mapbox Signals & 50m Privacy Quantization)
const svgScreenshot3 = `
<svg width="1179" height="2556" viewBox="0 0 1179 2556" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="mapVignette" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#08070C" stop-opacity="0.9"/>
      <stop offset="25%" stop-color="#08070C" stop-opacity="0.1"/>
      <stop offset="70%" stop-color="#08070C" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#08070C" stop-opacity="0.98"/>
    </linearGradient>
  </defs>

  <rect width="1179" height="2556" fill="#090710"/>

  <!-- Map Background (Dark Mapbox Streets Simulation) -->
  <g opacity="0.7">
    <path d="M0,450 L1179,520 M0,780 L1179,840 M0,1180 L1179,1220 M0,1540 L1179,1500" stroke="#161126" stroke-width="48"/>
    <path d="M260,0 L320,2556 M620,0 L660,2556 M940,0 L900,2556" stroke="#161126" stroke-width="52"/>
    <path d="M-100,1600 L1250,600" stroke="#1F1535" stroke-width="75"/>

    <rect x="70" y="570" width="160" height="180" rx="14" fill="#0E0A1A"/>
    <rect x="370" y="580" width="220" height="180" rx="14" fill="#0E0A1A"/>
    <rect x="720" y="600" width="190" height="180" rx="14" fill="#0E0A1A"/>
    <rect x="70" y="870" width="170" height="260" rx="14" fill="#0E0A1A"/>
    <rect x="380" y="890" width="210" height="240" rx="14" fill="#0E0A1A"/>
    <rect x="720" y="910" width="180" height="230" rx="14" fill="#0E0A1A"/>

    <!-- Street Labels -->
    <text x="320" y="810" fill="#4B3C68" font-family="sans-serif" font-size="22" font-weight="600">Carrera 7</text>
    <text x="640" y="870" fill="#4B3C68" font-family="sans-serif" font-size="22" font-weight="600">Park Way</text>
    <text x="80" y="1160" fill="#4B3C68" font-family="sans-serif" font-size="22" font-weight="600">Calle 39</text>
  </g>

  <!-- 50m Privacy Quantized Spatial Signals -->
  <!-- Signal 1: Safe Haven / Active Corridor -->
  <g transform="translate(680, 750)">
    <circle cx="0" cy="0" r="75" fill="#42C7F5" fill-opacity="0.15"/>
    <circle cx="0" cy="0" r="44" fill="#42C7F5" fill-opacity="0.3"/>
    <circle cx="0" cy="0" r="22" fill="#42C7F5"/>
    <rect x="35" y="-60" width="390" height="74" rx="20" fill="#110D20" stroke="#42C7F5" stroke-width="2"/>
    <text x="60" y="-16" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="700">Open Haven • Well-Lit (12m)</text>
  </g>

  <!-- Signal 2: Active Pedestrians -->
  <g transform="translate(340, 1050)">
    <circle cx="0" cy="0" r="65" fill="#4ADE80" fill-opacity="0.15"/>
    <circle cx="0" cy="0" r="38" fill="#4ADE80" fill-opacity="0.3"/>
    <circle cx="0" cy="0" r="18" fill="#4ADE80"/>
    <rect x="-330" y="-55" width="300" height="66" rx="18" fill="#110D20" stroke="#4ADE80" stroke-width="2"/>
    <text x="-310" y="-15" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="700">Active Pedestrians (8m)</text>
  </g>

  <!-- Signal 3: Caution Zone -->
  <g transform="translate(860, 1260)">
    <circle cx="0" cy="0" r="60" fill="#FBBF24" fill-opacity="0.15"/>
    <circle cx="0" cy="0" r="32" fill="#FBBF24" fill-opacity="0.3"/>
    <circle cx="0" cy="0" r="16" fill="#FBBF24"/>
    <rect x="-300" y="30" width="290" height="66" rx="18" fill="#110D20" stroke="#FBBF24" stroke-width="2"/>
    <text x="-280" y="70" fill="#FDE68A" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="700">Low Streetlighting (45m)</text>
  </g>

  <!-- Current User Location Marker -->
  <g transform="translate(520, 1180)">
    <circle cx="0" cy="0" r="95" fill="#D7A4FF" fill-opacity="0.15"/>
    <circle cx="0" cy="0" r="34" fill="#D7A4FF" stroke="#FFFFFF" stroke-width="4"/>
    <circle cx="0" cy="0" r="12" fill="#08070C"/>
  </g>

  <!-- Vignette -->
  <rect width="1179" height="2556" fill="url(#mapVignette)"/>
  ${statusBarSvg}

  <!-- Native Map Toolbar -->
  <g transform="translate(70, 150)">
    <rect x="0" y="0" width="1039" height="90" rx="26" fill="#110C1E" stroke="#251C36" stroke-width="1.5"/>
    <circle cx="45" cy="45" r="8" fill="#42C7F5"/>
    <text x="68" y="53" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="800">LIVE MAP • miaurora.app</text>
    
    <!-- Reload & Web Links -->
    <rect x="880" y="16" width="60" height="58" rx="16" fill="#1A122A" stroke="#3D295C" stroke-width="1.5"/>
    <text x="910" y="52" fill="#42C7F5" font-size="24" text-anchor="middle">↻</text>
    <rect x="955" y="16" width="60" height="58" rx="16" fill="#1A122A" stroke="#3D295C" stroke-width="1.5"/>
    <text x="985" y="52" fill="#B5AED1" font-size="24" text-anchor="middle">↗</text>
  </g>

  <!-- Filter Chips Bar -->
  <g transform="translate(70, 270)">
    <rect x="0" y="0" width="220" height="64" rx="32" fill="#42C7F5"/>
    <text x="110" y="42" fill="#08070C" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="700" text-anchor="middle">All Signals (12)</text>

    <rect x="240" y="0" width="210" height="64" rx="32" fill="#140F22" stroke="#2B213D" stroke-width="2"/>
    <circle cx="270" cy="32" r="8" fill="#4ADE80"/>
    <text x="350" y="42" fill="#E4E0EC" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="600" text-anchor="middle">Havens (8)</text>

    <rect x="470" y="0" width="250" height="64" rx="32" fill="#140F22" stroke="#2B213D" stroke-width="2"/>
    <circle cx="500" cy="32" r="8" fill="#FBBF24"/>
    <text x="600" y="42" fill="#E4E0EC" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="600" text-anchor="middle">Caution (4)</text>
  </g>

  <!-- Bottom Sheet Card: Privacy Architecture -->
  <g transform="translate(70, 1680)">
    <rect x="0" y="0" width="1039" height="620" rx="36" fill="#110D1D" stroke="#261C36" stroke-width="2"/>
    <rect x="459" y="24" width="120" height="8" rx="4" fill="#3D2E55"/>

    <text x="50" y="85" fill="#42C7F5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="700" letter-spacing="1.5">ZERO TRACKING • ETHICAL COMMONS</text>
    <text x="50" y="140" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="40" font-weight="800">50m Privacy-Preserving Safety</text>
    <text x="50" y="195" fill="#B5AED1" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="400">
      Map coordinates are quantized to a 50-meter grid in D1 Cloudflare. Zero user accounts, zero follower graphs, zero surveillance.
    </text>

    <!-- Signal Action Buttons -->
    <g transform="translate(50, 280)">
      <rect x="0" y="0" width="455" height="110" rx="28" fill="#1C142B" stroke="#794BBE" stroke-width="2"/>
      <text x="227" y="68" fill="#D7A4FF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="30" font-weight="700" text-anchor="middle">Share Walk Link</text>

      <rect x="485" y="0" width="455" height="110" rx="28" fill="#42C7F5"/>
      <text x="712" y="68" fill="#08070C" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="30" font-weight="700" text-anchor="middle">+ Leave Signal</text>
    </g>

    <!-- Recency Feed Item -->
    <g transform="translate(50, 430)">
      <rect x="0" y="0" width="940" height="140" rx="24" fill="#161125"/>
      <circle cx="50" cy="70" r="16" fill="#42C7F5"/>
      <text x="90" y="58" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="600">Commercial corridor active &amp; open</text>
      <text x="90" y="102" fill="#8E85A1" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="400">Carrera 7 con Calle 39 • Verified 12 mins ago</text>
      <rect x="790" y="46" width="115" height="48" rx="14" fill="#201533"/>
      <text x="847" y="78" fill="#4ADE80" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="700" text-anchor="middle">ACTIVE</text>
    </g>
  </g>

  ${navBarSvg('map')}
</svg>
`;

// SCREENSHOT 4: Paywall / RevenueCat Patron Commons
const svgScreenshot4 = `
<svg width="1179" height="2556" viewBox="0 0 1179 2556" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad4" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#08070C"/>
      <stop offset="35%" stop-color="#140D24"/>
      <stop offset="100%" stop-color="#08070C"/>
    </linearGradient>
  </defs>

  <rect width="1179" height="2556" fill="url(#bgGrad4)"/>
  ${statusBarSvg}

  <!-- Close Button -->
  <g transform="translate(1030, 160)">
    <circle cx="40" cy="40" r="32" fill="#181226" stroke="#2B213D" stroke-width="2"/>
    <text x="40" y="50" fill="#8E85A1" font-family="sans-serif" font-size="32" font-weight="600" text-anchor="middle">✕</text>
  </g>

  <!-- Paywall Hero Header -->
  <g transform="translate(70, 200)">
    <rect x="0" y="0" width="360" height="54" rx="27" fill="#201533" stroke="#794BBE" stroke-width="1.5"/>
    <circle cx="30" cy="27" r="7" fill="#D7A4FF"/>
    <text x="48" y="36" fill="#D7A4FF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="700" letter-spacing="1">REVENUECAT PATRON COMMONS</text>

    <text x="0" y="130" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="62" font-weight="800" letter-spacing="-1">Support the Commons</text>
    <text x="0" y="195" fill="#42C7F5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="32" font-weight="600">All core rescue &amp; habit shields are 100% free forever.</text>
    <text x="0" y="245" fill="#B5AED1" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="26" font-weight="400">Patron subscriptions keep Aurora independent and unmonetized by ads or data brokers.</text>
  </g>

  <!-- Tier 1: Guardian Annual (7-Day Trial) -->
  <g transform="translate(70, 520)">
    <rect x="0" y="0" width="1039" height="340" rx="32" fill="#140E24" stroke="#42C7F5" stroke-width="3"/>
    
    <rect x="760" y="-22" width="240" height="48" rx="24" fill="#42C7F5"/>
    <text x="880" y="10" fill="#08070C" font-family="sans-serif" font-size="22" font-weight="800" text-anchor="middle">7-DAY FREE TRIAL</text>

    <text x="50" y="80" fill="#FFFFFF" font-family="sans-serif" font-size="42" font-weight="700">Guardian Patron (Annual)</text>
    <text x="50" y="130" fill="#D7A4FF" font-family="sans-serif" font-size="52" font-weight="800">$19.99 <tspan fill="#8E85A1" font-size="28" font-weight="500">/ year ($1.66/mo)</tspan></text>

    <text x="50" y="200" fill="#4ADE80" font-family="sans-serif" font-size="28" font-weight="700">✓ <tspan fill="#E4E0EC" font-weight="500">Deep Neural Clarity custom spheres &amp; recovery telemetry</tspan></text>
    <text x="50" y="250" fill="#4ADE80" font-family="sans-serif" font-size="28" font-weight="700">✓ <tspan fill="#E4E0EC" font-weight="500">Subsidizes 50 free safety map nodes for vulnerable pedestrians</tspan></text>
    <text x="50" y="300" fill="#4ADE80" font-family="sans-serif" font-size="28" font-weight="700">✓ <tspan fill="#E4E0EC" font-weight="500">Exclusive Guardian Badge on your profile</tspan></text>
  </g>

  <!-- Tier 2: Pioneer Lifetime -->
  <g transform="translate(70, 910)">
    <rect x="0" y="0" width="1039" height="200" rx="28" fill="#100C1B" stroke="#261C36" stroke-width="2"/>
    <text x="50" y="70" fill="#FFFFFF" font-family="sans-serif" font-size="36" font-weight="700">Pioneer Lifetime Founder Pass</text>
    <text x="50" y="125" fill="#D7A4FF" font-family="sans-serif" font-size="44" font-weight="800">$39.99 <tspan fill="#8E85A1" font-size="26" font-weight="500">one-time payment</tspan></text>
    <text x="50" y="165" fill="#A59DB5" font-family="sans-serif" font-size="24" font-weight="400">Permanent founding benefactor • Never charged again</text>
  </g>

  <!-- RevenueCat Peace Prize Manifesto -->
  <g transform="translate(70, 1160)">
    <rect x="0" y="0" width="1039" height="260" rx="28" fill="#0C141D" stroke="#1D3E5E" stroke-width="2"/>
    <text x="50" y="60" fill="#42C7F5" font-family="sans-serif" font-size="26" font-weight="700" letter-spacing="1.5">THE REVENUECAT PEACE PRIZE MANIFESTO</text>
    <text x="50" y="112" fill="#D3E5F5" font-family="sans-serif" font-size="28" font-weight="500" font-style="italic">
      “Commercial software often profits by exploiting human vulnerability. Aurora inverts the incentive: voluntary patrons fund the platform so that crisis recovery tools and pedestrian safety remain free for everyone.”
    </text>
    <text x="50" y="220" fill="#8CB3D9" font-family="sans-serif" font-size="24" font-weight="600">Powered by RevenueCat Offerings &amp; Subscriptions Engine</text>
  </g>

  <!-- Hackathon Judge Pass Section (SHIPATON2026) -->
  <g transform="translate(70, 1470)">
    <rect x="0" y="0" width="1039" height="280" rx="28" fill="#171026" stroke="#794BBE" stroke-width="2"/>
    <text x="50" y="60" fill="#D7A4FF" font-family="sans-serif" font-size="26" font-weight="700" letter-spacing="1">HACKATHON JUDGE PASS (EVALUATION BYPASS)</text>
    <text x="50" y="105" fill="#FFFFFF" font-family="sans-serif" font-size="30" font-weight="600">Unlocked with Judge Pass: SHIPATON2026</text>
    
    <rect x="50" y="130" width="600" height="90" rx="20" fill="#0E091A" stroke="#3D2760" stroke-width="2"/>
    <text x="80" y="186" fill="#4ADE80" font-family="monospace" font-size="32" font-weight="700">SHIPATON2026</text>

    <rect x="675" y="130" width="314" height="90" rx="20" fill="#794BBE"/>
    <text x="832" y="186" fill="#FFFFFF" font-family="sans-serif" font-size="28" font-weight="700" text-anchor="middle">✓ UNLOCKED</text>

    <text x="50" y="250" fill="#A59DB5" font-family="sans-serif" font-size="22" font-weight="400">Judges can evaluate all Guardian &amp; Pioneer features without entering billing info.</text>
  </g>

  <!-- Start Free Trial Button -->
  <g transform="translate(70, 1800)">
    <rect x="0" y="0" width="1039" height="120" rx="32" fill="#42C7F5"/>
    <text x="519" y="74" fill="#08070C" font-family="sans-serif" font-size="36" font-weight="800" text-anchor="middle">Start 7-Day Free Trial</text>
  </g>

  <!-- Secondary Actions -->
  <g transform="translate(70, 1960)">
    <text x="260" y="40" fill="#A59DB5" font-family="sans-serif" font-size="26" font-weight="600" text-anchor="middle">Restore Purchases</text>
    <circle cx="519" cy="32" r="4" fill="#3D2E55"/>
    <text x="778" y="40" fill="#A59DB5" font-family="sans-serif" font-size="26" font-weight="600" text-anchor="middle">Privacy &amp; Terms</text>
  </g>

  ${navBarSvg('home')}
</svg>
`;

async function run() {
  console.log('Rendering 4 authentic English screenshots (1179 x 2556)...');
  
  const screens = [
    { name: 'screenshot-1-clarity-en-1179x2556.png', svg: svgScreenshot1 },
    { name: 'screenshot-2-shield-en-1179x2556.png', svg: svgScreenshot2 },
    { name: 'screenshot-3-map-en-1179x2556.png', svg: svgScreenshot3 },
    { name: 'screenshot-4-patron-en-1179x2556.png', svg: svgScreenshot4 },
  ];

  for (const s of screens) {
    const dest = path.join(outDir, s.name);
    await sharp(Buffer.from(s.svg)).png({ compressionLevel: 9 }).toFile(dest);
    console.log(`Rendered: ${s.name}`);
    if (fs.existsSync(coreStoreDir)) {
      fs.copyFileSync(dest, path.join(coreStoreDir, s.name));
    }
  }

  // Also update standard screenshot-1 and screenshot-2 in store-assets to English for store listings
  fs.copyFileSync(path.join(outDir, 'screenshot-1-clarity-en-1179x2556.png'), path.join(outDir, 'screenshot-1-soberania-1179x2556.png'));
  fs.copyFileSync(path.join(outDir, 'screenshot-2-shield-en-1179x2556.png'), path.join(outDir, 'screenshot-2-comunidad-1179x2556.png'));
  fs.copyFileSync(path.join(outDir, 'screenshot-3-map-en-1179x2556.png'), path.join(outDir, 'screenshot-3-mapa-1179x2556.png'));

  console.log('Now generating official 3:2 Devpost Thumbnail with new English screens...');

  const width = 2400;
  const height = 1600; // Exact 3:2 ratio
  const phoneH = 1220;
  const phoneW = Math.round((1179 / 2556) * phoneH); // ~563px
  const cornerRadius = 38;

  const maskSvg = Buffer.from(`
    <svg width="${phoneW}" height="${phoneH}">
      <rect x="0" y="0" width="${phoneW}" height="${phoneH}" rx="${cornerRadius}" ry="${cornerRadius}" fill="#ffffff"/>
    </svg>
  `);

  const borderSvg = Buffer.from(`
    <svg width="${phoneW}" height="${phoneH}">
      <rect x="1" y="1" width="${phoneW - 2}" height="${phoneH - 2}" rx="${cornerRadius}" ry="${cornerRadius}" fill="none" stroke="#362552" stroke-width="3"/>
    </svg>
  `);

  // Phone 1: Screenshot 1 (Home - Neural Clarity Sphere)
  const phone1Buffer = await sharp(path.join(outDir, 'screenshot-1-clarity-en-1179x2556.png'))
    .resize(phoneW, phoneH, { fit: 'cover' })
    .composite([
      { input: maskSvg, blend: 'dest-in' },
      { input: borderSvg, blend: 'over' }
    ])
    .png()
    .toBuffer();

  // Phone 2: Screenshot 2 (Shield - Multi-Vector Habit Shield)
  const phone2Buffer = await sharp(path.join(outDir, 'screenshot-2-shield-en-1179x2556.png'))
    .resize(phoneW, phoneH, { fit: 'cover' })
    .composite([
      { input: maskSvg, blend: 'dest-in' },
      { input: borderSvg, blend: 'over' }
    ])
    .png()
    .toBuffer();

  // Logo buffer
  const logoBuffer = await sharp(path.join(mobileDir, 'apps/mobile/assets/aurora-logo.png'))
    .resize(130, 130, { fit: 'contain' })
    .png()
    .toBuffer();

  // SVG Background & Typography Overlay (Zero AI-slop, crisp 1px borders, Obsidian dark)
  const textOverlaySvg = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bgGlow" cx="20%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#181126" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#08070C" stop-opacity="1"/>
        </radialGradient>
        <linearGradient id="cardGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1B132C"/>
          <stop offset="100%" stop-color="#100C1B"/>
        </linearGradient>
      </defs>

      <!-- Base Canvas Background -->
      <rect width="${width}" height="${height}" fill="url(#bgGlow)"/>

      <!-- Architectural Grid Lines -->
      <g stroke="#ffffff" stroke-opacity="0.03" stroke-width="1">
        <line x1="120" y1="0" x2="120" y2="${height}"/>
        <line x1="1140" y1="0" x2="1140" y2="${height}"/>
        <line x1="0" y1="180" x2="${width}" y2="180"/>
        <line x1="0" y1="1420" x2="${width}" y2="1420"/>
      </g>

      <!-- Competition Badge -->
      <g transform="translate(120, 150)">
        <rect width="460" height="48" rx="24" fill="#181328" stroke="#372652" stroke-width="1.5"/>
        <circle cx="28" cy="24" r="6" fill="#42C7F5"/>
        <text x="46" y="31" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="700" fill="#42C7F5" letter-spacing="1.5">REVENUECAT SHIPATON 2026</text>
      </g>

      <!-- App Title & Tagline -->
      <text x="120" y="460" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="84" font-weight="900" fill="#FFFFFF" letter-spacing="-1">Aurora App</text>
      <text x="120" y="530" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="34" font-weight="600" fill="#42C7F5" letter-spacing="0.5">Sovereign Clarity &amp; Urban Safety</text>

      <!-- Mission Statement (Accurate & Punchy) -->
      <text x="120" y="615" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="25" font-weight="400" fill="#B5AED1">
        An open-source mobile sanctuary restoring human agency
      </text>
      <text x="120" y="655" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="25" font-weight="400" fill="#B5AED1">
        against porn addiction, body dysmorphia, binge food triggers &amp; doomscrolling.
      </text>

      <!-- 4 Authentic Architectural Feature Cards (Accurate to current mobile app) -->
      <g transform="translate(120, 730)">
        <!-- Feature 1: Neural Clarity Sphere -->
        <g transform="translate(0, 0)">
          <rect width="450" height="76" rx="16" fill="url(#cardGlow)" stroke="#2C1F42" stroke-width="1.5"/>
          <text x="24" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="700" fill="#FFFFFF">Neural Clarity Sphere</text>
          <text x="24" y="58" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="400" fill="#8E85A8">5 neurobiological dopamine recovery phases</text>
        </g>

        <!-- Feature 2: Multi-Vector Habit Shield (ACCURATE: NO BOX BREATHING!) -->
        <g transform="translate(0, 96)">
          <rect width="450" height="76" rx="16" fill="url(#cardGlow)" stroke="#2C1F42" stroke-width="1.5"/>
          <text x="24" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="700" fill="#FFFFFF">Multi-Vector Habit Shield</text>
          <text x="24" y="58" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="400" fill="#8E85A8">Porn filter, doomscroll friction &amp; binge defense</text>
        </g>

        <!-- Feature 3: Mindful Urge Interceptor (SOS) -->
        <g transform="translate(0, 192)">
          <rect width="450" height="76" rx="16" fill="url(#cardGlow)" stroke="#2C1F42" stroke-width="1.5"/>
          <text x="24" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="700" fill="#FFFFFF">Mindful Urge Interceptor (SOS)</text>
          <text x="24" y="58" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="400" fill="#8E85A8">3-min grounding pause &amp; real-world map mission</text>
        </g>

        <!-- Feature 4: Ethical Patron Commons -->
        <g transform="translate(0, 288)">
          <rect width="450" height="76" rx="16" fill="url(#cardGlow)" stroke="#2C1F42" stroke-width="1.5"/>
          <text x="24" y="34" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="700" fill="#FFFFFF">Ethical Patron Commons</text>
          <text x="24" y="58" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="400" fill="#8E85A8">100% free crisis core powered by RevenueCat</text>
        </g>
      </g>

      <!-- Student Author & Track Attribution -->
      <g transform="translate(120, 1340)">
        <line x1="0" y1="0" x2="800" y2="0" stroke="#2C1F42" stroke-width="1"/>
        <text x="0" y="36" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="700" fill="#FFFFFF">Alejandro Ortiz • University of the People (UoPeople)</text>
        <text x="0" y="66" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="500" fill="#42C7F5">Next Gen Award Track • Open Source (MIT) • B.S. in Computer Science</text>
      </g>

      <!-- Drop Shadows behind Phone Mockups -->
      <rect x="1195" y="215" width="${phoneW}" height="${phoneH}" rx="${cornerRadius}" fill="#000000" opacity="0.6"/>
      <rect x="1745" y="255" width="${phoneW}" height="${phoneH}" rx="${cornerRadius}" fill="#000000" opacity="0.6"/>
    </svg>
  `);

  // Composite the final 3:2 Thumbnail
  const thumbPath = path.join(outDir, 'devpost-thumbnail-3x2.jpg');
  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 8, g: 7, b: 12, alpha: 1 }
    }
  })
    .composite([
      { input: textOverlaySvg, top: 0, left: 0 },
      { input: logoBuffer, top: 240, left: 120 },
      { input: phone1Buffer, top: 190, left: 1180 },
      { input: phone2Buffer, top: 230, left: 1730 }
    ])
    .jpeg({ quality: 92 })
    .toFile(thumbPath);

  console.log(`✅ devpost-thumbnail-3x2.jpg generated (${thumbPath})`);
}

run().catch(err => {
  console.error('Generation failed:', err);
  process.exit(1);
});
