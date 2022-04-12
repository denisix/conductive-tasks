const fs = require('fs'),
  readline = require('readline'),
  parseLine = require('./parseLine')

Map.prototype.inc = function (k) { this.set(k, (this.get(k) ?? 0) + 1) }
Map.prototype.push = function (k, v) { this.set(k, [...(this.get(k) ?? []), v]) }

console.log('- reading file..')
const raw = fs.readFileSync('school_data.csv').toString()
const lines = raw.split('\r\n')
const m = new Map()

console.log('- parsing & indexing (can take some time)..')
const usedKeys = [3, 4, 5]
for (let l = 1; l < lines.length; l++) {
  if (!lines[l]) continue // skip empty lines

  const values = parseLine(lines[l]) // parse line to array of values

  const terms = []

  // use only school name, city, state keys + split each sentence to words:
  for (let x = 0; x < usedKeys.length; x++) {
    const k = usedKeys[x]
    terms.push(...values[k].split(/[\s\,\"\.]+/))
  }

  // lets create indexes from 1 word to couple of words in right order
  for (let pair = 1; pair < terms.length; pair++) {
    for (let t = 0; t < terms.length; t += pair) {
      if (t + pair > terms.length) continue // out of index
      const sentence = []
      for (let i = 0; i < pair; i++) sentence.push(terms[t + i].toLowerCase())
      m.push(sentence.join(' '), l)
    }
  }
}
console.log('- ready.\n')

const search = name => {

  const terms = name.split(/[\s\,\"\.]+/).map(i => i.toLowerCase())

  // to store line index of found terms
  let flines = []

  // it can be whole sentence (correct word order) or couple of words, or pairs, or single word
  for (let pair = terms.length; pair > 0; pair--) {

    const pairs = []
    for (let t = 0; t < terms.length; t += pair) {
      if (t + pair > terms.length) continue // out of index

      const sentence = []
      for (let i = 0; i < pair; i++) sentence.push(terms[t + i].toLowerCase())

      pairs.push(sentence.join(' '))
    }

    // check each term in that pair and filter results
    pairs.forEach(t => {
      const ls = m.get(t)

      if (ls) { // term found, pushing line indexes

        if (flines.length > 0) {
          // prevent filtering out everyth.
          const tmp = flines.filter(i => ls.includes(i))
          if (tmp.length) flines = tmp
        } else {
          flines.push(...ls)
        }
      }
    })
  }

  // count occurrence of each line index
  const mids = new Map()
  for (l = 0; l < flines.length; l++) {
    mids.inc(flines[l])
  }

  // sort by index occurrences, return top 3
  const top = new Map([...mids.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3))
  // console.log('- mids ->', top)

  // render by mapping
  let res = []
  top.forEach((_, l) => {
    res.unshift(parseLine(lines[l]))
  })

  return res
}

// input
const q = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const ask = () => {
  q.question('Search school: ', name => {
    console.log('- searching..')
    const t0 = Date.now()

    // arr idx: 3 - school name, 4 - city, 5 - state
    const out = search(name).map((a, idx) => `${idx + 1}. ${a[3]}\n${a[4]}, ${a[5]}`).join('\n')
    const ms = Date.now() - t0

    console.log(`Results for "${name}" (search took`, ms, `ms):\n${out}\n`)

    ask() // to ask next
  })
}

ask()