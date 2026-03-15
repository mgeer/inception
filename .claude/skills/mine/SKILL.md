---
name: mine
description: 需求雷达 - 启动需求挖掘系统，自动发现互联网上的真实用户痛点。自动循环挖掘直到没有新方向。
---

当用户运行 /mine 时，执行以下完整流程。你是挖掘引擎，直接用自己的工具（WebSearch、WebFetch、Agent、Write、Read、Bash）完成所有工作。

## 第一步：检查状态并启动

1. 用 Bash 检查 server 是否已在运行：`curl -s http://localhost:3456/api/status 2>/dev/null`
2. 如果没在运行，后台启动：`cd /Users/jiangqingsong/workspace/inception/mine && node server.js &`，等 1 秒确认，然后打开浏览器：`open http://localhost:3456`
3. 如果 server 已在运行，**不要再打开浏览器**（用户已经有页面了）
4. 读取 status.json，如果 `running` 为 true，说明上一次挖掘还在进行中，告知用户"挖掘正在进行中"，**不要重复启动挖掘循环**，直接结束
5. 否则告知用户"需求雷达已启动，开始自动挖掘"，进入第二步

## 第二步：进入挖掘循环

重复执行以下三个阶段，直到停止条件触发。

文件路径常量：
- 状态文件：`/Users/jiangqingsong/workspace/inception/mine/status.json`
- 发现索引：`/Users/jiangqingsong/workspace/inception/mine/discoveries/index.json`
- 单条发现：`/Users/jiangqingsong/workspace/inception/mine/discoveries/{id}.json`
- 提示词目录：`/Users/jiangqingsong/workspace/inception/mine/prompts/`

### Phase 1: 规划

1. 读取 `discoveries/index.json`，获取已有痛点标题列表
2. 读取 `prompts/plan.md`，将 `{{existing}}` 替换为已有痛点列表
3. 更新 `status.json`：`{"running": true, "round": N, "phase": "planning", "message": "正在规划第N轮搜索方向..."}`
4. 根据替换后的 plan.md 提示词思考，自己生成规划结果（JSON）
5. 如果规划结果是 `{"done": true}`，跳到「停止」
6. 否则得到 5 个搜索任务

### Phase 2: 并行搜索

1. 更新 `status.json`：`{"running": true, "round": N, "phase": "searching", "message": "正在并行搜索 5 个方向..."}`
2. 读取 `prompts/search.md`
3. **使用 Agent 工具并行启动 5 个子 Agent**，每个 Agent 负责一个搜索任务：
   - 将 search.md 中的 `{{instruction}}` 替换为该任务的 instruction
   - 每个 Agent 使用 WebSearch 和/或 WebFetch 完成搜索
   - 每个 Agent 返回 JSON 数组格式的原始发现
4. 收集所有 Agent 的返回结果，合并为一个原始发现列表

### Phase 3: 分析筛选

1. 更新 `status.json`：`{"running": true, "round": N, "phase": "analyzing", "message": "正在分析和筛选..."}`
2. 读取 `prompts/analyze.md`，将 `{{existing}}` 替换为已有痛点列表，`{{rawFindings}}` 替换为合并的原始发现
3. 根据替换后的 analyze.md 提示词思考，自己生成分析结果
4. 如果分析结果 count 为 0：跳到「停止」
5. 否则，将每个发现保存：
   - 为每个发现分配 id（已有数量 + 序号）
   - 添加 round 和 date 字段
   - 写入 `discoveries/{id}.json`（完整数据）
   - 更新 `discoveries/index.json`（追加索引条目：id, title, date, round）
6. 更新 `status.json`：`{"running": true, "round": N, "phase": "done", "message": "第N轮完成，发现了X个痛点"}`

### 继续下一轮

回到 Phase 1，round + 1。

### 停止

1. 更新 `status.json`：`{"running": false, "round": N, "phase": "finished", "message": "挖掘完成，共发现X个痛点"}`
2. 告知用户挖掘已完成，可以在浏览器中查看结果

## 关键规则

- **Phase 2 必须并行**：用 Agent 工具同时启动 5 个搜索 Agent，不要串行
- **质量优先**：Phase 3 宁可产出 0 个也不凑数
- **文件是通信方式**：每次状态变化都写 status.json，每轮结果都写 discoveries/，viewer 会自动刷新
- **不限轮数**：一直跑到 Phase 1 说没有新方向，或 Phase 3 筛完一个都不剩
- **status.json 要及时更新**：这是用户在浏览器里看到进度的唯一渠道
