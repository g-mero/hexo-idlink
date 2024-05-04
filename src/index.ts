import front from 'hexo-front-matter'
import fs from 'hexo-fs'
import { getFileName, processFileName } from './utils'

let maxID = 0
const log = hexo.log

// 初始化时检查文章信息
hexo.extend.filter.register('after_init', function () {
  fs.listDirSync(`${hexo.source_dir}/_posts`).forEach((path: string) => {
    path = path.replaceAll('\\', '/')
    if (!/.*\.md/.test(path)) return

    const tmpPost = front.parse(
      fs.readFileSync(`${hexo.source_dir}/_posts/${path}`) as string,
      {},
    )
    if (tmpPost.ID) {
      maxID = Math.max(maxID, tmpPost.ID)
    }

    const config = Object.assign(
      {
        auto_title: 2,
        auto_date: 2,
        auto_category: 2,
        fix: 0,
      },
      hexo.config.idlink,
    )

    let needWrite = false

    if (tmpPost.ID) {
      maxID = Math.max(maxID, tmpPost.ID)
    }

    // ------ 自动设置标题 根据文件名
    if (config.auto_title) {
      let filename = getFileName(path)
      if (config.auto_title === 2) {
        // force reWrite titile when title not equal filename
        if (config.auto_date === 2) {
          const result = processFileName(filename)
          filename = result.title
        }
        // if title not equal filename
        if (tmpPost.title !== filename) {
          tmpPost.title = filename
          needWrite = true
        }
      } else if (!tmpPost.title) {
        // if title not exist
        tmpPost.title = filename
        needWrite = true
      }
    }

    // ----- 自动设置日期 根据文件名
    if (config.auto_date) {
      const moment = hexo.extend.helper.get('moment')?.bind(hexo)

      if (
        moment &&
        (config.auto_date === 2 || (config.auto_date === 1 && !tmpPost.date))
      ) {
        const result = processFileName(getFileName(path))
        if (result.date) {
          const date = moment(result.date).format('YYYY-MM-DD')
          if (date !== moment(tmpPost.date).format('YYYY-MM-DD')) {
            tmpPost.date = moment(result.date).format('YYYY-MM-DD HH:mm:ss')
            needWrite = true
          }
        } else if (!tmpPost.date) {
          tmpPost.date = moment().format('YYYY-MM-DD HH:mm:ss')
          needWrite = true
        }
      }
    }

    // From: hexo-auto-category
    // see:https://github.com/xu-song/hexo-auto-category
    // File: hexo-auto-category\lib\logic.js
    if (config.auto_category) {
      const categories = path.split('/')

      const autoCategoryDepth = 2

      if (config.auto_category === 2 || !tmpPost.categories) {
        if (categories.length === 1) {
          tmpPost.categories = hexo.config.default_category
          needWrite = true
        } else {
          const newCategories = categories.slice(
            0,
            Math.min(autoCategoryDepth, categories.length - 1),
          )
          if (
            !Array.isArray(tmpPost.categories) ||
            tmpPost.categories.join('_') !== newCategories.join('_')
          ) {
            tmpPost.categories = newCategories
            needWrite = true
            log.info(
              'Generated: categories [%s] for post [ %s ]',
              tmpPost.categories,
              path,
            )
          }
        }
      }
    }

    if (needWrite) {
      // process post
      let postStr = front.stringify(tmpPost)
      postStr = `---\n${postStr}`
      fs.writeFileSync(`${hexo.source_dir}/_posts/${path}`, postStr, 'utf-8')
    }
  })
})

hexo.extend.filter.register(
  'before_post_render',
  function (data) {
    if (data.layout === 'post' && /.*\.md/.test(data.source)) {
      const tmpPost = front.parse(data.raw, {})
      // if write to file
      let needWrite = false

      // ----- set id
      if (!data.ID) {
        const ID = ++maxID
        data.ID = ID
        tmpPost.ID = ID
        const moment = hexo.extend.helper.get('moment')?.bind(hexo)
        if (moment)
          tmpPost.updated = moment(data.updated).format('YYYY-MM-DD HH:mm:ss')

        needWrite = true
        log.info('Generated: ID [%s] for post [ %s ]', ID, data.source)
      }

      if (needWrite) {
        // process post
        let postStr = front.stringify(tmpPost)
        postStr = `---\n${postStr}`
        fs.writeFileSync(data.full_source, postStr, 'utf-8')
      }
    }

    return data
  },
  15,
)
