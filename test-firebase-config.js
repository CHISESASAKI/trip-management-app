// Firebase設定テスト用スクリプト
import { checkFirebaseConfig } from './src/utils/firebaseCheck.js';

console.log('🔥 Firebase Config Check');
console.log('========================');

const config = checkFirebaseConfig();

console.log('Config Valid:', config.isValid ? '✅ YES' : '❌ NO');

if (config.missing.length > 0) {
  console.log('Missing values:', config.missing);
}

if (config.invalid.length > 0) {
  console.log('Invalid/Placeholder values:', config.invalid);
}

console.log('\nConfig values:');
Object.entries(config.config).forEach(([key, value]) => {
  const maskedValue = key.includes('API_KEY') 
    ? `${value.substring(0, 10)}...${value.substring(value.length - 4)}`
    : value;
  console.log(`- ${key}: ${maskedValue}`);
});

if (config.isValid) {
  console.log('\n🎉 Firebase configuration is ready!');
  console.log('You can now use Firebase features in your app.');
} else {
  console.log('\n⚠️  Firebase configuration needs attention.');
}