import Mint from 'mint-filter'
import fs from 'fs'
import path from 'path'

// 使用全局变量缓存 Mint 实例，防止每次请求都重新读取文件
// 这在 Next.js 开发环境(HMR)和生产环境中都很重要
let mintInstance: Mint | null = null

function normalizeText(text: string): string {
  return text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '')
}

export function checkComment(content: string) {
  const filter = getMintFilter()

  const cleanContent = normalizeText(content)
  const isSafe = filter.verify(cleanContent)

  if (!isSafe) {
    return { pass: false, msg: '包含违规内容' }
  }

  return { pass: true }
}

export function getMintFilter() {
  if (mintInstance) {
    return mintInstance
  }

  try {
    const filePath = path.join(process.cwd(), 'dicts', 'sensitive_words.txt')
    const fileContent = fs.readFileSync(filePath, 'utf-8')

    // 分割换行符，构建数组
    const words = fileContent
      .split(/\r?\n/) // 兼容 Windows(\r\n) 和 Linux(\n) 换行
      .map((w) => w.trim())
      .filter((w) => w)

    mintInstance = new Mint(words)

    return mintInstance
  } catch (error) {
    console.error('❌ 加载敏感词库失败:', error)
    return new Mint([])
  }
}
