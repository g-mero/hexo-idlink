export function getFileName(path: string): string {
  const reg = /\/([^/]+)\.md$/
  const match = path.match(reg)
  let filename = ''
  if (match) {
    filename = match[1]
  }
  return filename
}

export interface FileTitleDate {
  title: string
  date: null | string
}

export function processFileName(fileName: string): FileTitleDate {
  const index = fileName.lastIndexOf('-')
  const result: FileTitleDate = {
    title: fileName,
    date: null,
  }
  if (index) {
    const title = fileName.slice(0, Math.max(0, index))
    const date = fileName.slice(Math.max(0, index + 1))
    const regex = /^\d{8}$|^\d{10}$|^\d{12}$|^\d{14}$/
    if (regex.test(date)) {
      result.title = title
      const year = date.slice(0, 4)
      const month = date.slice(4, 6)
      const day = date.slice(6, 8)
      const hour = date.slice(8, 10)
      const minute = date.slice(10, 12)
      const second = date.slice(12, 14)
      let time = ''
      if (hour) {
        time += ` ${hour}`
        if (minute) time += `:${minute}`
        if (second) time += `:${second}`
      }
      result.date = `${year}-${month}-${day}${time}`
    }
  }

  return result
}
