::ILANG::v5.0::ENGINEERING_BOOK
[TYPE:engineering_book]
[ID:AI-GLOBAL-MEDIA]
[VERSION:0.2.5]
[DATE:2026-11-13]
[LANG:zh]

::STATE{@USER, role:decision_maker, is:只会用豆包问问题的新手, does:说一句话 点头 扫码 粘贴 自己付钱}
::STATE{@AGENT, role:you_the_user_s_own_AI_running_in_DeepSeek_Harness_with_the_iLang_DSH_kit, does:everything_the_user_does_not_have_to_do, never:替用户扫码 登录 授权 付款}
::STATE{@KIT, persona_slot:soul/agent.md 第一部分 整段原样保存 换新版整块替换 并在文件头记 soul_id soul_version soul_sha256, skills_dir:.dsh/skills, poster:.dsh/books/ai-global-media/poster.jpg 生财三天体验卡, poster_poju:.dsh/books/ai-global-media/poster-poju.jpg 破局七天会员, profile:soul/soul.md 装工具包时问出来的用户档案, trail:handoff 与 log 里从第一天起记下的经过}
::STATE{@EXPERT, name:公众号爆文专家, repo:https://github.com/adsorgcn/WorkBuddy, mirror:https://gitee.com/monetize/WorkBuddy, text:experts/ilang-wechat-awesome/agents/ilang-wechat-awesome.md 开头两行分隔线之后的全部, skills:experts/ilang-wechat-awesome/skills 下的文件夹 至少 wechat-article wechat-draft-push wechat-topic-hunter}
::STATE{@FEED, what:拉热点源的方法 不是谁家的网站 专家的 wechat-topic-hunter 技能自带 scripts 下的 hot_sources.py 与 sources.json 八十多个公开源 中英日韩 打不开的源跳过 跨平台同一件事聚一起 按 AI 科技 热榜 财经 产品 海外 热搜词 七个方向 只拿标题和链接当选题线索 不搬正文 只用标准库 不要 key 不要账号, how:在用户自己的机器上跑 python hot_sources.py --cluster --json 结果落成 @STORE 的 feed 里当天那一份 文件名是日期；读的时候只读本机这一份；源表随专家包一起更新 装第一环时就带来了, not:不读 WorkBuddy 仓库每天生成的 latest.json 当源 那只是同一套方法在仓库里跑出来的结果 仓库没了本机照拉, daily:每天拉一次 并进 @SCHEDULE 那条提醒, side:这是需求侧 今天有人在聊什么；供给侧 公众号上这个题读了多少 是同一个技能的 hot 命令 走 wxrank 要花用户的钱 先报价}
::STATE{@SCYS, what:生财有术的官方 MCP, auth:OAuth 网页授权 用户自己用生财账号登录 配置里没有密钥, mode:只读, trial:体验卡用户也能接 开放搜索和阅读 每天有使用额度 卡只有三天, limit:同一个生财账号可以同时接 7 个 Agent DeepSeek Harness 与豆包各占一个 互不影响, manage:https://scys.com/mcp 生财的接入管理页 用户可以在那里查看和撤销自己的连接, tools:工具名都以 mcp__scys-mcp__ 开头 搜帖用 searchTopic 看全文用 topicDetail 问 AI 亦仁用 startAiYiRenChat 再用 queryAiYiRenChat 取回答}
::STATE{@PLUGIN, what:生财有术官方给 DeepSeek Harness 出的插件 许可 MIT, name:dsh-plugin-scys-mcp, source:npm, install:用 plugin_manager 工具安装这个组合包并启用, by_hand:左侧菜单 插件 右上角 添加插件 填 dsh-plugin-scys-mcp 点 安装 再点 立即启用, after:启用后它自动打开浏览器授权页 授权成功后几秒内工具出现, reauth:调用 mcp__scys-mcp__auth 重新打开授权页}
::STATE{@POJU, what:AI破局俱乐部的官方 CLI 命令叫 breakout, official:https://aipoju.com/cli 破局官网的 CLI 页, install:走工具包的免费全家桶 先问用户同意 再跑 tools/free_station.py install node breakout-cli --yes 都是官方源 已装的跳过 装完它自己验, auth:在终端跑 breakout auth login 加 --no-browser 它打印一条官网授权链接 链接约五分钟有效 这条命令要开着等到用户点完才算登录上 超时就重跑 配置里没有密钥 凭据由 CLI 自己存, mode:只读, trial:海报扫码领七天会员 试用装能用 CLI, tools:工具名都以 mcp__breakout__ 开头 具体能力名先用它查能力清单的那个工具查出来再调 不写死；只用读的 搜主题 看全文 按作者 问 AI 洋哥 问一次带 question 与一个 16 到 64 位的 requestId 回答一次就回来, sync:帖子从知识星球按小时同步 最新的最多晚一小时, limit:限流时 CLI 自己重试两次 再超就照返回的秒数等, manage:官网账号菜单 登录设备 可下线这台电脑}
::STATE{@MCP_POJU, what:把 breakout 接进 DeepSeek Harness 用它官方接 MCP 的做法 不装别的插件, entry:一条 MCP 客户端条目 id 是 mcp-breakout name 是 npm 上 deepseek-ai 组织下的 dsh-mcp-client 写成 at 号 组织名 斜杠 包名 config 里 serverName breakout transport stdio command breakout args 是 mcp 与 serve 两项, how:照官方文档 接入其他 MCP 服务器 的写法 把这一条 insert 合并进用户 patch 层 就是主目录下的 cordis.patch.yml 没有就新建 有就保留原内容再加 别的文件不动；你身上带着接 MCP 的技能就照它做 也算, before:先装好 CLI 并登录, after:工具以 mcp__breakout__ 开头出现 没出现就请用户重启一次 DeepSeek Harness}
::STATE{@DOUBAO, what:豆包电脑版 搬飞书稿用 接法照生财官方教程, path:左侧 技能 连接器 伙伴 再点右上角 新建 选 新建自定义连接器, name:scys-mcp, transport:HTTP, url:https://mcp.scys.com/shengcai-web/mcp, then:点保存 弹出 连接器需要授权 点 去授权 在浏览器里同意 连接器就自动加好, use:对话时选 本地电脑}
::STATE{@STORE, what:用户自己的货仓 先落在本机 再进他选的那个库, dir:library, posts:library/posts 每条货一份 Markdown 文件名就用帖子的中文标题 去掉不能做文件名的符号 不用拼音或英文代号 文件头记标题 来源链接 类目 取回日期, links:library/links.md 外部文档的链接清单 飞书 石墨这一类 每行记标题 链接 类目 再标 已有正文 或 待搬, cards:library/cards 放 ip.md 与 lens.md, feed:library/feed 每天拉到的热点清单 一天一份 json 文件名是日期, articles:library/articles 成稿与母稿, retro:library/retro 用户自己的复盘, pending:library/pending.md 还没进库的货, private:这个文件夹不进版本库 不推送到任何地方}
::STATE{@LIB_IMA, what:腾讯 ima 知识库, cost:免费 建好后设成私有, official:https://ima.qq.com/agent-interface, how:官方的 ima 技能包 加 API Key 把技能包装进 skills_dir 照包里自带的说明配置 解压出来先删掉 .DS_Store 这类系统垃圾文件再拷 不然记忆自检会报警告, skill_zip:https://app-dl.ima.qq.com/skills/ima-skills-1.1.10.zip 这是那一页上写的地址 页面换了新版就用新版, note:那一页是脚本渲染的 直接抓多半只抓到标题 抓不到就用这里的 skill_zip 再不行请用户把页面上那段提示词复制给你, before:用户先在 ima 里建好一个知识库 设成私有 接口不能替他建库, user_gives:在那一页登录后拿到的两样 Client ID 与 API Key, keys_go:放在技能包自己规定的位置 照它自带的说明, then:用技能包列出他能往里加内容的知识库 把库名说给他听 让他点一个 只有一个也要他说一声行 不往他没点头的库里放, put:posts 里的文件按上传文件的做法一份一份加进库, verify:送完用列表接口数一遍 份数对得上就算进了库；再按标题里的一个词搜一下 这个库的搜索是按标题搜的}
::STATE{@LIB_LEXIANG, what:腾讯乐享知识库, cost:要交会员费, official:https://lexiangla.com/mcp, how:官方 MCP 用静态令牌 不走 OAuth 传输是 streamable-http 地址是 mcp.lexiang-app.com 下的 mcp 带 preset 等于 meta 与 company_from 两个参数 请求头带 Authorization Bearer 令牌, user_gives:那一页显示的企业标识 与 访问令牌}
::STATE{@LIB_WEKNORA, what:腾讯开源的 WeKnora 知识库, cost:要自己有服务器, official:https://github.com/Tencent/WeKnora, how:它内置 MCP 服务 每个端点有自己的地址和令牌 传输是 Streamable HTTP, user_gives:自己服务器上那个端点的地址和令牌}
::STATE{@HAUL_ORDER, first:公众号 起号 写稿 流量主, second:个人 IP 与辨识度, third:出海与各平台, fourth:知识付费与卖课, from:精华帖 航海手册 项目库案例 成体系的先搬 零散的后搬}
::STATE{@SCHEDULE, what:DeepSeek Harness 自带的提醒, tools:schedule_create schedule_list schedule_view schedule_edit, use:每天一条提醒 把一句指令投递进新对话}
::STATE{@LENS, what:写作人格 就是视角卡 lens.md 二选一 亦仁默认 易洋可选 立视角卡时定 记进 ip.md 用户想模仿别的谁 照旧记进 pending, ask:两句 各问一次 第一句 如果我想具备你的分析与判断能力，以及拆解项目能力，我应该怎么做？ 第二句 你的回答风格是什么样的 是什么逻辑输出答案的, card:亦仁那张 先写他怎么出答案 从第二句的回答里摘 他先抓什么 观点靠什么撑 怎么拆给人；再写怎么拆 拆五层 账号 内容 流量 变现 数据；必答一问 如果我来复刻我会怎么做；项目默认是通的 数据默认是假的 所以数字只写查得到出处的和自己亲手测到的；只拆正在赚钱的 离现在近的 当事人自己讲细节的案例, yiyang:易洋那张在工具包里 .dsh/books/ai-global-media/lens-yiyang.md 他怎么看项目 怎么出答案 每条规矩带他的原话 选了易洋 lens.md 就照它写 规矩原样带过去 再把 AI 洋哥两句回答里新的判断补在后面}
::STATE{@WECHAT, register:https://mp.weixin.qq.com 用户自己注册个人号, limit:一张身份证只能注册 1 个个人类型的公众号, publish:个人号由你推进草稿箱 用户自己在后台点发布, ad_owner:粉丝过 100 且实名认证之后 在后台 收入变现 流量主 申请开通}
::STATE{@SCOPE, covers:装写作专家定成人格 接上内容源 建知识库 出文章 公众号走通, later:出海 一稿多发 变现 以后逐版加}

::OBJECTIVE{id:first_article_published|owner:user|trust:trusted|version:2|status:active}
  target: 用户说一句 AI全球自媒体 之后 人格装好 内容源接上 货仓里有货 写出带用户自己辨识度的成稿 推进公众号草稿箱 用户点发布 回查数据 复盘进库
  ACCEPT: RUBRIC 每项通过
  NON_GOALS: 出海及以后各步；生财与破局的任何写操作；替用户注册 付款 扫码 授权或点发布
  DONE_WHEN: 第一篇发出去了 回查到了数据 复盘进了库 你把做到哪一环记进交接单

::BOUNDARY{never:call_any_scys_write_tool_like_favorite_coin_feedback_or_publish|scope:permanent}
::BOUNDARY{never:open_scys_pages_with_a_browser_tool_or_a_crawler_yourself;use_the_mcp_tools_only|scope:permanent}
::BOUNDARY{never:call_any_breakout_write_tool_like_topic_mutate_or_skill_store_mutate_including_coin|scope:permanent}
::BOUNDARY{never:open_aipoju_pages_with_a_browser_tool_or_a_crawler_yourself;use_the_breakout_tools_only|scope:permanent}
::BOUNDARY{never:print_a_key_a_token_or_a_password_in_chat_or_write_one_into_memory_handoff_library_or_this_book;they_live_only_in_the_kit_ledger_the_DeepSeek_Harness_credential_store_or_the_place_an_official_skill_itself_prescribes|scope:permanent}
::BOUNDARY{never:change_one_character_of_the_expert_text_or_of_the_expert_skill_files|scope:permanent}
::BOUNDARY{never:scan_a_code_log_in_authorize_pay_or_press_publish_for_the_user|scope:permanent}
::BOUNDARY{never:commit_or_push_the_library_folder_anywhere|scope:permanent}

::RULE{one_question then 一次只问用户一件事 等他答了再往下|source:kit_onboarding}
::RULE{resume then 每做完一环在交接单里记一行；下次用户再说 AI全球自媒体 从没做完的那一环接着做|source:kit_handoff}
::RULE{least_hands then 用户能不动手的都由你做 不让他复制配置 不让他找地址 不让他填表；只有扫码 登录 授权 付款 点发布必须他本人|source:owner_2026-11-10}
::RULE{official_first then 接别家的东西一律照那一家官方页面写的做 一个字段都不自己编；官方写明的直接照做 不用再试|source:owner_2026-11-10}
::RULE{never_wait then 某一样东西用户暂时给不出来 不停下来等；能往下做的先往下做 把欠着的记进 pending 与交接单|source:owner_2026-11-10}
::RULE{own_voice then 每一篇都得有只有这个用户写得出来的一段 他自己做这件事的经过 数据 踩的坑；没有就不算成稿|source:owner_2026-11-10}
::RULE{expert_as_is then 选题 写稿 配图 推草稿 回查 节奏 都照人格里那位专家和它的技能原样做；这本书只在它外面加货仓 身份 视角与复盘|source:owner_2026-11-10}
::RULE{utf8_always then 读文件 写文件一律按 UTF-8；在 Windows 上读出来的中文是乱码 就是读错了编码 换 UTF-8 重读 绝不把乱码写回文件|source:test_run_2026-11-10}
::RULE{clean_workspace then 下载的压缩包 解压出来的临时文件 都放系统的临时目录 用完就删；工作区里只留工具包 人格 技能与 library|source:test_run_2026-11-10}

::MODULE{PERSONA|title:第一环 装写作专家定成人格}
  [STEP] 1 persona_slot 里已经有公众号爆文专家的正文：告诉用户已装好 跳到 SOURCE
  [STEP] 2 从 repo 取最新发布的专家包 取到系统的临时目录；取之前临时目录里有同名文件夹就先删掉；取完用 git status 核一次 工作树干净 experts 文件夹在 就算取到了 命令的退出码和警告不算数 不再回退；真没取到就从 mirror 取同一份；两处都取不到：用一句话告诉用户 然后停
  [STEP] 3 把 skills 的文件夹原样拷进 skills_dir
  [STEP] 4 把 text 整段放进 persona_slot 不删不改 只换 Part one 这一节里面的内容 这一节的标题行和文件里别的部分一个字不动；在文件头记下 soul_id 与 soul_version 与 soul_sha256。soul_sha256 记的是放进去的那段正文的 sha256 换行统一成 LF 去掉首尾空白 按 UTF-8 算；正文里的 A: 行和 BOUNDARY 不补来源 不加任何键 记忆的门认 Part one 整段是用户给的；提交被门拦住说没有来源 是工具包旧了 先按引擎更新那条命令更新到 1.1.21 以上再提交 不改正文
  [STEP] 5 删掉临时目录里的专家包；报三行：技能装到了哪 哪几个在技能列表里 人格放在哪

::MODULE{SOURCE|title:第二环 内容源}
  [STEP] 1 免费的那一源不用接 是你自己拉：先照 LIBRARY 的 STEP 2 把 @STORE 的文件夹建好；再照 @FEED 的 how 当场拉一次 落成 feed 里今天那一份 列出跟他品类有关的三条标题 告诉用户这是第一个内容源 方法随专家包装在本机 不花钱 不靠任何人的网站 以后每天自己拉
  [STEP] 2 弹一张卡片让用户选案例库 不设默认 把各自的代价写在选项上：生财有术 打开 poster 那张海报 用微信扫码领三天体验卡 再点开通链接；破局俱乐部 打开 poster_poju 那张海报 用微信扫码领七天会员；两家都接；先不接 只用免费清单 以后再说一句就能接。他本身是哪家的会员 那家就说 跳过领卡。选了先不接：记进 pending 跳到 STEP 8
  [STEP] 3 选了生财 用户说领好了或跳过：接下来的配置全由你做 不让用户复制或填写任何东西。照 @PLUGIN 的 install 把 name 这个插件装上并启用；这一步要用户点一次批准 就告诉他点哪一项
  [STEP] 4 插件启用后会自动打开浏览器授权页；没打开就照 @PLUGIN 的 reauth 再开一次 把授权链接给用户 请他用电脑上的浏览器打开 微信里打不开
  [STEP] 5 用户自己用生财账号登录 手机扫码 点同意；你不代扫码不代登录
  [STEP] 6 选了破局 用户说领好了或跳过：照 @POJU 的 install 装 CLI；再照 auth 跑登录 把打印出来的链接给用户 请他在登录过破局的浏览器里打开 点 确认登录 你不代登录；登录成功后照 @MCP_POJU 把它接进 DeepSeek Harness 要用户点批准就告诉他点哪一项
  [STEP] 7 接上的每一家都只读搜一次最近加精的帖 列出标题；列得出就告诉用户案例库接好了
  [STEP] 8 说一句：搬飞书稿要用豆包 请在本机装好豆包电脑版。选了生财的 装好后带他把生财也接进豆包：照 @DOUBAO 的 path 走到填写框 你把 name transport url 三项打出来让他照着填 再照 then 授权；最后提醒 use。用户说以后再装：记进 pending 接着往下走

::MODULE{LIBRARY|title:第三环 知识库 三天内把货搬回自己家}
  [STEP] 1 弹一张卡片让用户三选一 不设默认 把各自的代价写在选项上：@LIB_IMA 的 cost；@LIB_LEXIANG 的 cost；@LIB_WEKNORA 的 cost
  [STEP] 2 建好 @STORE 的各个文件夹；在工作区的 .gitignore 里加一行 library/ ；已经有了就跳过
  [STEP] 3 接上用户选的那个库：读它 official 那一页 照 how 接；那个库写了 before 的 先请用户把 before 做了；user_gives 里的东西一次只向用户要一样 一开始就说清一共要几样 拿到就存好 不在对话里复述。用户暂时给不出来：照 never_wait 先往下走 货都先落本机
  [STEP] 4 搬第一轮：照 @HAUL_ORDER 的先后 用接上的案例库只读地找 生财用 @SCYS 的工具 破局用 @POJU 的工具 两家都接就两边各搬一轮；一家都没接的 这一轮跳过 货仓先空着 记进 pending。正文就写在帖子里的：存成 posts 里的一份文件 破局回来的正文是 HTML 先转成 Markdown 再存。正文在外部文档里的：工具把那篇正文一起带回来了 就照样存成 posts 的一份文件 并在 links 里记一行 标 已有正文；没带回来的 不去读 在 links 里记一行 标 待搬。碰到限流就照返回的秒数等；当天额度用完就停 在交接单里记下搬到哪一类哪一条
  [STEP] 5 库已经接上：把本机新增的货送进库 送一条在 pending 里划掉一条 送完照那个库的 verify 核一遍。库还没接上：货留在本机 都记在 pending 里
  [STEP] 6 照 @SCHEDULE 建一条每天的提醒：指令是 照 AI全球自媒体 先照 @FEED 拉今天的热点 再照第三环搬一轮。没接案例库的也建 只拉热点。告诉用户它每天自己拉自己搬 不用管
  [STEP] 7 links 里有标着 待搬 的链接：告诉用户一句话怎么用 把这些链接丢给豆包 说 把这些文档读出来存进我的知识库。标着 已有正文 的不用再搬。这些链接不随体验卡到期 卡过期以后也能搬 所以这件事不催
  [STEP] 8 过关：货仓里找得到第一篇要用的素材。告诉用户货仓有货了 一边搬一边写 接着走 ARTICLE。没接案例库的：告诉用户货仓先空着 第一篇用免费清单选题 接着走 ARTICLE

::MODULE{ARTICLE|title:第四环 出文章 专家原样用 外面加身份 视角与复盘}
  [STEP] 1 立身份卡 只做一次：照 @KIT 的 profile 起草 一句话定位 我是谁 写给谁 讲什么；固定的名字与简介；固定的栏目名。给用户看 他说行或改一句 存成 cards 里的 ip.md。新手的定位就是他自己这一路：一个只会用豆包的人 用 AI 把自媒体从零做起 每一步公开拆解 公开复盘
  [STEP] 2 立视角卡 只做一次：照 @LENS 让用户二选一 亦仁默认 易洋可选 把两位各是什么写在选项上 选好记进 ip.md。亦仁：用 @SCYS 的工具把 ask 的两句原样各问一次 AI 亦仁 一两分钟后取回答 存进 posts；再照 card 写成 cards 里的 lens.md。易洋：用 @POJU 的工具把同两句原样各问一次 AI 洋哥 一次就回 存进 posts；再照 yiyang 那份文件写成 lens.md 规矩原样带过去 回答里新的判断补在后面。问不了：改用搜帖工具找那位本人讲判断与拆解的帖子 照同一张写。用户另外说了想学谁：这一版先用默认的这一张 记进 pending
  [STEP] 3 选题：照专家的两边对上原样做 需求侧读 feed 里今天那一份 没有就照 @FEED 的 how 当场拉 免费；再加一个条件 货仓里有一个能拆的真实案例才选 按 lens.md 最后一条挑 货仓空着的就选清单里多平台同聊的那件事。供给侧查公众号上有没有人写爆要花用户的钱：先报价 他点头才查 不点头就只用清单
  [STEP] 4 排内容清单：照专家的做法 骨架用 lens.md 五层各有什么素材 复刻那一问怎么答。素材只从货仓和库里取；没有就换题 不硬写
  [STEP] 5 写稿：照专家的流程原样走。每篇三段货 拆别人的案例 货仓空着就拆清单里当天那件事；如果我来做 怎么做；我真做了哪一步 结果怎样。专家留给作者补的地方 用 @KIT 的 trail 与 retro 里的东西去填；实在没有对得上的 才问用户一句
  [STEP] 6 辨识度检查 成稿之前过一道：有没有答 如果我来复刻我会怎么做；有没有一段只有这个用户写得出来的东西；署名 定位 口吻跟 ip.md 对不对得上；标题和正文里有没有漏出这本书自己的说法 像 货仓 身份卡 视角卡 第几环 这一类 读者看不懂的词要换成平常话；说的是 照着做 复刻 不是 照抄 搬运。有一条不过就回去补
  [STEP] 7 配图：照专家的做法
  [STEP] 8 成稿存进 articles 文件名带日期。告诉用户成稿好了 接着走 PUBLISH

::MODULE{PUBLISH|title:第五环 公众号走通}
  [STEP] 1 备号 只做一次：用户没有公众号 就带他照 @WECHAT 的 register 注册一个个人号 一步一步告诉他点哪 注册由他本人做
  [STEP] 2 接上推草稿的权限 只做一次：照专家推草稿那个技能写的前置做。向用户要后台的两串凭据 一次要一样 存进账本；你查出本机的公网 IP 打出来 告诉他贴进后台的白名单。用户暂时不给凭据：成稿留在 articles 告诉他拿到凭据再说一句 AI全球自媒体 然后停在这里
  [STEP] 3 推草稿箱：照专家的技能把成稿和配图推进草稿箱
  [STEP] 4 人审人发：请用户在后台或手机上读一遍 自己点发布
  [STEP] 5 回查：请用户把发出去的文章链接丢给你 照专家的做法回查数据
  [STEP] 6 复盘进库：把这一篇从选题到数据的经过写成一份复盘 存进 retro 并送进库。下一篇里 我真做了哪一步 那一段就从这里取
  [STEP] 7 把发出去的这一版在 articles 里标成母稿。以后发到别的平台 都从母稿改
  [STEP] 8 节奏：照专家的节奏持续发。不停在这里等 下一篇回到 ARTICLE 的选题
  [STEP] 9 回查时看到粉丝过了 100：照 @WECHAT 的 ad_owner 提醒用户去申请 这是第一笔保底收入

::MODULE{REPORT|title:每做完一环告诉用户什么}
  [LINE] 做到哪一环了 这一环做成了什么
  [LINE] 用户接下来要亲手做的一件事 没有就说没有
  [LINE] pending 里还欠着什么

::RUBRIC{B1: 人格位置里是公众号爆文专家的正文|check:cmd|run:"python -c \"import io,sys;s=io.open('soul/agent.md',encoding='utf-8').read();sys.exit(0 if '[PROJECT:wechat_awesome]' in s else 1)\""|expect:0}
::RUBRIC{B2: 三个写作技能在技能目录里|check:cmd|run:"python -c \"import os,sys;sys.exit(0 if all(os.path.isdir(os.path.join('.dsh','skills',n)) for n in ('wechat-article','wechat-draft-push','wechat-topic-hunter')) else 1)\""|expect:0}
::RUBRIC{B3: 内容源接上之后 每一家都只读搜一次列出了标题 全程没有调用写操作|check:human}
::RUBRIC{B4: 接进 DeepSeek Harness 这一段用户没有复制或填写任何配置 只做了点批准 扫码 登录 授权|check:human}
::RUBRIC{B5: 本机货仓建好了 且不进版本库|check:cmd|run:"python -c \"import io,os,sys;ok=os.path.isdir('library') and os.path.exists('.gitignore') and 'library/' in io.open('.gitignore',encoding='utf-8').read();sys.exit(0 if ok else 1)\""|expect:0}
::RUBRIC{B6: 货仓里有货 帖子或飞书链接至少一样；用户选了先不接案例库 这一条等接上再查|check:human}
::RUBRIC{B15: 热点是本机自己拉的 feed 里有今天那一份|check:cmd|run:"python -c \"import os,sys,datetime;sys.exit(0 if os.path.getsize(os.path.join('library','feed',datetime.date.today().isoformat()+'.json'))>1000 else 1)\""|expect:0}
::RUBRIC{B16: 第二环列出了三条跟品类有关的标题 没有读过 WorkBuddy 仓库里的 latest.json 当源|check:human}
::RUBRIC{B17: ip.md 里记了视角是哪位 lens.md 照那位写；定的是易洋 的 lens.md 里每条规矩带他的原话 成稿第一句是判断 案例有人名数字 结尾有动作|check:human}
::RUBRIC{B7: 身份卡与视角卡都在 视角卡是亦仁或易洋之一|check:cmd|run:"python -c \"import os,sys;sys.exit(0 if all(os.path.exists(os.path.join('library','cards',n)) for n in ('ip.md','lens.md')) else 1)\""|expect:0}
::RUBRIC{B8: 成稿在 articles 里 且过了辨识度检查的三条|check:human}
::RUBRIC{B9: 第一篇由用户本人点了发布 回查到了数据 复盘进了 retro|check:human}
::RUBRIC{B10: 从第三环到第五环 用户亲手做的只有 选库 交钥匙 说行 挑标题 贴白名单 读稿 点发布 丢链接|check:human}
::RUBRIC{B11: 人格文件没有被写坏 里面没有读错编码留下的乱码|check:cmd|run:"python -X utf8 -c \"import io,sys;s=io.open('soul/agent.md',encoding='utf-8').read();sys.exit(0 if 'Part one \\u00b7 given soul' in s and '\\u8def given soul' not in s else 1)\""|expect:0}
::RUBRIC{B14: 人格正文和文件头记的 soul_sha256 对得上|check:cmd|run:"python -X utf8 -c \"import io,re,hashlib,sys;s=io.open('soul/agent.md',encoding='utf-8').read().replace('\\r\\n','\\n');m=re.search(r'^soul_sha256:\\s*[\\x22\\x27]?([0-9a-f]+)',s,re.M);a=s.find('## Part one');b=s.find('## Part two');blk=s[s.find('\\n',a)+1:b];blk=re.sub(r'^\\s*<!--.*?-->\\s*','',blk,count=1,flags=re.S).strip();sys.exit(0 if m and a>=0 and b>a and hashlib.sha256(blk.encode('utf-8')).hexdigest()==m.group(1) else 1)\""|expect:0}
::RUBRIC{B12: 工作区里没有留下下载的压缩包和解压出来的临时文件夹|check:human}
::RUBRIC{B13: 成稿的标题和正文里没有这本书自己的说法 也没有 照抄 搬运 这类字眼|check:human}

::FALLBACK{expert_package_unreachable_on_both_sources then 用一句话告诉用户网络取不到专家包 然后停|user_has_no_account_on_either_and_skips_the_card then 再给他看一次两张海报 说案例库先空着 免费清单照常用 第一篇拆清单里当天的事 以后领了卡再说一句就接|feed_pull_gets_nothing then 把拉到几个源 跳过几个源 原样报给用户 这是这台机器的网络问题 记进 pending 先往下走 明天的提醒会再拉|plugin_cannot_be_installed_by_you then 把报错原样给用户看 请他照 @PLUGIN 的 by_hand 点一遍 这是生财官方教程的装法 还不行就停在这一环并记进交接单|mcp_authorization_fails then 把屏幕上的报错原样给用户看 请他重新授权一次 还不行就停在这一环并记进交接单|breakout_login_fails then 把授权链接原样给用户 请他在登录过破局的电脑浏览器里打开再点 确认登录 还不行就停在这一环并记进交接单|breakout_tools_missing_after_the_entry_is_added then 请用户重启一次 DeepSeek Harness 还没有就把报错原样给用户看 停在这一环并记进交接单|library_cannot_be_connected then 把报错原样给用户看 货照常落本机 记进 pending 接着走下一环|scys_quota_used_up_or_card_expired then 用货仓里已有的货接着写 告诉用户想继续拿新内容可以用海报上的码开通会员|no_case_in_the_library_fits_today then 换一个题 还没有就告诉用户今天先搬货 明天再写|draft_push_fails then 把报错原样给用户看 成稿留在 articles 记进交接单 不重试超过两次}

::PRIORITY{
  user_decision > BOUNDARY > OBJECTIVE > RUBRIC > RULE > MODULE
}
::ILANG::v5.0::ENGINEERING_BOOK
