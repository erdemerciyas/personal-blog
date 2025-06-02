console.log('🔍 cPanel Memory & WebAssembly Test')
console.log('=====================================')

// System info
console.log('Node.js Version:', process.version)
console.log('Platform:', process.platform)
console.log('Architecture:', process.arch)

// Memory usage
const memUsage = process.memoryUsage()
console.log('\n📊 Memory Usage:')
console.log('Heap Used:', Math.round(memUsage.heapUsed / 1024 / 1024), 'MB')
console.log('Heap Total:', Math.round(memUsage.heapTotal / 1024 / 1024), 'MB')
console.log('External:', Math.round(memUsage.external / 1024 / 1024), 'MB')
console.log('RSS:', Math.round(memUsage.rss / 1024 / 1024), 'MB')

// WebAssembly test
console.log('\n🧪 WebAssembly Test:')
try {
  // Minimal WASM module (empty module)
  const wasmBytes = new Uint8Array([
    0x00, 0x61, 0x73, 0x6d, // WASM magic number
    0x01, 0x00, 0x00, 0x00  // Version 1
  ])
  
  const wasmModule = new WebAssembly.Module(wasmBytes)
  const wasmInstance = new WebAssembly.Instance(wasmModule)
  
  console.log('✅ WebAssembly: SUPPORTED')
  console.log('   Module created successfully')
  console.log('   Instance created successfully')
} catch (error) {
  console.log('❌ WebAssembly: FAILED')
  console.log('   Error:', error.message)
  console.log('   This is likely the cause of your Next.js deployment issues')
}

// Memory allocation test
console.log('\n💾 Memory Allocation Test:')
try {
  // Test small allocation (10MB)
  const smallArray = new Array(1000000).fill('x')
  console.log('✅ Small allocation (10MB): OK')
  
  // Test medium allocation (50MB)
  const mediumArray = new Array(5000000).fill('test')
  console.log('✅ Medium allocation (50MB): OK')
  
  // Test large allocation (100MB)
  const largeArray = new Array(10000000).fill('large')
  console.log('✅ Large allocation (100MB): OK')
  
} catch (error) {
  console.log('❌ Memory allocation failed:', error.message)
  console.log('   Your hosting plan has insufficient memory for Next.js')
}

// CPU intensive test
console.log('\n⚡ CPU Performance Test:')
const startTime = Date.now()
let counter = 0
for (let i = 0; i < 1000000; i++) {
  counter += Math.random()
}
const endTime = Date.now()
console.log('CPU test completed in:', endTime - startTime, 'ms')

if (endTime - startTime > 5000) {
  console.log('⚠️  CPU performance is limited (shared hosting)')
} else {
  console.log('✅ CPU performance is acceptable')
}

// Environment variables check
console.log('\n🔧 Environment Check:')
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set')
console.log('PORT:', process.env.PORT || 'not set')
console.log('Memory limit (NODE_OPTIONS):', process.env.NODE_OPTIONS || 'not set')

// Final assessment
console.log('\n📋 Assessment:')
const heapMB = Math.round(memUsage.heapUsed / 1024 / 1024)

if (heapMB < 100) {
  console.log('🟢 Memory usage is low - good for basic apps')
} else if (heapMB < 200) {
  console.log('🟡 Memory usage is moderate - may work for small Next.js apps')
} else {
  console.log('🔴 Memory usage is high - likely insufficient for Next.js')
}

console.log('\n🎯 Recommendations:')
console.log('- Next.js requires minimum 512MB memory')
console.log('- WebAssembly support is essential')
console.log('- Consider Vercel, Netlify, or VPS hosting')
console.log('- Current cPanel shared hosting may be insufficient')

console.log('\n✅ Test completed!') 