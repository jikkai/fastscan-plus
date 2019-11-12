const assert = require('assert')
const fs = require('fs')
const FastScanner = require('../lib/fastscan-plus.cjs')

describe('测试单一词汇', function () {
  const scanner = new FastScanner(['江泽民'])
  it('成功扫出来', function () {
    const content = '我不是江泽民的儿子，我跟江泽民没有任何关系'
    let offWords = scanner.search(content)
    assert.deepStrictEqual([[3, '江泽民'], [12, '江泽民']], offWords)
    offWords = scanner.search(content, { quick: true })
    assert.deepStrictEqual([[3, '江泽民']], offWords)
    offWords = scanner.search(content, { longest: true })
    assert.deepStrictEqual([[3, '江泽民'], [12, '江泽民']], offWords)
  })

  it('扫不出来的', function () {
    const content = '我不喜欢喝江小白，我喜欢喝鸡尾酒'
    let offWords = scanner.search(content)
    assert.strictEqual(0, offWords.length)
    offwords = scanner.search(content, { quick: true })
    assert.strictEqual(0, offWords.length)
    offWords = scanner.search(content, { longest: true })
    assert.strictEqual(0, offWords.length)
  })
})

describe('大小写敏感性', function () {
  const scanner = new FastScanner(['jZm'], { caseSensitivity: false })
  it('成功扫出来', function () {
    const content = '我不是Jzm的儿子，我跟JZM没有任何关系'
    let offWords = scanner.search(content)
    offWords = scanner.search(content)
    assert.deepStrictEqual([[3, 'Jzm'], [12, 'JZM']], offWords)
  })

  it('扫不出来的', function () {
    const content = '我不喜欢喝江小白，我喜欢喝鸡尾酒'
    let offWords = scanner.search(content)
    offWords = scanner.search(content)
    assert.strictEqual(0, offWords.length)
  })
})

describe('测试多个独立词汇', function () {
  const scanner = new FastScanner(['江泽民', '习近平', '胡锦涛'])
  it('成功扫出来', function () {
    const content = '我不是江泽民的儿子，也不是习近平的儿子，更不是胡锦涛的儿子'
    let offWords = scanner.search(content)
    assert.deepStrictEqual([[3, '江泽民'], [13, '习近平'], [23, '胡锦涛']], offWords)
    offWords = scanner.search(content, { quick: true })
    assert.deepStrictEqual([[3, '江泽民']], offWords)
    offWords = scanner.search(content, { longest: true })
    assert.deepStrictEqual([[3, '江泽民'], [13, '习近平'], [23, '胡锦涛']], offWords)
  })

  it('扫不出来的', function () {
    const content = '我不喜欢喝江小白，我喜欢喝鸡尾酒'
    let offWords = scanner.search(content)
    assert.strictEqual(0, offWords.length)
    offWords = scanner.search(content, { quick: true })
    assert.strictEqual(0, offWords.length)
    offWords = scanner.search(content, { longest: true })
    assert.strictEqual(0, offWords.length)
  })
})

describe('测试叠加词汇', function () {
  it('简单扫一下', function () {
    const scanner = new FastScanner(['近平', '习近平棒', '习近平好'])
    const content = '习近平拽'
    const offWords = scanner.search(content)
    console.log(offWords)
    assert.deepStrictEqual([[1, '近平']], offWords)
  })

  it('扫的狠一点', function () {
    const scanner = new FastScanner(['近平', '习近平', '习近平好'])
    const content = '我不说习近平好，也不是习近平坏'
    let offWords = scanner.search(content)
    assert.deepStrictEqual([[3, '习近平'], [4, '近平'], [3, '习近平好'], [11, '习近平'], [12, '近平']], offWords)
    offWords = scanner.search(content, { quick: true })
    assert.deepStrictEqual([[3, '习近平']], offWords)
    offWords = scanner.search(content, { longest: true })
    assert.deepStrictEqual([[3, '习近平好'], [4, '近平'], [11, '习近平'], [12, '近平']], offWords)
  })
})

describe('wikipedia demo', function () {
  it('一个都不能少', function () {
    const scanner = new FastScanner(['a', 'ab', 'bab', 'bc', 'bca', 'c', 'caa'])
    const offWords = scanner.search('abccab')
    assert.deepStrictEqual([[0, 'a'], [0, 'ab'], [1, 'bc'], [2, 'c'], [3, 'c'], [4, 'a'], [4, 'ab']], offWords)
  })
})

describe('动态增加词汇', function () {
  it('动态增加别出错', function () {
    const scanner = new FastScanner(['近平', '习近平', '习近平好'])
    scanner.add('江泽民')
    scanner.add('泽民')
    scanner.add('江泽民好')
    const node = scanner.locate('江泽民好')
    assert.strictEqual('好', node.val)
    assert.strictEqual('民', node.parent.val)
    assert.strictEqual('泽', node.parent.parent.val)
    assert.strictEqual('江', node.parent.parent.parent.val)
    assert.strictEqual('泽', node.parent.parent.back.val)
    assert.strictEqual('民', node.parent.back.val)
  })
})

describe('排列组合词汇', function () {
  it('不许闹出死循环', function () {
    const seed = 'abcdefg'.split('')
    function permutator (inputArr) {
      const results = []

      function permute (arr, memo = []) {
        let cur

        for (let i = 0; i < arr.length; i++) {
          cur = arr.splice(i, 1)
          if (arr.length === 0) {
            results.push(memo.concat(cur))
          }
          permute(arr.slice(), memo.concat(cur))
          arr.splice(i, 0, cur[0])
        }

        return results
      }

      return permute(inputArr)
    }
    const words = permutator(seed)
    for (let i = 0; i < words.length; i++) {
      words[i] = words[i].join('')
    }
    const scanner = new FastScanner(words)
    for (let i = 0; i < words.length; i++) {
      scanner.search(words[i])
    }
  })
})

describe('猛量单词测试', function () {
  let words = fs.readFileSync('./tests/words')
  words = words.toString().split('\n')
  words = words.filter(function (word) {
    return word.length > 0
  })
  const scanner = new FastScanner(words)

  it('扫啊扫啊扫的痛啊', function () {
    const content = `
        1995年中共执政当局开始寻求强化法轮功的组织构架及与政府的关系。
        中国政府的国家体委、公共健康部和气功科研会，访问李洪志，要求联合成立法轮功协会，但李洪志表示拒绝。
        同年，气功科研会通过一项新规定，命令所有气功分会必须建立中国共产党党支部，但李洪志再次表示拒绝。
        李洪志与中国气功科研会的关系在1996年持续恶化。
        1996 年3月，法轮功因拒不接受中国气功协会新负责人在“气功团体内部收取会员费创收”和“成立中国共产党党支部组织”的要求，
        主动申请退出中国气功协会和中国 气功科研会, 以独立非政府形式运作。
        自此，李洪志及其法轮功脱离了中国气功协会中的人脉和利益交换，同时失去了功派在中国政府体制系统的保护。
        法轮功申请退出中国气功协会，是与中国政府对气功的态度产生变化相对应的；
        当时随气功激进反对者在政府部门中的影响力增加，中国政府开始控制和影响各气功组织。
        90年代中期，中国政府主管的媒体开始发表文章批评气功。
        法轮功起初并没有受批评，但在1996年3月退出中国气功协会后，失去了政府体制的保护。
        `
    console.log(scanner.search(content))
    console.log(scanner.search(content, { quick: true }))
    console.log(scanner.search(content, { longest: true }))
  })
})

describe('超大型词汇', function () {
  const words = []
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < 50000; i++) {
    const len = Math.floor(Math.random() * 20 + 20)
    const word = []
    for (let k = 0; k < len; k++) {
      word.push(chars[Math.floor(Math.random() * chars.length)])
    }
    words.push(word.join(''))
  }
  const start = new Date().getTime()
  new FastScanner(words)
  const end = new Date().getTime()
  console.log('50000 words costs %dms', end - start)
})
