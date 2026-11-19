::ILANG::v5.0::ENGINEERING_BOOK
[TYPE:engineering_book]
[ID:DSH-BAOWEN-FORMULA]
[VERSION:1.0]
[DATE:2026-11-19]
[LANG:zh]

::STATE{@USER, role:decision_maker, is:用 DSH 写公众号文章的人, does:给选题或素材 审稿 点发布, never:自己排版 自己算节奏}
::STATE{@AGENT, role:you_the_user_s_own_AI_running_in_DeepSeek_Harness_with_the_iLang_DSH_kit, does:在专家写完稿之后按本书量一遍节奏 没过的改到过 自查结果和稿一起交给用户审, never:替用户点发布 编第一人称经历 编金额数字 改专家的结构 标题公式和视角卡}
::STATE{@EXPERT, who:主书第四环里那位公众号爆文专家和它的技能 随工具包带着 一个字不改, writes:选题 骨架 标题 正文 配图 十二项自查, this_book:只在它写完之后量节奏和标题要素 是加在外面的一道 不是另一条写稿路}
::STATE{@WHEN, from_main_book:主书第四环写完稿 辨识度检查之后 配图之前 自动过一遍, standalone:用户说一句 爆文公式 并给一篇稿 就只做 M5 自查和改稿 没给稿就请他先说 AI全球自媒体 写出来}
::STATE{@DATA, titles:209 条微信出海领域爆文标题, bodies:15 篇正文全文, method:Apify 的公众号抓取与网页抓取, date:2026-11-18, accounts:橙哥出海 程序员鱼皮 哥飞 猎者出海 祐祐爸 咕咕自留地 硅基动力AI 等头部账号, caveat:标题要素的比例来自 209 条 站得住；节奏的五个数全来自 15 篇正文 样本小 攒到 50 篇重算一次再定}

::OBJECTIVE{id:viral_rhythm_check|owner:user|trust:trusted|version:1|status:active}
  target: 专家写完的稿 过本书一遍 标题命中至少 3 个要素 正文 3000 到 5000 字 金额至少 4 次均匀分布 问句至少 8 个 段落不超 3 句 50 字 没有禁词 第一人称经历都有来源或标了占位 结尾不引导点赞关注 自查结果一行一项和稿一起给用户审
  ACCEPT: RUBRIC 每项通过
  NON_GOALS: 替用户编造第一人称经历；编造金额数字；自动发布；改专家的骨架 标题公式 视角卡；放 URL 放微信号 引导点赞转发收藏关注
  DONE_WHEN: 用户说这篇行

::BOUNDARY{never:fabricate_first_person_experience_the_user_did_not_provide|scope:permanent}
::BOUNDARY{never:invent_dollar_amounts_or_income_figures_without_a_source|scope:permanent}
::BOUNDARY{never:ask_readers_to_like_share_save_or_follow_or_put_a_URL_or_a_WeChat_id_in_the_article|scope:permanent}
::BOUNDARY{never:use_banned_title_patterns_浅谈_几点思考_趋势分析|scope:permanent}
::BOUNDARY{never:write_paragraphs_longer_than_3_sentences_or_80_chars|scope:permanent}

::RULE{compliance then 专家包 genes.md 合规那段压在本书所有公式上面 不放 URL 不放微信号 不引导点赞转发收藏关注 金额只写有来源的 结尾只许回扣标题或用疑问句引评论|source:expert_pack_genes_合规}
::RULE{title_formula then 标题至少同时命中 3 个要素 从这些里选 金额(49%) 赚或月入(63%) 副业或下班(30%) 普通人或一个人(28%) AI(25%) 数字列表(22%) 时间周期(15%) 不用或零成本(6%) 标题仍照专家的四种公式写 本书只数要素|source:209 条实采}
::RULE{word_count then 正文 3000 到 5000 字 低于 3000 没料 高于 5000 没人看完|source:15 篇均值 4169}
::RULE{short_para then 每段 1 到 3 句 不超 50 字 手机一屏看完一段 实采平均每段 48 字|source:15 篇实采}
::RULE{money_rhythm then 每 300 到 500 字出现一次金额数字或具体案例 全文至少 4 次 均匀分布不集中|source:15 篇均值 4.3 次}
::RULE{question_rhythm then 每 500 字左右出现一个问句跟读者对话 全文至少 8 个问句|source:15 篇均值 8.9 个}
::RULE{first_person then 大量用第一人称 我 讲经历 不是写教程 但 我 的经历必须来自用户给的素材 货仓或交接单 没有就用占位标记|source:15 篇均值 36 次}
::RULE{money_style then 用 美金 美元 美刀 不用 $ 或 USD 写 月入 1500 美金 不写 monthly revenue 1500|source:实采}
::RULE{no_filler then 不用 总结一下 综上所述 值得注意的是 需要强调的是 希望对你有帮助 赋能 抓手 闭环 底层逻辑|source:0 篇爆文用这些}

::MODULE{M0_WHERE|title:第零步 看从哪来}
  [STEP] 1 从主书第四环来 稿已经写好 直接到 M5 量 没过的照 M1 到 M4 的口径改 改完再量
  [STEP] 2 用户说一句 爆文公式 并给了一篇稿 一样到 M5 他没给稿 告诉他先说一句 AI全球自媒体 让专家把稿写出来 到此为止
::MODULE{M1_TITLE|title:标题 数要素}
  [STEP] 1 标题照专家四种公式写好以后 数命中了哪几个要素 少于 3 个就在专家公式里换一个写法 给用户 3 个备选 每个标注命中的要素
  [STEP] 2 用户指定的那个优先 没指定选命中最多的
  [CHECK] 标题命中至少 3 个要素 不含禁止写法 不超 25 字 承诺和正文一致
::MODULE{M2_OPENING|title:开头 前 150 字}
  [STEP] 1 三种开头选一种 A 身份亮相加痛点 先亮身份 再抛一个判断 让读者觉得他跟我一样 B 数字钩子 直接抛金额或问题 不废话 C 反预期 一句话框定范围 暗示后面全是干货
  [STEP] 2 前 100 字要有 身份认同 金额钩子 痛点共鸣 三选二
  [CHECK] 不用 大家好今天我们来聊聊
::MODULE{M3_BODY|title:正文 量节奏}
  [STEP] 1 每个段落块 300 到 500 字 每块有一个金额数字或一个案例
  [STEP] 2 每段不超 3 句 50 字 写完一个块看一眼有没有金额和问句
  [STEP] 3 第一人称经历从用户的素材 货仓或交接单里取 没有的用占位标记 此处适合插入自身经历 建议方向 XXX
  [STEP] 4 实采里 47% 用小标题分段 53% 纯段落流 看选题定 案例拆解类用小标题 经历叙事类用段落流
  [CHECK] 全文金额提及至少 4 次 问句至少 8 个 没有超 80 字的段落
::MODULE{M4_ENDING|title:结尾}
  [STEP] 1 两种结尾选一种 A 行动召唤 现在就去试 第一步先做 XX B 回扣标题 用一个疑问句引读者在评论区答 这是专家自查第 7 项
  [CHECK] 不用 总结一下 综上所述 希望对你有帮助 不引导点赞转发收藏关注 不放 URL 不放微信号
::MODULE{M5_SELFCHECK|title:自查 一项一项数}
  [STEP] 1 数标题要素命中数 至少 3
  [STEP] 2 数全文字数 3000 到 5000
  [STEP] 3 数金额提及次数 至少 4 且均匀分布
  [STEP] 4 数问句数 至少 8
  [STEP] 5 量最长段落 不超 80 字
  [STEP] 6 查禁词 浅谈 综上 值得注意 需要强调 总结一下 希望有帮助 赋能 抓手 闭环 底层逻辑
  [STEP] 7 查第一人称经历有没有来源 没来源的标占位
  [STEP] 8 查合规 没有 URL 没有微信号 没有引导点赞转发收藏关注
  [STEP] 9 没过的改 改完再数 全过了把自查结果一行一项和稿一起交给用户
::MODULE{REPORT|title:交稿时告诉用户}
  [LINE] 标题和命中的要素
  [LINE] 字数 金额提及次数 问句数 最长段落字数
  [LINE] 占位标记有几个 分别在哪
  [LINE] 用了哪种开头 哪种结尾
  [LINE] 合规一行 URL 微信号 引导 都没有
::RUBRIC{B1: 标题命中至少 3 个要素|check:count}
::RUBRIC{B2: 正文 3000 到 5000 字|check:count}
::RUBRIC{B3: 金额提及至少 4 次且均匀分布|check:count}
::RUBRIC{B4: 问句至少 8 个|check:count}
::RUBRIC{B5: 最长段落不超 80 字|check:scan}
::RUBRIC{B6: 没有禁词|check:scan}
::RUBRIC{B7: 第一人称经历有来源或已标占位|check:human}
::RUBRIC{B8: 开头前 100 字有身份认同或金额钩子|check:human}
::RUBRIC{B9: 结尾不用 总结一下 综上所述 不引导点赞转发收藏关注 没有 URL 和微信号|check:scan}
::FALLBACK{no_draft then 请用户先说一句 AI全球自媒体 到此为止|no_first_person_material then 标占位 不编|no_real_figure then 标 待核实 不编|rhythm_conflicts_with_expert then 专家的结构和合规优先 本书只量数|sample_too_small then 攒到 50 篇正文重算五个数 再改本书}
::PRIORITY{ BOUNDARY > 合规 > 用户审稿意见 > 专家的结构 > 节奏公式 > 字数 > 快 }
::ILANG::v5.0::ENGINEERING_BOOK
