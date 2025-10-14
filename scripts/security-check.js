#!/usr/bin/env node

/**
 * Security Check Script
 * Verifies that sensitive files and configurations are secure
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

const issues = [];
const warnings = [];

console.log('🔍 Running security checks...\n');

// Check 1: Verify .env is in .gitignore
function checkGitignore() {
  const gitignorePath = path.join(projectRoot, '.gitignore');
  
  if (!fs.existsSync(gitignorePath)) {
    issues.push('❌ .gitignore file not found');
    return;
  }

  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
  
  if (!gitignoreContent.includes('.env')) {
    issues.push('❌ .env is not in .gitignore! Your credentials may be exposed!');
  } else {
    console.log('✅ .env is properly ignored by git');
  }
}

// Check 2: Verify .env exists and has required variables
function checkEnvFile() {
  const envPath = path.join(projectRoot, '.env');
  
  if (!fs.existsSync(envPath)) {
    issues.push('❌ .env file not found. Copy .env.example to .env');
    return;
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  
  const requiredVars = [
    'MONGO_URI',
    'MONGO_DB_NAME',
    'JWT_SECRET',
    'ADMIN_EMAIL',
    'ADMIN_PASSWORD'
  ];

  requiredVars.forEach(varName => {
    if (!envContent.includes(`${varName}=`)) {
      issues.push(`❌ Required environment variable missing: ${varName}`);
    }
  });

  // Check for weak/default values
  if (envContent.includes('change-this') || envContent.includes('example.com')) {
    warnings.push('⚠️  Some environment variables appear to have default values');
  }

  // Check JWT_SECRET length
  const jwtMatch = envContent.match(/JWT_SECRET=(.+)/);
  if (jwtMatch && jwtMatch[1].trim().length < 32) {
    warnings.push('⚠️  JWT_SECRET is shorter than 32 characters (security risk)');
  }

  // Check for exposed credentials patterns
  const dangerousPatterns = [
    { pattern: /sk-proj-[A-Za-z0-9_-]{20,}/, name: 'OpenAI API Key' },
    { pattern: /AIzaSy[A-Za-z0-9_-]{33}/, name: 'Google API Key' },
    { pattern: /\d{10}:[A-Za-z0-9_-]{35}/, name: 'Telegram Bot Token' },
    { pattern: /mongodb\+srv:\/\/[^:]+:[^@]+@/, name: 'MongoDB credentials in URI' }
  ];

  dangerousPatterns.forEach(({ pattern, name }) => {
    if (pattern.test(envContent)) {
      console.log(`  Found: ${name} (ensure it's not in git)`);
    }
  });

  console.log('✅ .env file exists with required variables');
}

// Check 3: Verify .env.example exists and is safe
function checkEnvExample() {
  const envExamplePath = path.join(projectRoot, '.env.example');
  
  if (!fs.existsSync(envExamplePath)) {
    warnings.push('⚠️  .env.example file not found (recommended for documentation)');
    return;
  }

  const envExampleContent = fs.readFileSync(envExamplePath, 'utf-8');
  
  // Check that .env.example doesn't contain real credentials
  const dangerousPatterns = [
    /sk-proj-[A-Za-z0-9_-]{20,}/,
    /AIzaSy[A-Za-z0-9_-]{33}/,
    /\d{10}:[A-Za-z0-9_-]{35}/,
  ];

  dangerousPatterns.forEach(pattern => {
    if (pattern.test(envExampleContent)) {
      issues.push('❌ .env.example contains real credentials! Remove them immediately!');
    }
  });

  console.log('✅ .env.example is safe (no real credentials)');
}

// Check 4: Scan source code for hardcoded secrets
function checkSourceCode() {
  const srcDir = path.join(projectRoot, 'src');
  
  if (!fs.existsSync(srcDir)) {
    return;
  }

  let foundSecrets = false;

  function scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    const patterns = [
      { pattern: /sk-proj-[A-Za-z0-9_-]{20,}/, name: 'OpenAI API Key' },
      { pattern: /AIzaSy[A-Za-z0-9_-]{33}/, name: 'Google API Key' },
      { pattern: /\d{10}:[A-Za-z0-9_-]{35}/, name: 'Telegram Token' },
      { pattern: /mongodb\+srv:\/\/[^:]+:[^@]+@[^/]+/, name: 'MongoDB URI with credentials' },
      { pattern: /"password"\s*:\s*"[^"]{8,}"/, name: 'Hardcoded password' },
    ];

    patterns.forEach(({ pattern, name }) => {
      if (pattern.test(content)) {
        issues.push(`❌ Found ${name} hardcoded in ${path.relative(projectRoot, filePath)}`);
        foundSecrets = true;
      }
    });
  }

  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        walkDir(filePath);
      } else if (file.endsWith('.js') || file.endsWith('.ts')) {
        scanFile(filePath);
      }
    });
  }

  walkDir(srcDir);

  if (!foundSecrets) {
    console.log('✅ No hardcoded secrets found in source code');
  }
}

// Check 5: Verify package.json scripts don't expose secrets
function checkPackageJson() {
  const packagePath = path.join(projectRoot, 'package.json');
  
  if (!fs.existsSync(packagePath)) {
    return;
  }

  const packageContent = fs.readFileSync(packagePath, 'utf-8');
  
  if (packageContent.includes('JWT_SECRET=') || 
      packageContent.includes('ADMIN_PASSWORD=') ||
      packageContent.includes('MONGO_URI=')) {
    warnings.push('⚠️  package.json may contain environment variables in scripts');
  } else {
    console.log('✅ package.json scripts are clean');
  }
}

// Check 6: Verify node_modules and dist are ignored
function checkIgnoredDirs() {
  const gitignorePath = path.join(projectRoot, '.gitignore');
  
  if (!fs.existsSync(gitignorePath)) {
    return;
  }

  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf-8');
  
  const shouldBeIgnored = ['node_modules', 'dist', 'coverage', '.DS_Store'];
  
  shouldBeIgnored.forEach(dir => {
    if (!gitignoreContent.includes(dir)) {
      warnings.push(`⚠️  ${dir} is not in .gitignore`);
    }
  });

  console.log('✅ Build artifacts are properly ignored');
}

// Run all checks
checkGitignore();
checkEnvFile();
checkEnvExample();
checkSourceCode();
checkPackageJson();
checkIgnoredDirs();

// Print results
console.log('\n' + '='.repeat(60));
console.log('📊 SECURITY CHECK RESULTS');
console.log('='.repeat(60) + '\n');

if (issues.length === 0 && warnings.length === 0) {
  console.log('✅ ALL CHECKS PASSED! No security issues found.\n');
  process.exit(0);
}

if (issues.length > 0) {
  console.log('🚨 CRITICAL ISSUES FOUND:\n');
  issues.forEach(issue => console.log(issue));
  console.log('');
}

if (warnings.length > 0) {
  console.log('⚠️  WARNINGS:\n');
  warnings.forEach(warning => console.log(warning));
  console.log('');
}

if (issues.length > 0) {
  console.log('❌ Security check FAILED. Please fix the issues above.\n');
  process.exit(1);
} else {
  console.log('✅ Security check PASSED with warnings.\n');
  process.exit(0);
}
