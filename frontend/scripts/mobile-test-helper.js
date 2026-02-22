#!/usr/bin/env node

/**
 * Mobile Testing Helper Script
 * Provides utilities to help with Chrome Mobile testing
 */

const os = require('os');
const { execSync } = require('child_process');

console.log('🔧 Chrome Mobile Testing Helper\n');

// Get local IP addresses
function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  
  return ips;
}

// Check if ADB is available
function checkADB() {
  try {
    execSync('adb version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Get connected Android devices
function getConnectedDevices() {
  try {
    const output = execSync('adb devices', { encoding: 'utf-8' });
    const lines = output.split('\n').slice(1); // Skip header
    const devices = lines
      .filter(line => line.trim() && !line.includes('List of devices'))
      .map(line => line.split('\t')[0]);
    return devices;
  } catch (error) {
    return [];
  }
}

// Main
console.log('📱 Local Network Information:');
console.log('─────────────────────────────');

const ips = getLocalIPs();
if (ips.length > 0) {
  console.log('Your local IP addresses:');
  ips.forEach(ip => {
    console.log(`  • http://${ip}:5173 (dev server)`);
    console.log(`  • http://${ip}:4173 (preview server)`);
  });
} else {
  console.log('⚠️  No local IP addresses found');
}

console.log('\n🔌 Android Device Status:');
console.log('─────────────────────────────');

if (checkADB()) {
  console.log('✅ ADB is installed');
  
  const devices = getConnectedDevices();
  if (devices.length > 0) {
    console.log(`✅ ${devices.length} device(s) connected:`);
    devices.forEach(device => console.log(`  • ${device}`));
  } else {
    console.log('⚠️  No devices connected');
    console.log('\nTo connect a device:');
    console.log('  1. Enable USB debugging on your Android device');
    console.log('  2. Connect via USB cable');
    console.log('  3. Allow USB debugging when prompted');
  }
} else {
  console.log('⚠️  ADB is not installed');
  console.log('\nTo install ADB:');
  console.log('  • Windows: Download Android SDK Platform Tools');
  console.log('  • Mac: brew install android-platform-tools');
  console.log('  • Linux: sudo apt-get install android-tools-adb');
}

console.log('\n🌐 Chrome Remote Debugging:');
console.log('─────────────────────────────');
console.log('1. Open Chrome on desktop');
console.log('2. Navigate to: chrome://inspect');
console.log('3. Your device should appear under "Remote Target"');
console.log('4. Click "Inspect" to open DevTools');

console.log('\n📋 Quick Testing Steps:');
console.log('─────────────────────────────');
console.log('1. Start dev server: npm run dev');
console.log('2. On mobile, open Chrome');
console.log('3. Navigate to one of the IP addresses above');
console.log('4. Follow the testing checklist in docs/testing/CHROME_MOBILE_TESTING.md');

console.log('\n✨ Testing Checklist:');
console.log('─────────────────────────────');
console.log('[ ] Dark mode toggle and persistence');
console.log('[ ] Performance (FCP < 1.8s, TTI < 3.8s)');
console.log('[ ] PWA installation and offline mode');
console.log('[ ] Smooth animations (300ms)');
console.log('[ ] Accessibility (TalkBack, touch targets)');
console.log('[ ] SEO meta tags and structured data');
console.log('[ ] Error boundaries and recovery');
console.log('[ ] Loading states and transitions');
console.log('[ ] Responsive design (portrait/landscape)');
console.log('[ ] Integration (Pusher, Cloudinary, etc.)');

console.log('\n📖 Full documentation:');
console.log('   docs/testing/CHROME_MOBILE_TESTING.md');
console.log('');
