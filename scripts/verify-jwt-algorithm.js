#!/usr/bin/env node

/**
 * Script to verify JWT algorithm is HS256
 * This decodes a JWT token and shows its header information
 */

import jwt from 'jsonwebtoken';
import { generateToken } from '../src/utils/auth.js';

console.log('🔐 Verificando algoritmo JWT...\n');

// Generate a test token
const testPayload = {
  sub: 'test@example.com',
  role: 'User'
};

try {
  const token = generateToken(testPayload, '1h');
  console.log('✅ Token generado exitosamente\n');
  
  // Decode without verification to see header
  const decoded = jwt.decode(token, { complete: true });
  
  console.log('📋 Información del Token:');
  console.log('─────────────────────────────────────');
  console.log('Header:');
  console.log(`  Algoritmo: ${decoded.header.alg}`);
  console.log(`  Tipo: ${decoded.header.typ}`);
  console.log('\nPayload:');
  console.log(`  Usuario: ${decoded.payload.sub}`);
  console.log(`  Rol: ${decoded.payload.role}`);
  console.log(`  Expira en: ${new Date(decoded.payload.exp * 1000).toLocaleString()}`);
  console.log('─────────────────────────────────────\n');
  
  if (decoded.header.alg === 'HS256') {
    console.log('✅ CONFIRMADO: El algoritmo JWT es HS256\n');
  } else {
    console.log(`⚠️  ADVERTENCIA: El algoritmo es ${decoded.header.alg}, esperado HS256\n`);
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
