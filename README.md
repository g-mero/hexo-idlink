## hexo-idlink
这是一个hexo的插件，用于生成类似于数据库id那样的唯一链接，支持根据路径自动生成标题、分类，也支持自动生成日期

### config
开启全部功能后，你可以这么命名你的文件 "关于xxx的xx-202305012301"
插件会自动分割识别，生成标题和对应的日期(YYYYMMDDHHmmss)，HHmmss非必须
```yaml
idlink:
  auto_title: 2 # 0:disable; 2: title by filename; 3: force (overwrite if title exist)
  auto_date: 2 # 0: disable; 1: date today; 2: force to filename(title-20230501) or today
  auto_category: 2 # 0: disable; 1: generate category by path; 2: overwrite when exist
  # todo
  fix: 0 # 0:disable; 1: fix ID when id is not number or id is duplicated
```