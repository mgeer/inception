# Inception - 需求雷达

自动化的互联网用户痛点挖掘系统。通过循环搜索、分析、筛选的完整流程，自动发现真实存在的用户痛点和市场机遇。

基于 [Claude Code](https://claude.com/claude-code) Skill 构建。

## 工作原理

系统以循环方式运行，每轮包含三个阶段：

1. **规划** — 分析已有发现，规划 5 个新的搜索方向
2. **并行搜索** — 5 个 Agent 并行执行不同类型的搜索任务
   - 搜索痛点关键词
   - 浏览社区热帖（Reddit / Hacker News / V2EX）
   - 挖应用差评（Chrome Web Store、VS Code Marketplace、G2）
   - 扫 GitHub Issues 和 feature request
   - 找求助帖和"求推荐"类内容
3. **分析筛选** — 从原始发现中评估并筛选最有价值的痛点（每轮最多 3 个）

系统会自动判断何时停止：当主要领域都已覆盖，或连续一轮没有新价值发现时结束。

## 使用方式

### 前提条件

- [Claude Code](https://claude.com/claude-code) CLI
- Node.js

### 启动

在项目目录中运行 Claude Code，然后输入：

```
/mine
```

系统会自动：
- 启动本地 Web 服务（端口 3456）
- 打开浏览器查看实时进度
- 开始循环挖掘

### 查看结果

浏览器访问 `http://localhost:3456`，支持：

- **阅读视图** — 逐条浏览痛点详情，展开/收起证据
- **列表视图** — 表格式总览所有发现
- 键盘快捷键（← → 导航）
- 实时自动更新

## 项目结构

```
.claude/skills/mine/SKILL.md   # Skill 定义（/mine 命令入口）
mine/
├── server.js                  # Node.js 后端服务
├── index.html                 # 前端界面（深色主题）
├── status.json                # 实时运行状态
├── prompts/
│   ├── plan.md                # 规划阶段提示词
│   ├── search.md              # 搜索阶段提示词
│   └── analyze.md             # 分析阶段提示词
└── discoveries/
    ├── index.json             # 发现索引
    └── {id}.json              # 单个痛点详情
```

## 痛点数据格式

每个发现包含五维度分析：

| 维度 | 说明 |
|------|------|
| **谁在痛** | 目标用户群体 |
| **场景** | 痛点发生的具体场景 |
| **有多痛** | 痛感程度和频率 |
| **现有方案** | 当前解决方案及不足 |
| **触发因素** | 导致痛点的根本原因 |

每个痛点附带多条真实证据，包含来源、指标、原文引用和链接。

## License

MIT
