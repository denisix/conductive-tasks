const fs = require('fs')
const parseLine = require('./parseLine')
Map.prototype.inc = function (k) { this.set(k, (this.get(k) ?? 0) + 1) }

// performance measure & optimization
const t0 = Date.now()
const usedKeys = [0, 4, 5, 8]

console.log('- reading file..')
const raw = fs.readFileSync('school_data.csv').toString()
const lines = raw.split('\r\n')
const keys = lines[0].split(',')
const maps = {}

console.log('- parsing & indexing..')
for (let k = 0; k < keys.length; k++)  maps[keys[k]] = new Map()

// parse each line
for (let l = 1; l < lines.length; l++) {
  if (!lines[l]) continue // skip empty lines

  const values = parseLine(lines[l]) // parse line to array of values

  for (let x = 0; x < usedKeys.length; x++) {
    const k = usedKeys[x]
    maps[keys[k]].inc(values[k], k)
  }
}

console.log('- 1. Total Schools:', maps.NCESSCH.size)
console.log('- 2. Schools By State:', maps.LSTATE05)
console.log('- 3. Schools by Metro-centric locale:', maps.MLOCALE)

// calc max & uniq schools
let stateMaxSchools = '', stateMaxSchoolsCnt = 0, uniqCities1School = 0
maps.LCITY05.forEach((v, k) => {
  if (v > stateMaxSchoolsCnt) {
    stateMaxSchoolsCnt = v
    stateMaxSchools = k
  } else
    if (v === 1) {
      uniqCities1School++
    }
})
console.log(`- 4. City with most schools: ${stateMaxSchools} (${stateMaxSchoolsCnt} schools)`)

console.log('- 5. Unique cities with at least one school:', uniqCities1School)

console.log('- 6. Elapsed time ->', Date.now() - t0, 'ms')