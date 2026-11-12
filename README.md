# dsh-plugin-chuhai · 自媒体出海

iLang DSH 工具包的第一个官方插件。装上以后，对你的 DeepSeek Harness 说一句：

> 自媒体出海

它就从零带你做：装好工具包、写作人格、内容源、知识库、出文章、公众号走通，再到买海外服务器、配好设备、注册 X、开 Premium。你只做付款、扫码、登录、授权这几件事，其余它做。

目前进度：到 X 开 Premium。再往后的环在更新中，插件更新后再说一句就接着走。

## 怎么装

照 https://dsh.ilang.guide/ 上的三步做就行；工具包装完会顺手把这个插件装上。

手动装：DeepSeek Harness 侧栏「插件」→「添加插件」填 `dsh-plugin-chuhai`，或命令行 `dsh plugin --profile desktop add dsh-plugin-chuhai`。要求 DSH 0.2.1-rc.5 及以上的 0.2.x。

## 它做了什么

- 注册一个技能 `zimeiti-chuhai`：说「自媒体出海」时模型自己加载，照工具包里那本「AI全球自媒体」走第一段。
- 注册一个工具 `chuhai_book`：第二段（出海）的工程书放在 dsh.chuhai.express，带访问密码，插件替你的 DSH 带上密码取回来。不调用就没有任何网络请求。
- 不收集任何东西，不带你的钥匙，不改你的记忆。

## 许可

MIT。
