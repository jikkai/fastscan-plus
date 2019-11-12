const FastScanner = require('../lib/fastscan-plus.cjs')
const chars = 'abcdefghijklmnopqrstuv'

function randomString (min, max) {
  const cs = []
  let len = 0
  if (min === max) {
    len = min
  } else {
    len = Math.floor(Math.random() * (max - min)) + min
  }
  for (let i = 0; i < len; i++) {
    const k = Math.floor(Math.random() * chars.length)
    cs.push(chars[k])
  }
  return cs.join('')
}

function randomWords (wordNum, min, max) {
  const words = []
  for (let k = 0; k < wordNum; k++) {
    words.push(randomString(min, max))
  }
  return words
}

function benchBuild () {
  const wordLen = [10, 20]
  const wordNums = [20000, 40000, 60000, 80000, 100000]
  for (let i = 0; i < wordNums.length; i++) {
    const words = randomWords(wordNums[i], wordLen[0], wordLen[1])
    const start = new Date().getTime()
    new FastScanner(words)
    const end = new Date().getTime()
    console.log('build ac tree of %d words costs %dms', words.length, end - start)
  }
}

function benchSearch () {
  const wordLen = [10, 20]
  const wordNums = [20000, 40000, 60000, 80000, 100000]
  const articleLens = [20000, 40000, 60000, 80000, 100000]
  const articles = []
  for (let i = 0; i < articleLens.length; i++) {
    articles.push(randomString(articleLens[i], articleLens[i]))
  }
  for (let i = 0; i < wordNums.length; i++) {
    const words = randomWords(wordNums[i], wordLen[0], wordLen[1])
    const scanner = new FastScanner(words)
    for (let k = 0; k < articles.length; k++) {
      const start = new Date().getTime()
      scanner.search(articles[k])
      const end = new Date().getTime()
      console.log('search article of %d chars by %s words tree costs %dms', articles[k].length, wordNums[i], end - start)
    }
  }
}

function benchMemory () {
  const wordLen = [10, 20]
  const wordNums = [0, 20000, 40000, 60000, 80000, 100000]
  for (let i = 0; i < wordNums.length; i++) {
    const words = randomWords(wordNums[i], wordLen[0], wordLen[1])
    global.gc()
    const before = process.memoryUsage()
    const scanner = new FastScanner(words)
    global.gc()
    const after = process.memoryUsage()
    scanner.search('abcdefg')
    console.log('build tree of %d words costs rss=%dM heapTotal=%dM heapUsed=%dM', wordNums[i], (after.rss - before.rss) >> 20, (after.heapTotal - before.heapTotal) >> 20, (after.heapUsed - before.heapUsed) >> 20)
  }
}

benchBuild()
benchSearch()
benchMemory()
