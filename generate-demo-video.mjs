import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import sharp from 'sharp';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';

const ffmpegPath = ffmpegInstaller.path;
const mobileDir = path.resolve('c:/dev/aurora-mobile');
const outDir = path.join(mobileDir, 'store-assets');
const tempDir = path.join(mobileDir, 'temp-video-frames');

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Convert logo to base64 for embedding
const logoBase64 = fs.readFileSync(path.join(mobileDir, 'apps/mobile/assets/aurora-logo.png')).toString('base64');
const logoDataUri = `data:image/png;base64,${logoBase64}`;

// Helper: Standard Phone Status Bar (740 x 70)
const phoneStatusBar = `
  <g id="status-bar" transform="translate(40, 20)">
    <text x="30" y="44" fill="#F0EEF6" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="700">9:41</text>
    <rect x="250" y="16" width="160" height="42" rx="21" fill="#000000" />
    <g transform="translate(580, 26)" fill="#F0EEF6">
      <rect x="0" y="10" width="4" height="10" rx="1"/>
      <rect x="6" y="8" width="4" height="12" rx="1"/>
      <rect x="12" y="5" width="4" height="15" rx="1"/>
      <rect x="18" y="2" width="4" height="18" rx="1"/>
      <rect x="32" y="2" width="30" height="18" rx="5" fill="none" stroke="#F0EEF6" stroke-width="2"/>
      <rect x="35" y="5" width="22" height="12" rx="3" fill="#4ADE80"/>
      <path d="M63 7 C64 7, 64 9, 64 11 L64 11 C64 13, 63 15, 63 15" fill="#F0EEF6"/>
    </g>
  </g>
`;

// Helper: Standard Phone Bottom Navigation (740 x 120)
const phoneBottomNav = (active = 'home') => `
  <g id="phone-nav" transform="translate(0, 1480)">
    <rect x="0" y="0" width="740" height="120" fill="#0C0A14" stroke="#261C36" stroke-width="1"/>
    <!-- Home -->
    <g transform="translate(92, 15)" opacity="${active === 'home' ? '1' : '0.4'}">
      <circle cx="20" cy="18" r="12" fill="none" stroke="${active === 'home' ? '#D7A4FF' : '#A59DB5'}" stroke-width="3"/>
      <text x="20" y="55" fill="${active === 'home' ? '#D7A4FF' : '#A59DB5'}" font-family="sans-serif" font-size="16" font-weight="700" text-anchor="middle">Home</text>
    </g>
    <!-- Map -->
    <g transform="translate(277, 15)" opacity="${active === 'map' ? '1' : '0.4'}">
      <circle cx="20" cy="16" r="9" fill="none" stroke="${active === 'map' ? '#42C7F5' : '#A59DB5'}" stroke-width="3"/>
      <path d="M20 25 L20 34" stroke="${active === 'map' ? '#42C7F5' : '#A59DB5'}" stroke-width="3"/>
      <text x="20" y="55" fill="${active === 'map' ? '#42C7F5' : '#A59DB5'}" font-family="sans-serif" font-size="16" font-weight="700" text-anchor="middle">Map</text>
    </g>
    <!-- Community -->
    <g transform="translate(462, 15)" opacity="${active === 'community' ? '1' : '0.4'}">
      <circle cx="12" cy="16" r="7" fill="none" stroke="${active === 'community' ? '#42C7F5' : '#A59DB5'}" stroke-width="2.5"/>
      <circle cx="28" cy="16" r="7" fill="none" stroke="${active === 'community' ? '#42C7F5' : '#A59DB5'}" stroke-width="2.5"/>
      <text x="20" y="55" fill="${active === 'community' ? '#42C7F5' : '#A59DB5'}" font-family="sans-serif" font-size="16" font-weight="700" text-anchor="middle">Community</text>
    </g>
    <!-- Shield -->
    <g transform="translate(647, 15)" opacity="${active === 'shield' ? '1' : '0.4'}">
      <polygon points="20,6 34,14 34,28 20,36 6,28 6,14" fill="none" stroke="${active === 'shield' ? '#D7A4FF' : '#A59DB5'}" stroke-width="3"/>
      <text x="20" y="55" fill="${active === 'shield' ? '#D7A4FF' : '#A59DB5'}" font-family="sans-serif" font-size="16" font-weight="700" text-anchor="middle">Shield</text>
    </g>
    <rect x="270" y="95" width="200" height="6" rx="3" fill="#FFFFFF" opacity="0.3"/>
  </g>
`;

// Helper: Wrap phone content in a sleek mockup on a 1080x1920 canvas
function wrapPhoneMockup({ innerSvg, chapter, title, subtitle }) {
  return `
  <svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="stageGlow" cx="50%" cy="40%" r="65%">
        <stop offset="0%" stop-color="#19112B" stop-opacity="0.95"/>
        <stop offset="100%" stop-color="#07060A" stop-opacity="1"/>
      </radialGradient>
      <linearGradient id="phoneBorder" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#3F2D5E"/>
        <stop offset="50%" stop-color="#211833"/>
        <stop offset="100%" stop-color="#42C7F5" stop-opacity="0.6"/>
      </linearGradient>
      <clipPath id="screenClip">
        <rect x="0" y="0" width="740" height="1600" rx="44"/>
      </clipPath>
    </defs>

    <!-- Stage Background -->
    <rect width="1080" height="1920" fill="url(#stageGlow)"/>

    <!-- Top Badge / Header Tag -->
    <g transform="translate(80, 50)">
      <rect width="360" height="42" rx="21" fill="#150E24" stroke="#3D295C" stroke-width="1.5"/>
      <circle cx="24" cy="21" r="5" fill="#42C7F5"/>
      <text x="40" y="28" fill="#42C7F5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" letter-spacing="1.5">REVENUECAT SHIPATON 2026</text>
    </g>

    <!-- Chapter Indicator -->
    <g transform="translate(680, 50)">
      <rect width="320" height="42" rx="21" fill="#150E24" stroke="#794BBE" stroke-width="1.5"/>
      <text x="160" y="28" fill="#D7A4FF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" letter-spacing="1" text-anchor="middle">${chapter}</text>
    </g>

    <!-- Phone Shadow -->
    <rect x="160" y="130" width="760" height="1620" rx="52" fill="#000000" opacity="0.65"/>

    <!-- Phone Outer Shell &amp; Bezel -->
    <rect x="170" y="120" width="740" height="1600" rx="44" fill="#0C0A14" stroke="url(#phoneBorder)" stroke-width="4"/>

    <!-- Inner Phone Screen -->
    <g transform="translate(170, 120)" clip-path="url(#screenClip)">
      ${innerSvg}
    </g>

    <!-- Bottom Feature Callout Caption -->
    <g transform="translate(80, 1750)">
      <rect width="920" height="110" rx="26" fill="#110B1F" stroke="#2E1F47" stroke-width="1.5"/>
      <circle cx="45" cy="55" r="18" fill="#1C2E42"/>
      <text x="45" y="62" fill="#42C7F5" font-size="18" text-anchor="middle">⚡</text>
      <text x="80" y="48" fill="#FFFFFF" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800">${title}</text>
      <text x="80" y="84" fill="#B5AED1" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="500">${subtitle}</text>
    </g>
  </svg>
  `;
}

// SCENE 1: Home Dashboard &amp; Metrics (0s - 9s = 9s)
const scene1Inner = `
  <rect width="740" height="1600" fill="#08070C"/>
  ${phoneStatusBar}

  <!-- Header -->
  <g transform="translate(40, 85)">
    <clipPath id="logoClipS1"><circle cx="26" cy="26" r="26"/></clipPath>
    <image href="${logoDataUri}" x="0" y="0" width="52" height="52" clip-path="url(#logoClipS1)" />
    <text x="68" y="22" fill="#8E85A8" font-family="sans-serif" font-size="16" font-weight="700" letter-spacing="1">AURORA APP</text>
    <text x="68" y="46" fill="#FFFFFF" font-family="sans-serif" font-size="24" font-weight="800">Sovereign Clarity</text>
    
    <rect x="520" y="8" width="130" height="42" rx="21" fill="#181226" stroke="#3D295C" stroke-width="1.5"/>
    <text x="585" y="34" fill="#42C7F5" font-family="sans-serif" font-size="16" font-weight="700" text-anchor="middle">👑 SUPPORT</text>
  </g>

  <!-- Metrics Row -->
  <g transform="translate(40, 160)">
    <rect x="0" y="0" width="205" height="100" rx="18" fill="#130F1E" stroke="#251C36" stroke-width="1.5"/>
    <text x="20" y="32" fill="#42C7F5" font-family="sans-serif" font-size="15" font-weight="700">🛡️ Blocks</text>
    <text x="20" y="78" fill="#FFFFFF" font-family="sans-serif" font-size="36" font-weight="800">18</text>

    <rect x="227" y="0" width="205" height="100" rx="18" fill="#1A112A" stroke="#794BBE" stroke-width="2"/>
    <text x="247" y="32" fill="#D7A4FF" font-family="sans-serif" font-size="15" font-weight="700">🔥 Clean Streak</text>
    <text x="247" y="78" fill="#FFFFFF" font-family="sans-serif" font-size="36" font-weight="800">14<tspan font-size="20" fill="#D7A4FF">d</tspan></text>

    <rect x="454" y="0" width="205" height="100" rx="18" fill="#130F1E" stroke="#251C36" stroke-width="1.5"/>
    <text x="474" y="32" fill="#4ADE80" font-family="sans-serif" font-size="15" font-weight="700">✨ Reclaimed</text>
    <text x="474" y="78" fill="#FFFFFF" font-family="sans-serif" font-size="36" font-weight="800">24<tspan font-size="20" fill="#4ADE80">h</tspan></text>
  </g>

  <!-- Neural Clarity Sphere Hero -->
  <g transform="translate(370, 480)">
    <circle cx="0" cy="0" r="190" fill="#140D24" stroke="#2B1E40" stroke-width="2"/>
    <circle cx="0" cy="0" r="170" fill="none" stroke="#42C7F5" stroke-opacity="0.3" stroke-width="2" stroke-dasharray="8 6"/>
    <circle cx="0" cy="0" r="140" fill="none" stroke="#D7A4FF" stroke-opacity="0.4" stroke-width="2"/>
    <circle cx="0" cy="0" r="110" fill="#120D22" stroke="#42C7F5" stroke-width="3"/>
    
    <circle cx="90" cy="-65" r="10" fill="#42C7F5"/>
    <circle cx="90" cy="-65" r="18" fill="#42C7F5" fill-opacity="0.3"/>

    <text x="0" y="-40" fill="#42C7F5" font-family="sans-serif" font-size="16" font-weight="800" letter-spacing="2" text-anchor="middle">PHASE II · CLARITY</text>
    <text x="0" y="24" fill="#FFFFFF" font-family="sans-serif" font-size="68" font-weight="900" text-anchor="middle">14<tspan font-size="32" fill="#42C7F5">d</tspan></text>
    <text x="0" y="60" fill="#B5AED1" font-family="sans-serif" font-size="16" font-weight="600" letter-spacing="1" text-anchor="middle">MENTAL CLARITY</text>
  </g>

  <!-- Phase Info Card -->
  <g transform="translate(40, 710)">
    <rect x="0" y="0" width="660" height="95" rx="18" fill="#130F20" stroke="#2B1E40" stroke-width="1.5"/>
    <circle cx="28" cy="30" r="6" fill="#42C7F5"/>
    <text x="42" y="34" fill="#42C7F5" font-family="sans-serif" font-size="17" font-weight="700">Receptor Regeneration</text>
    <text x="28" y="66" fill="#B5AED1" font-family="sans-serif" font-size="15" font-weight="400">
      Days 4–14: D2 receptor upregulation, restorative REM sleep &amp; steady calm.
    </text>
  </g>

  <!-- Core Commitment -->
  <g transform="translate(40, 825)">
    <rect x="0" y="0" width="660" height="85" rx="18" fill="#140D24" stroke="#42C7F5" stroke-width="1.5"/>
    <text x="25" y="30" fill="#D7A4FF" font-family="sans-serif" font-size="14" font-weight="800" letter-spacing="1.5">🔒 YOUR CORE COMMITMENT</text>
    <text x="25" y="60" fill="#FFFFFF" font-family="sans-serif" font-size="18" font-style="italic" font-weight="600">
      “I deserve mental peace and respect in my daily life”
    </text>
  </g>

  <!-- Urgent SOS Button -->
  <g transform="translate(40, 930)">
    <rect x="0" y="0" width="660" height="110" rx="22" fill="#6E3FF2" stroke="#8A57FF" stroke-width="2"/>
    <text x="90" y="46" fill="#FFFFFF" font-family="sans-serif" font-size="24" font-weight="800">Overcome Urge Now (SOS)</text>
    <text x="90" y="78" fill="#E0D7FF" font-family="sans-serif" font-size="16" font-weight="500">
      Tap here if feeling a craving, porn trigger, or compulsive doomscroll
    </text>
    <circle cx="50" cy="55" r="22" fill="#FFFFFF" fill-opacity="0.2"/>
    <text x="50" y="63" fill="#FFFFFF" font-size="22" text-anchor="middle">🚨</text>
  </g>

  <!-- Quick Hub -->
  <g transform="translate(40, 1060)">
    <rect x="0" y="0" width="205" height="80" rx="18" fill="#130F1E" stroke="#42C7F5" stroke-width="1.5"/>
    <text x="102" y="48" fill="#42C7F5" font-family="sans-serif" font-size="18" font-weight="700" text-anchor="middle">📍 Live Map</text>

    <rect x="227" y="0" width="205" height="80" rx="18" fill="#130F1E" stroke="#251C36" stroke-width="1.5"/>
    <text x="329" y="48" fill="#D7A4FF" font-family="sans-serif" font-size="18" font-weight="700" text-anchor="middle">👥 Community</text>

    <rect x="454" y="0" width="205" height="80" rx="18" fill="#130F1E" stroke="#251C36" stroke-width="1.5"/>
    <text x="556" y="48" fill="#FFFFFF" font-family="sans-serif" font-size="18" font-weight="700" text-anchor="middle">🛡️ Shield</text>
  </g>

  <!-- Weekly History Bars -->
  <g transform="translate(40, 1160)">
    <rect x="0" y="0" width="660" height="150" rx="20" fill="#100C1A" stroke="#251C36" stroke-width="1.5"/>
    <text x="25" y="34" fill="#42C7F5" font-family="sans-serif" font-size="16" font-weight="700">✨ Weekly Agency Evolution</text>
    <g transform="translate(35, 50)">
      <rect x="0" y="10" width="50" height="55" rx="8" fill="#42C7F5"/><text x="25" y="85" fill="#42C7F5" font-size="15" text-anchor="middle">M</text>
      <rect x="90" y="15" width="50" height="50" rx="8" fill="#42C7F5"/><text x="115" y="85" fill="#42C7F5" font-size="15" text-anchor="middle">T</text>
      <rect x="180" y="5" width="50" height="60" rx="8" fill="#42C7F5"/><text x="205" y="85" fill="#42C7F5" font-size="15" text-anchor="middle">W</text>
      <rect x="270" y="10" width="50" height="55" rx="8" fill="#42C7F5"/><text x="295" y="85" fill="#42C7F5" font-size="15" text-anchor="middle">T</text>
      <rect x="360" y="0" width="50" height="65" rx="8" fill="#4ADE80"/><text x="385" y="85" fill="#4ADE80" font-size="15" text-anchor="middle">F</text>
      <rect x="450" y="0" width="50" height="65" rx="8" fill="#4ADE80"/><text x="475" y="85" fill="#4ADE80" font-size="15" text-anchor="middle">S</text>
      <rect x="540" y="0" width="50" height="65" rx="8" fill="#D7A4FF"/><text x="565" y="85" fill="#D7A4FF" font-size="15" text-anchor="middle">S</text>
    </g>
  </g>

  ${phoneBottomNav('home')}
`;

// SCENE 2: The 5 Neurobiological Recovery Phases (9s - 19s = 10s)
const scene2Inner = `
  <rect width="740" height="1600" fill="#08070C"/>
  ${phoneStatusBar}

  <!-- Header -->
  <g transform="translate(40, 85)">
    <text x="0" y="24" fill="#42C7F5" font-family="sans-serif" font-size="16" font-weight="700" letter-spacing="2">CLINICAL NEUROBIOLOGY</text>
    <text x="0" y="62" fill="#FFFFFF" font-family="sans-serif" font-size="34" font-weight="800">5 Recovery Phases</text>
    <text x="0" y="94" fill="#A59DB5" font-family="sans-serif" font-size="16" font-weight="400">Transforming compulsive dopamine depletion into sovereign agency.</text>
  </g>

  <!-- Phase 1 Card -->
  <g transform="translate(40, 200)">
    <rect x="0" y="0" width="660" height="120" rx="20" fill="#130E22" stroke="#251C36" stroke-width="1.5"/>
    <circle cx="35" cy="40" r="16" fill="#1D2A3B"/>
    <text x="35" y="46" fill="#42C7F5" font-family="sans-serif" font-size="15" font-weight="800" text-anchor="middle">I</text>
    <text x="65" y="44" fill="#FFFFFF" font-family="sans-serif" font-size="20" font-weight="700">Phase I: Neurochemical Reset (Days 1–3)</text>
    <text x="65" y="74" fill="#42C7F5" font-family="sans-serif" font-size="15" font-weight="700">● 100% COMPLETE</text>
    <text x="25" y="102" fill="#B5AED1" font-family="sans-serif" font-size="14">Halts automatic dopamine depletion loops; calms acute withdrawal irritation.</text>
  </g>

  <!-- Phase 2 Card (ACTIVE HERO) -->
  <g transform="translate(40, 340)">
    <rect x="0" y="0" width="660" height="150" rx="22" fill="#1A112E" stroke="#42C7F5" stroke-width="2.5"/>
    <rect x="490" y="18" width="145" height="34" rx="17" fill="#42C7F5"/>
    <text x="562" y="40" fill="#08070C" font-family="sans-serif" font-size="14" font-weight="800" text-anchor="middle">CURRENT (14d)</text>

    <circle cx="35" cy="42" r="18" fill="#1D3E5E"/>
    <text x="35" y="48" fill="#42C7F5" font-family="sans-serif" font-size="16" font-weight="800" text-anchor="middle">II</text>
    <text x="65" y="44" fill="#FFFFFF" font-family="sans-serif" font-size="22" font-weight="800">Phase II: Receptor Regeneration (Days 4–14)</text>
    <text x="25" y="86" fill="#8CE0FF" font-family="sans-serif" font-size="16" font-weight="600">
      Dopamine D2 receptor upregulation &amp; REM sleep restoration.
    </text>
    <text x="25" y="122" fill="#C5BCD3" font-family="sans-serif" font-size="14">
      The nervous system regains baseline motivation; emotional reactivity drops sharply.
    </text>
  </g>

  <!-- Phase 3 Card -->
  <g transform="translate(40, 510)">
    <rect x="0" y="0" width="660" height="120" rx="20" fill="#130E22" stroke="#251C36" stroke-width="1.5"/>
    <circle cx="35" cy="40" r="16" fill="#251838"/>
    <text x="35" y="46" fill="#D7A4FF" font-family="sans-serif" font-size="15" font-weight="800" text-anchor="middle">III</text>
    <text x="65" y="44" fill="#FFFFFF" font-family="sans-serif" font-size="20" font-weight="700">Phase III: Prefrontal Activation (Days 15–45)</text>
    <text x="65" y="74" fill="#D7A4FF" font-family="sans-serif" font-size="15" font-weight="700">NEXT MILESTONE • Starting Tomorrow</text>
    <text x="25" y="102" fill="#B5AED1" font-family="sans-serif" font-size="14">Executive control consolidation, sustained deep work focus, and hormonal balance.</text>
  </g>

  <!-- Phase 4 Card -->
  <g transform="translate(40, 650)">
    <rect x="0" y="0" width="660" height="120" rx="20" fill="#130E22" stroke="#251C36" stroke-width="1.5"/>
    <circle cx="35" cy="40" r="16" fill="#192A22"/>
    <text x="35" y="46" fill="#4ADE80" font-family="sans-serif" font-size="15" font-weight="800" text-anchor="middle">IV</text>
    <text x="65" y="44" fill="#FFFFFF" font-family="sans-serif" font-size="20" font-weight="700">Phase IV: Attentional Autonomy (Days 46–90)</text>
    <text x="25" y="80" fill="#86EFAC" font-family="sans-serif" font-size="15" font-weight="500">Deepened neuroplasticity across daily routines.</text>
    <text x="25" y="104" fill="#B5AED1" font-family="sans-serif" font-size="14">Compulsive triggers lose neural traction; agency becomes default state.</text>
  </g>

  <!-- Phase 5 Card -->
  <g transform="translate(40, 790)">
    <rect x="0" y="0" width="660" height="120" rx="20" fill="#130E22" stroke="#251C36" stroke-width="1.5"/>
    <circle cx="35" cy="40" r="16" fill="#362912"/>
    <text x="35" y="46" fill="#FFB703" font-family="sans-serif" font-size="15" font-weight="800" text-anchor="middle">V</text>
    <text x="65" y="44" fill="#FFFFFF" font-family="sans-serif" font-size="20" font-weight="700">Phase V: Sovereign Mastery (Day 90+)</text>
    <text x="25" y="80" fill="#FFD166" font-family="sans-serif" font-size="15" font-weight="500">Full synaptic consolidation and total presence.</text>
    <text x="25" y="104" fill="#B5AED1" font-family="sans-serif" font-size="14">Permanent liberation from digital extraction models.</text>
  </g>

  <!-- Interactive Sphere Graphic Mini -->
  <g transform="translate(370, 1140)">
    <circle cx="0" cy="0" r="150" fill="#100C1F" stroke="#794BBE" stroke-width="2"/>
    <circle cx="0" cy="0" r="110" fill="#160E28" stroke="#42C7F5" stroke-width="3"/>
    <text x="0" y="8" fill="#FFFFFF" font-family="sans-serif" font-size="34" font-weight="800" text-anchor="middle">14 Days Clean</text>
    <text x="0" y="38" fill="#42C7F5" font-family="sans-serif" font-size="16" font-weight="700" text-anchor="middle">+100% Agency Reclaimed</text>
  </g>

  ${phoneBottomNav('home')}
`;

// SCENE 3: Multi-Vector Habit Shield &amp; Deliberate Friction (19s - 30s = 11s)
const scene3Inner = `
  <rect width="740" height="1600" fill="#08070C"/>
  ${phoneStatusBar}

  <!-- Header -->
  <g transform="translate(40, 85)">
    <text x="0" y="24" fill="#D7A4FF" font-family="sans-serif" font-size="16" font-weight="700" letter-spacing="2">AURORA SHIELD • HABIT DEFENSE</text>
    <text x="0" y="64" fill="#FFFFFF" font-family="sans-serif" font-size="34" font-weight="800">Multi-Vector Habit Shield</text>
    <text x="0" y="94" fill="#A59DB5" font-family="sans-serif" font-size="16" font-weight="400">On-device active protection against compulsions &amp; behavioral traps.</text>
  </g>

  <!-- Accessibility Status Badge -->
  <g transform="translate(40, 200)">
    <rect x="0" y="0" width="660" height="80" rx="18" fill="#111F19" stroke="#22543D" stroke-width="1.5"/>
    <circle cx="35" cy="40" r="14" fill="#22543D"/>
    <text x="35" y="46" fill="#4ADE80" font-size="16" text-anchor="middle">✓</text>
    <text x="65" y="36" fill="#4ADE80" font-family="sans-serif" font-size="18" font-weight="800">SYSTEM SHIELD ACTIVE</text>
    <text x="65" y="60" fill="#86EFAC" font-family="sans-serif" font-size="14">Android Accessibility Interceptor • 100% Local • Zero Data Leaves Device</text>
  </g>

  <!-- Vector 1: Pornography Blocker -->
  <g transform="translate(40, 300)">
    <rect x="0" y="0" width="660" height="140" rx="20" fill="#140E24" stroke="#794BBE" stroke-width="2"/>
    <text x="25" y="40" fill="#FFFFFF" font-family="sans-serif" font-size="22" font-weight="700">🔒 Adult &amp; Pornography Filter</text>
    <text x="25" y="70" fill="#B5AED1" font-family="sans-serif" font-size="15">
      Blocks explicit domains, private browsing loops &amp; high-novelty sexual triggers.
    </text>
    <!-- Toggle ON -->
    <rect x="560" y="24" width="75" height="40" rx="20" fill="#4ADE80"/>
    <circle cx="615" cy="44" r="16" fill="#FFFFFF"/>
    <text x="25" y="112" fill="#4ADE80" font-family="sans-serif" font-size="15" font-weight="700">● ACTIVE • D2 Receptor Recovery Shield</text>
  </g>

  <!-- Vector 2: Doomscrolling Friction -->
  <g transform="translate(40, 460)">
    <rect x="0" y="0" width="660" height="140" rx="20" fill="#140E24" stroke="#251C36" stroke-width="1.5"/>
    <text x="25" y="40" fill="#FFFFFF" font-family="sans-serif" font-size="22" font-weight="700">📱 Doomscrolling &amp; Infinite Feeds</text>
    <text x="25" y="70" fill="#B5AED1" font-family="sans-serif" font-size="15">
      Interrupts compulsive short-form video reels, algorithmic feeds &amp; endless scroll.
    </text>
    <!-- Toggle ON -->
    <rect x="560" y="24" width="75" height="40" rx="20" fill="#4ADE80"/>
    <circle cx="615" cy="44" r="16" fill="#FFFFFF"/>
    <text x="25" y="112" fill="#42C7F5" font-family="sans-serif" font-size="15" font-weight="700">● ACTIVE • 5-Second Conscious Delay</text>
  </g>

  <!-- Vector 3: Binge Food Cravings -->
  <g transform="translate(40, 620)">
    <rect x="0" y="0" width="660" height="140" rx="20" fill="#140E24" stroke="#251C36" stroke-width="1.5"/>
    <text x="25" y="40" fill="#FFFFFF" font-family="sans-serif" font-size="22" font-weight="700">🍽️ Late-Night Binge &amp; Food Cravings</text>
    <text x="25" y="70" fill="#B5AED1" font-family="sans-serif" font-size="15">
      Restricts impulsive midnight delivery apps &amp; ultra-processed food cue triggers.
    </text>
    <!-- Toggle ON -->
    <rect x="560" y="24" width="75" height="40" rx="20" fill="#4ADE80"/>
    <circle cx="615" cy="44" r="16" fill="#FFFFFF"/>
    <text x="25" y="112" fill="#D7A4FF" font-family="sans-serif" font-size="15" font-weight="700">● ACTIVE • Night Window Lock</text>
  </g>

  <!-- THE INNOVATION: DELIBERATE FRICTION MODAL -->
  <g transform="translate(40, 780)">
    <rect x="0" y="0" width="660" height="270" rx="22" fill="#1E1231" stroke="#794BBE" stroke-width="2.5"/>
    <text x="25" y="42" fill="#D7A4FF" font-family="sans-serif" font-size="16" font-weight="800" letter-spacing="1.5">⚠️ DELIBERATE FRICTION DEFENSE</text>
    <text x="25" y="80" fill="#FFFFFF" font-family="sans-serif" font-size="26" font-weight="800">Conscious Relapse Interruption</text>
    <text x="25" y="115" fill="#B5AED1" font-family="sans-serif" font-size="16">
      To disable any protection, you must manually type your personal commitment:
    </text>
    
    <rect x="25" y="135" width="610" height="65" rx="14" fill="#0C0717" stroke="#42C7F5" stroke-width="2"/>
    <text x="45" y="174" fill="#4ADE80" font-family="monospace" font-size="18" font-weight="700">
      “I deserve mental peace and respect in my daily life”
    </text>

    <text x="25" y="235" fill="#C5BCD3" font-family="sans-serif" font-size="14" font-weight="500">
      Neuroscience proof: Halts impulsive overrides during 3–5 minute craving spikes.
    </text>
  </g>

  <!-- Custom Domain Blocklist -->
  <g transform="translate(40, 1070)">
    <rect x="0" y="0" width="660" height="150" rx="18" fill="#100C1B" stroke="#251C36" stroke-width="1.5"/>
    <text x="25" y="34" fill="#42C7F5" font-family="sans-serif" font-size="16" font-weight="700">🌐 Custom Domain Blocklist (4 Active)</text>
    <g transform="translate(25, 55)">
      <rect x="0" y="0" width="130" height="42" rx="14" fill="#1C142B" stroke="#3D295C" stroke-width="1.5"/>
      <text x="20" y="26" fill="#FFFFFF" font-family="monospace" font-size="15">x.com ✕</text>

      <rect x="145" y="0" width="150" height="42" rx="14" fill="#1C142B" stroke="#3D295C" stroke-width="1.5"/>
      <text x="165" y="26" fill="#FFFFFF" font-family="monospace" font-size="15">tiktok.com ✕</text>

      <rect x="310" y="0" width="170" height="42" rx="14" fill="#1C142B" stroke="#3D295C" stroke-width="1.5"/>
      <text x="330" y="26" fill="#FFFFFF" font-family="monospace" font-size="15">instagram.com ✕</text>

      <rect x="495" y="0" width="125" height="42" rx="14" fill="#122538" stroke="#42C7F5" stroke-width="1.5"/>
      <text x="515" y="26" fill="#42C7F5" font-family="sans-serif" font-size="15" font-weight="700">+ Add URL</text>
    </g>
  </g>

  ${phoneBottomNav('shield')}
`;

// SCENE 4: Mindful SOS Interceptor &amp; Mapbox 50m Live Map (30s - 42s = 12s)
const scene4Inner = `
  <rect width="740" height="1600" fill="#08070C"/>

  <!-- Live Map Viewport (Dark Mapbox Simulation) -->
  <g opacity="0.85">
    <path d="M0,280 L740,320 M0,500 L740,540 M0,750 L740,780 M0,1000 L740,960" stroke="#161126" stroke-width="34"/>
    <path d="M160,0 L200,1600 M400,0 L430,1600 M600,0 L570,1600" stroke="#161126" stroke-width="36"/>
    <path d="M-50,1100 L800,400" stroke="#22173B" stroke-width="50"/>

    <rect x="40" y="360" width="100" height="110" rx="10" fill="#0E0A1A"/>
    <rect x="240" y="370" width="140" height="110" rx="10" fill="#0E0A1A"/>
    <rect x="460" y="380" width="120" height="110" rx="10" fill="#0E0A1A"/>
    <rect x="40" y="560" width="110" height="160" rx="10" fill="#0E0A1A"/>
    <rect x="250" y="570" width="130" height="150" rx="10" fill="#0E0A1A"/>

    <!-- Street Labels -->
    <text x="210" y="520" fill="#4B3C68" font-family="sans-serif" font-size="15" font-weight="600">Carrera 7</text>
    <text x="410" y="560" fill="#4B3C68" font-family="sans-serif" font-size="15" font-weight="600">Park Way</text>
    <text x="50" y="740" fill="#4B3C68" font-family="sans-serif" font-size="15" font-weight="600">Calle 39</text>
  </g>

  <!-- 50m Privacy Quantized Spatial Signals -->
  <!-- Signal 1: Haven -->
  <g transform="translate(430, 480)">
    <circle cx="0" cy="0" r="50" fill="#42C7F5" fill-opacity="0.2"/>
    <circle cx="0" cy="0" r="28" fill="#42C7F5" fill-opacity="0.4"/>
    <circle cx="0" cy="0" r="14" fill="#42C7F5"/>
    <rect x="20" y="-40" width="250" height="48" rx="14" fill="#110D20" stroke="#42C7F5" stroke-width="1.5"/>
    <text x="35" y="-12" fill="#FFFFFF" font-family="sans-serif" font-size="16" font-weight="700">Open Commercial Haven (8m)</text>
  </g>

  <!-- Signal 2: Active Footing -->
  <g transform="translate(220, 680)">
    <circle cx="0" cy="0" r="42" fill="#4ADE80" fill-opacity="0.2"/>
    <circle cx="0" cy="0" r="24" fill="#4ADE80" fill-opacity="0.4"/>
    <circle cx="0" cy="0" r="12" fill="#4ADE80"/>
    <rect x="-210" y="-35" width="195" height="44" rx="12" fill="#110D20" stroke="#4ADE80" stroke-width="1.5"/>
    <text x="-195" y="-9" fill="#FFFFFF" font-family="sans-serif" font-size="15" font-weight="700">Active Pedestrians (5m)</text>
  </g>

  <!-- User Location -->
  <g transform="translate(330, 770)">
    <circle cx="0" cy="0" r="60" fill="#D7A4FF" fill-opacity="0.15"/>
    <circle cx="0" cy="0" r="22" fill="#D7A4FF" stroke="#FFFFFF" stroke-width="3"/>
    <circle cx="0" cy="0" r="8" fill="#08070C"/>
  </g>

  ${phoneStatusBar}

  <!-- Native Map Header -->
  <g transform="translate(40, 85)">
    <rect x="0" y="0" width="660" height="60" rx="18" fill="#110C1E" stroke="#251C36" stroke-width="1.5"/>
    <circle cx="30" cy="30" r="6" fill="#42C7F5"/>
    <text x="46" y="36" fill="#FFFFFF" font-family="sans-serif" font-size="18" font-weight="800">LIVE MAP • miaurora.app</text>
    <rect x="575" y="10" width="40" height="40" rx="10" fill="#1A122A" stroke="#3D295C" stroke-width="1"/>
    <text x="595" y="35" fill="#42C7F5" font-size="16" text-anchor="middle">↻</text>
    <rect x="625" y="10" width="40" height="40" rx="10" fill="#1A122A" stroke="#3D295C" stroke-width="1"/>
    <text x="645" y="35" fill="#B5AED1" font-size="16" text-anchor="middle">↗</text>
  </g>

  <!-- TOP OVERLAY: The SOS Mindful Grounding Intervention Modal -->
  <g transform="translate(40, 160)">
    <rect x="0" y="0" width="660" height="270" rx="24" fill="#180F2E" stroke="#6E3FF2" stroke-width="2.5"/>
    <rect x="25" y="20" width="220" height="34" rx="17" fill="#2E1B52"/>
    <text x="135" y="42" fill="#D7A4FF" font-family="sans-serif" font-size="14" font-weight="800" text-anchor="middle">🚨 MINDFUL PAUSE · SOS</text>

    <text x="25" y="86" fill="#FFFFFF" font-family="sans-serif" font-size="22" font-weight="800">Chemical craving lasts only 3–5 minutes.</text>
    <text x="25" y="116" fill="#B5AED1" font-family="sans-serif" font-size="16">
      Step away from the screen. Walk onto a balcony, look out a window, or take a 3-minute physical stroll.
    </text>

    <rect x="25" y="145" width="610" height="45" rx="12" fill="#0C0717" stroke="#42C7F5" stroke-width="1.5"/>
    <text x="40" y="172" fill="#FFFFFF" font-family="sans-serif" font-size="15" font-style="italic">
      “Mission: Connect with physical reality and explore nearby safe havens on the map.”
    </text>

    <!-- Map button -->
    <rect x="25" y="205" width="295" height="48" rx="16" fill="#42C7F5"/>
    <text x="172" y="235" fill="#08070C" font-family="sans-serif" font-size="16" font-weight="800" text-anchor="middle">📍 Explore Live Map</text>

    <!-- Urge Overcome Button -->
    <rect x="340" y="205" width="295" height="48" rx="16" fill="#281A45" stroke="#794BBE" stroke-width="1.5"/>
    <text x="487" y="235" fill="#4ADE80" font-family="sans-serif" font-size="16" font-weight="800" text-anchor="middle">✓ Overcame Urge (+1)</text>
  </g>

  <!-- Bottom Sheet Card: 50m Privacy Architecture -->
  <g transform="translate(40, 1020)">
    <rect x="0" y="0" width="660" height="440" rx="26" fill="#110D1D" stroke="#261C36" stroke-width="2"/>
    <rect x="290" y="16" width="80" height="6" rx="3" fill="#3D2E55"/>

    <text x="30" y="60" fill="#42C7F5" font-family="sans-serif" font-size="15" font-weight="700" letter-spacing="1.5">ZERO TRACKING • ETHICAL COMMONS</text>
    <text x="30" y="100" fill="#FFFFFF" font-family="sans-serif" font-size="26" font-weight="800">50m Privacy-Preserving Safety</text>
    <text x="30" y="135" fill="#B5AED1" font-family="sans-serif" font-size="16">
      Coordinates quantized to a 50-meter grid on Cloudflare D1. Zero user accounts, zero follower graphs, zero surveillance.
    </text>

    <g transform="translate(30, 190)">
      <rect x="0" y="0" width="290" height="70" rx="18" fill="#1C142B" stroke="#794BBE" stroke-width="1.5"/>
      <text x="145" y="42" fill="#D7A4FF" font-family="sans-serif" font-size="18" font-weight="700" text-anchor="middle">🔗 Share Walk Link</text>

      <rect x="310" y="0" width="290" height="70" rx="18" fill="#42C7F5"/>
      <text x="455" y="42" fill="#08070C" font-family="sans-serif" font-size="18" font-weight="800" text-anchor="middle">+ Leave Signal</text>
    </g>

    <!-- Signal recency -->
    <g transform="translate(30, 290)">
      <rect x="0" y="0" width="600" height="90" rx="16" fill="#161125"/>
      <circle cx="35" cy="45" r="12" fill="#42C7F5"/>
      <text x="60" y="38" fill="#FFFFFF" font-family="sans-serif" font-size="17" font-weight="700">Commercial corridor active &amp; open</text>
      <text x="60" y="68" fill="#8E85A8" font-family="sans-serif" font-size="14">Carrera 7 con Calle 39 • Verified 12m ago</text>
      <rect x="500" y="28" width="80" height="34" rx="10" fill="#201533"/>
      <text x="540" y="50" fill="#4ADE80" font-family="sans-serif" font-size="14" font-weight="700" text-anchor="middle">ACTIVE</text>
    </g>
  </g>

  ${phoneBottomNav('map')}
`;

// SCENE 5: RevenueCat Ethical Patron Commons &amp; Judge Pass (42s - 52s = 10s)
const scene5Inner = `
  <rect width="740" height="1600" fill="#08070C"/>
  ${phoneStatusBar}

  <!-- Header -->
  <g transform="translate(40, 85)">
    <rect x="0" y="0" width="260" height="36" rx="18" fill="#201533" stroke="#794BBE" stroke-width="1.5"/>
    <circle cx="20" cy="18" r="5" fill="#D7A4FF"/>
    <text x="35" y="24" fill="#D7A4FF" font-family="sans-serif" font-size="15" font-weight="700" letter-spacing="1">REVENUECAT PATRON COMMONS</text>

    <text x="0" y="85" fill="#FFFFFF" font-family="sans-serif" font-size="40" font-weight="800">Support the Commons</text>
    <text x="0" y="125" fill="#42C7F5" font-family="sans-serif" font-size="20" font-weight="700">100% free recovery shields &amp; safety tools forever.</text>
    <text x="0" y="155" fill="#B5AED1" font-family="sans-serif" font-size="15">
      Patron subscriptions voluntarily fund infrastructure without ads or data brokers.
    </text>
  </g>

  <!-- Tier 1: Guardian Annual Card -->
  <g transform="translate(40, 270)">
    <rect x="0" y="0" width="660" height="220" rx="22" fill="#140E24" stroke="#42C7F5" stroke-width="2.5"/>
    <rect x="470" y="-14" width="165" height="32" rx="16" fill="#42C7F5"/>
    <text x="552" y="8" fill="#08070C" font-family="sans-serif" font-size="14" font-weight="800" text-anchor="middle">7-DAY FREE TRIAL</text>

    <text x="30" y="50" fill="#FFFFFF" font-family="sans-serif" font-size="26" font-weight="700">Guardian Patron (Annual)</text>
    <text x="30" y="90" fill="#D7A4FF" font-family="sans-serif" font-size="34" font-weight="800">$19.99 <tspan fill="#8E85A8" font-size="18" font-weight="500">/ year ($1.66/mo)</tspan></text>

    <text x="30" y="135" fill="#4ADE80" font-family="sans-serif" font-size="16" font-weight="700">✓ <tspan fill="#E4E0EC" font-weight="500">Deep Neural Clarity custom spheres &amp; telemetry</tspan></text>
    <text x="30" y="170" fill="#4ADE80" font-family="sans-serif" font-size="16" font-weight="700">✓ <tspan fill="#E4E0EC" font-weight="500">Subsidizes 50 free safety map nodes for vulnerable pedestrians</tspan></text>
  </g>

  <!-- Tier 2: Pioneer Lifetime Card -->
  <g transform="translate(40, 520)">
    <rect x="0" y="0" width="660" height="130" rx="20" fill="#100C1B" stroke="#251C36" stroke-width="1.5"/>
    <text x="30" y="44" fill="#FFFFFF" font-family="sans-serif" font-size="22" font-weight="700">Pioneer Lifetime Founder Pass</text>
    <text x="30" y="82" fill="#D7A4FF" font-family="sans-serif" font-size="30" font-weight="800">$39.99 <tspan fill="#8E85A8" font-size="16" font-weight="500">one-time payment</tspan></text>
    <text x="30" y="110" fill="#A59DB5" font-family="sans-serif" font-size="14">Permanent founding benefactor • Never charged again</text>
  </g>

  <!-- RevenueCat Peace Manifesto -->
  <g transform="translate(40, 680)">
    <rect x="0" y="0" width="660" height="170" rx="20" fill="#0C141D" stroke="#1D3E5E" stroke-width="1.5"/>
    <text x="30" y="38" fill="#42C7F5" font-family="sans-serif" font-size="16" font-weight="700" letter-spacing="1">THE REVENUECAT PEACE PRIZE MANIFESTO</text>
    <text x="30" y="74" fill="#D3E5F5" font-family="sans-serif" font-size="16" font-weight="500" font-style="italic">
      “Commercial software often profits by exploiting vulnerability. Aurora inverts the incentive: voluntary patrons fund the platform so crisis tools and street safety remain free for everyone.”
    </text>
    <text x="30" y="145" fill="#8CB3D9" font-family="sans-serif" font-size="14" font-weight="600">Powered by RevenueCat Offerings Engine</text>
  </g>

  <!-- THE JUDGE PASS HIGHLIGHT -->
  <g transform="translate(40, 880)">
    <rect x="0" y="0" width="660" height="210" rx="22" fill="#1C102E" stroke="#794BBE" stroke-width="2.5"/>
    <text x="30" y="42" fill="#D7A4FF" font-family="sans-serif" font-size="16" font-weight="800" letter-spacing="1.5">HACKATHON JUDGE PASS (EVALUATION BYPASS)</text>
    <text x="30" y="76" fill="#FFFFFF" font-family="sans-serif" font-size="22" font-weight="700">Unlocked with Passcode: SHIPATON2026</text>
    
    <rect x="30" y="95" width="370" height="60" rx="14" fill="#0E091A" stroke="#3D2760" stroke-width="1.5"/>
    <text x="50" y="134" fill="#4ADE80" font-family="monospace" font-size="22" font-weight="700">SHIPATON2026</text>

    <rect x="420" y="95" width="210" height="60" rx="14" fill="#794BBE"/>
    <text x="525" y="132" fill="#FFFFFF" font-family="sans-serif" font-size="18" font-weight="700" text-anchor="middle">✓ UNLOCKED</text>

    <text x="30" y="186" fill="#A59DB5" font-family="sans-serif" font-size="14">
      Judges evaluate all Guardian &amp; Pioneer features without test credit cards.
    </text>
  </g>

  <!-- Start Free Trial Button -->
  <g transform="translate(40, 1120)">
    <rect x="0" y="0" width="660" height="80" rx="22" fill="#42C7F5"/>
    <text x="330" y="50" fill="#08070C" font-family="sans-serif" font-size="24" font-weight="800" text-anchor="middle">Start 7-Day Free Trial</text>
  </g>

  ${phoneBottomNav('home')}
`;

const scenes = [
  {
    name: 'scene1_home',
    duration: 9,
    svg: wrapPhoneMockup({
      innerSvg: scene1Inner,
      chapter: '01 / 05 • SOVEREIGNTY',
      title: 'Neural Clarity &amp; Habit Sovereignty',
      subtitle: 'Obsidian dark interface with 14-day clean streak and dopamine tracking.'
    })
  },
  {
    name: 'scene2_sphere',
    duration: 10,
    svg: wrapPhoneMockup({
      innerSvg: scene2Inner,
      chapter: '02 / 05 • NEUROBIOLOGY',
      title: '5 Clinical Neurobiological Phases',
      subtitle: 'Dopamine D2 receptor regeneration, REM sleep restoration &amp; sustained agency.'
    })
  },
  {
    name: 'scene3_shield',
    duration: 11,
    svg: wrapPhoneMockup({
      innerSvg: scene3Inner,
      chapter: '03 / 05 • HABIT DEFENSE',
      title: 'Multi-Vector Shield &amp; Deliberate Friction',
      subtitle: 'Stops pornography, doomscroll feeds &amp; binge food with typed personal commitment.'
    })
  },
  {
    name: 'scene4_sos_map',
    duration: 12,
    svg: wrapPhoneMockup({
      innerSvg: scene4Inner,
      chapter: '04 / 05 • SOS INTERCEPTOR',
      title: 'Mindful Grounding &amp; 50m Mapbox Safety',
      subtitle: 'Bridges digital urge interruptions directly into physical real-world safe havens.'
    })
  },
  {
    name: 'scene5_paywall',
    duration: 10,
    svg: wrapPhoneMockup({
      innerSvg: scene5Inner,
      chapter: '05 / 05 • REVENUECAT COMMONS',
      title: 'Ethical Patron Commons &amp; Code SHIPATON2026',
      subtitle: '100% free crisis recovery tools with judge unlock pass powered by RevenueCat.'
    })
  }
];

async function generateVideo() {
  console.log('Rendering 5 High-Res Scene Frames for Video (1080 x 1920)...');

  const sceneClips = [];

  for (let i = 0; i < scenes.length; i++) {
    const sc = scenes[i];
    const framePng = path.join(tempDir, `${sc.name}.png`);
    const clipMp4 = path.join(tempDir, `${sc.name}.mp4`);

    await sharp(Buffer.from(sc.svg)).png({ compressionLevel: 8 }).toFile(framePng);
    console.log(`Rendered Frame: ${sc.name}.png (${sc.duration}s)`);

    // Render clip with subtle 0.4s fade in and 0.4s fade out
    const fadeInDur = 0.4;
    const fadeOutStart = sc.duration - 0.4;
    const vf = `fade=t=in:st=0:d=${fadeInDur},fade=t=out:st=${fadeOutStart}:d=0.4`;

    const ffmpegRes = spawnSync(ffmpegPath, [
      '-loop', '1',
      '-i', framePng,
      '-vf', vf,
      '-t', String(sc.duration),
      '-r', '30',
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-y',
      clipMp4
    ]);

    if (ffmpegRes.status !== 0) {
      throw new Error(`FFmpeg failed on ${sc.name}: ${ffmpegRes.stderr?.toString()}`);
    }

    console.log(`Rendered Clip: ${sc.name}.mp4`);
    sceneClips.push(clipMp4);
  }

  // Create concat list
  const concatListPath = path.join(tempDir, 'concat_list.txt');
  const concatContent = sceneClips.map(c => `file '${c.replace(/\\/g, '/')}'`).join('\n');
  fs.writeFileSync(concatListPath, concatContent);

  // Final Output 1: Vertical 9:16 Video (1080 x 1920) - 52 seconds
  const finalVerticalMp4 = path.join(mobileDir, 'aurora-app-demo-walkthrough-vertical.mp4');
  console.log('Concatenating into final vertical video...');

  const concatRes = spawnSync(ffmpegPath, [
    '-f', 'concat',
    '-safe', '0',
    '-i', concatListPath,
    '-c', 'copy',
    '-y',
    finalVerticalMp4
  ]);

  if (concatRes.status !== 0) {
    throw new Error(`FFmpeg concat failed: ${concatRes.stderr?.toString()}`);
  }

  console.log(`✅ Final Vertical Video Created: ${finalVerticalMp4}`);

  // Final Output 2: Landscape 16:9 Video (1920 x 1080) for YouTube / Devpost embed
  const finalLandscapeMp4 = path.join(mobileDir, 'aurora-app-demo-walkthrough-16x9.mp4');
  console.log('Rendering landscape 16:9 version...');

  const landscapeRes = spawnSync(ffmpegPath, [
    '-i', finalVerticalMp4,
    '-vf', 'scale=-1:1080,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black',
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-y',
    finalLandscapeMp4
  ]);

  if (landscapeRes.status !== 0) {
    throw new Error(`FFmpeg landscape failed: ${landscapeRes.stderr?.toString()}`);
  }

  console.log(`✅ Final Landscape Video Created: ${finalLandscapeMp4}`);

  // Copy to store-assets and artifacts
  fs.copyFileSync(finalVerticalMp4, path.join(outDir, 'aurora-app-demo-walkthrough-vertical.mp4'));
  fs.copyFileSync(finalLandscapeMp4, path.join(outDir, 'aurora-app-demo-walkthrough-16x9.mp4'));

  const artifactDir = 'C:/Users/aleja/.gemini/antigravity/brain/2de82b1e-942b-4dc0-8002-9ce5233891e8';
  if (fs.existsSync(artifactDir)) {
    fs.copyFileSync(finalVerticalMp4, path.join(artifactDir, 'aurora-app-demo-walkthrough-vertical.mp4'));
    fs.copyFileSync(finalLandscapeMp4, path.join(artifactDir, 'aurora-app-demo-walkthrough-16x9.mp4'));
  }

  console.log('🎉 ALL VIDEO ARTIFACTS GENERATED SUCCESSFULLY!');
}

generateVideo().catch(err => {
  console.error('Video generation error:', err);
  process.exit(1);
});
