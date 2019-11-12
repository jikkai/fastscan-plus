import { buildTree, addWord, fallback, selectLongest, collect } from './utils'

class FastScanPlus {
  constructor (words, options = {
    caseSensitivity: true
  }) {
    this.options = options
    this.root = buildTree(words, options)
  }

  add (word) {
    const { caseSensitivity } = this.options
    word = caseSensitivity ? word.trim() : word.trim().toLowerCase()

    if (!word.length) return

    addWord(this.root, word)
    fallback(this.root, word)
  }

  // 定位子节点
  locate (words) {
    const { caseSensitivity } = this.options

    const word = caseSensitivity ? words[0] : words[0].toLowerCase()
    let current = this.root.next[word]
    for (let i = 1; i < words.length; i++) {
      const word = words[i]
      current = current.next[word]
      if (current == null) {
        break
      }
    }
    return current
  }

  hits (contents, options) {
    const { caseSensitivity } = this.options

    const offWords = this.search(contents, options)
    const seen = {}
    for (let i = 0; i < offWords.length; i++) {
      const offWord = offWords[i][1]
      const word = caseSensitivity ? offWord : offWord.toLowerCase()
      const count = seen[word] || 0
      seen[word] = count + 1
    }
    return seen
  }

  search (contents, options = {}) {
    const { caseSensitivity } = this.options
    const offWords = []
    let current = this.root

    for (let i = 0; i < contents.length; i++) {
      const content = caseSensitivity ? contents[i] : contents[i].toLowerCase()
      let next = current.next[content]

      if (!next) {
        // 当前分支上找不到，跳到其它分支上找
        let back = current.back
        while (back) {
          next = back.next[content]
          if (next) {
            break
          }
          back = back.back
        }
      }
      if (next) {
        let back = next
        do {
          // 收集匹配的词汇
          if (back.accept) {
            const word = collect(back)
            const index = i - word.length + 1
            if (caseSensitivity) {
              offWords.push([index, word])
            } else {
              const realWord = contents.slice(index, index + word.length)
              offWords.push([index, realWord])
            }
            // 只选第一个词
            if (options.quick) {
              return offWords
            }
          }
          back = back.back
        } while (back !== this.root)
        current = next
        continue
      }
      // 重置
      current = this.root
    }
    // 同一个位置选最长的
    if (options.longest) {
      return selectLongest(offWords)
    }
    return offWords
  }
}

FastScanPlus.__VERSION__ = process.env.APP_VERSION

export default FastScanPlus
