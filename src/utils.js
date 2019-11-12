// 滤掉空串和空格
function dedupAndSort (words, options) {
  const result = []
  const { caseSensitivity } = options

  for (let i = 0; i < words.length; i++) {
    const word = words[i].trim()
    if (word.length) {
      const seen = {}
      if (!seen[word]) {
        seen[word] = true
        result[result.length] = caseSensitivity ? word : word.toLowerCase()
      }
    }
  }

  return result.sort()
}

function fallbackAll (root) {
  let curExpands = Object.values(root.next)
  while (curExpands.length > 0) {
    const nextExpands = []
    for (let i = 0; i < curExpands.length; i++) {
      const node = curExpands[i]
      for (const word in node.next) {
        nextExpands.push(node.next[word])
      }
      const parent = node.parent
      let back = parent.back
      while (back !== null) {
        // 匹配父节点的跳跃节点的子节点
        const child = back.next[node.val]
        if (child) {
          node.back = child
          break
        }
        back = back.back
      }
    }
    curExpands = nextExpands
  }
}

export function buildTree (words, options) {
  // 词汇去重
  words = dedupAndSort(words, options)

  const root = {
    next: {}, // 子节点指针
    val: null, // 当前节点的字符，null表示根节点
    back: null, // 跳跃指针，也称失败指针
    parent: null, // 父节点指针,
    accept: false // 是否形成了一个完整的词汇，中间节点也可能为true
  }
  // make trie tree
  for (let i = 0; i < words.length; i++) {
    addWord(root, words[i])
  }
  // fix backtrace pointer
  fallbackAll(root)
  return root
}

export function addWord (root, words) {
  let current = root
  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    const next = current.next[word]
    if (!next) {
      current.next[word] = {
        next: {},
        val: word,
        accept: false,
        back: root,
        parent: current
      }
    }
    current = current.next[word]
  }
  current.accept = true
}

export function fallback (root, words) {
  let current = root.next[words[0]]
  for (let i = 1; i < words.length; i++) {
    const word = words[i]
    const parent = current.parent
    let back = parent.back
    while (back !== null) {
      // 匹配父节点的跳跃节点的子节点
      const child = back.next[current.val]
      if (child) {
        current.back = child
        break
      }
      back = back.back
    }
    current = current.next[word]
  }
}

export function selectLongest (offsetWords) {
  const stands = {}
  for (let i = 0; i < offsetWords.length; i++) {
    const offword = offsetWords[i]
    const word = stands[offword[0]]
    if (!word || word.length < offword[1].length) {
      stands[offword[0]] = offword[1]
    }
  }
  const offsets = Object.keys(stands).map(function (key) {
    return parseInt(key)
  }).sort((a, b) => a - b)

  return offsets.map(off => [off, stands[off]])
}

// 从子节点往上直到根结点，收集单词
export function collect (node) {
  const words = []
  while (node.val !== null) {
    words.unshift(node.val)
    node = node.parent
  }
  return words.join('')
}
