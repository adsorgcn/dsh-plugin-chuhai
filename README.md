# dsh-plugin-chuhai · 自媒体出海

iLang DSH 工具包的第一个官方插件，也能单独用。装上以后，对你的 DeepSeek Harness 说一句：

> 自媒体出海

它就从零带你做：写作人格、内容源、知识库、出文章、公众号走通，再到买海外服务器、配好设备、注册 X、开 Premium。你只做付款、扫码、登录、授权这几件事，其余它做。

目前进度：到 X 开 Premium。再往后的环在更新中，插件更新后再说一句就接着走。

## 怎么装

最短的路：装好 DeepSeek Harness（0.2.1-rc.5 及以上的 0.2.x），侧栏「插件」→「添加插件」填 `dsh-plugin-chuhai`，装好说一句「自媒体出海」。命令行：`dsh plugin --profile desktop add dsh-plugin-chuhai`。

照 https://dsh.ilang.guide/ 上的三步装 iLang DSH 工具包，会顺手把这个插件装上，还多一份记忆交接（窗口关了进度还在）。

## 它做了什么

- 注册一个技能 `zimeiti-chuhai`：说「自媒体出海」时模型自己加载。
- 注册两个工具：`chuhai_main_book` 取前半段的书（随插件带着，不走网络）；`chuhai_book` 取后半段（放在 dsh.chuhai.express，带访问密码，插件替你的 DSH 带上密码）。书比一次工具结果能装的长，所以一次取一段：先看目录，再按段取。
- 不收集任何东西，不带你的钥匙，不改你的记忆。不调用取书工具就没有任何网络请求。

## 许可

MIT。前半段那本书「AI全球自媒体」同样 MIT，和 iLang DSH 工具包里的是同一份。
