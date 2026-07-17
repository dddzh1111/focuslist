# 清单番茄 (FocusList) — 架构设计文档

> 版本：v2.0  
> 日期：2026-07-17  
> 作者：architect  
> 项目定位：「滴答清单 + 番茄时钟」融合应用，任务驱动专注

---

## 目录

1. [产品定位与核心功能](#1-产品定位与核心功能)
2. [技术栈选型](#2-技术栈选型)
3. [系统架构设计](#3-系统架构设计)
4. [数据模型设计](#4-数据模型设计)
5. [RESTful API 设计](#5-restful-api-设计)
6. [项目目录结构](#6-项目目录结构)
7. [关键模块设计](#7-关键模块设计)
8. [设计决策记录](#8-设计决策记录)

---

## 1. 产品定位与核心功能

### 1.1 产品定位

**清单番茄 (FocusList)** 是一款以「任务驱动专注」为核心理念的生产力工具。它将任务清单管理（滴答清单模式）与番茄工作法计时（番茄时钟模式）深度融合——用户不是在虚空中计时，而是**为具体任务投入专注时间**。

### 1.2 核心功能矩阵

```
┌─────────────────────────────────────────────────────┐
│                    清单番茄 FocusList                  │
├─────────────────────┬───────────────────────────────┤
│  任务清单管理        │  番茄专注计时                  │
│  ────────────────   │  ────────────────             │
│  · 清单（项目）管理  │  · 标准番茄钟（25+5）          │
│  · 任务 CRUD        │  · 自定义时长                  │
│  · 优先级/标签/截止日│  · 暂停/继续/放弃              │
│  · 子任务拆分       │  · 白噪音（可选）              │
│  · 任务排序与筛选    │  · 专注统计可视化              │
│  · 日历视图           │  · 浏览器通知提醒              │
├─────────────────────┼───────────────────────────────┤
│  日历视图                                           │
│  ────────────────                                   │
│  · 月/周/日视图切换                                  │
│  · 每日任务清单展示                                  │
│  · 完成状态可视化（勾选/未完成）                      │
│  · 点击日期查看当日详情                              │
├─────────────────────┴───────────────────────────────┤
│  融合能力（核心差异化）                                │
│  ────────────────                                   │
│  · 从任务一键启动番茄钟                               │
│  · 番茄记录自动关联任务                               │
│  · 任务卡片显示累计专注时长                           │
│  · 按任务/清单/标签聚合专注统计                       │
│  · 每日/每周专注报告                                  │
└─────────────────────────────────────────────────────┘
```

### 1.3 用户故事映射

| 用户角色 | 核心场景 |
|---------|---------|
| 普通用户 | 创建待办清单，为高优先级任务启动番茄钟，查看今天的专注时长 |
| 效率爱好者 | 按标签分类任务，用番茄统计优化自己的时间分配 |
| 计划型用户 | 在日历视图中规划每日任务，回顾历史完成情况 |
| 团队场景(预留) | 共享清单、查看团队成员专注投入（v3 规划） |

---

## 2. 技术栈选型

### 2.1 总体选择

| 层次 | 技术 | 版本 | 选型理由 |
|------|------|------|---------|
| **前端框架** | React 18 + TypeScript | ^18.3 | 生态成熟、社区活跃、与 Ant Design 深度集成 |
| **构建工具** | Vite 5 | ^5.4 | 极速 HMR、ESBuild 预构建、零配置开箱即用 |
| **UI 组件库** | Ant Design 5 | ^5.22 | 组件丰富、暗色模式内置、主题定制灵活 |
| **状态管理** | Zustand | ^5.0 | 轻量(1KB)、无 Boilerplate、支持订阅选择器 |
| **路由** | React Router v6 | ^6.28 | 嵌套路由、懒加载、数据加载器 |
| **HTTP 客户端** | Axios | ^1.7 | 拦截器、请求取消、上传进度 |
| **图表库** | Recharts | ^2.15 | 专注统计报表、React 原生声明式 |
| **日期库** | dayjs | ^1.11 | 轻量(2KB)，日历视图日期计算、国际化 |
| **日历组件** | 自研 CalendarView | — | 基于 dayjs 构建，月/周/日视图切换 |
| **计时引擎** | 自研 usePomodoro Hook | — | 基于 setInterval + Web Worker 后备，精准计时 |
| **后端框架** | Express.js 5 | ^5.0 | 轻量灵活、中间件生态、TypeScript 支持 |
| **ORM** | Prisma 6 | ^6.0 | 类型安全、迁移管理、关系查询优雅 |
| **数据校验** | Zod | ^3.23 | 与 TypeScript 类型推断无缝结合 |
| **数据库** | SQLite(dev) / PostgreSQL(prod) | — | 开发零配置、生产可扩展 |
| **通知** | Web Push API + 浏览器 Notification | — | 番茄结束提醒 |
| **音频** | Howler.js | ^2.2 | 白噪音/结束提示音播放 |

### 2.2 技术决策要点

- **不用 Redux**：Zustand 在中小型应用中代码量减少 60%+，且番茄计时状态天然适合轻量订阅模式
- **不用 Socket.IO**：番茄计时是客户端主导的行为，仅结束时上报记录，无需双向实时通信
- **不用 MongoDB**：任务、番茄记录之间存在明确关联关系（用户→清单→任务→番茄记录），关系型数据库更合适
- **Recharts 选型**：相比 ECharts（体积大）、Nivo（学习成本高），Recharts 最轻量且满足统计报表需求

---

## 3. 系统架构设计

### 3.1 整体架构图

```
┌────────────────────────────────────────────────────────────┐
│                      客户端 (Browser)                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  React 18 SPA                         │  │
│  │  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │  │
│  │  │ 任务页面 │ │ 番茄页面 │ │ 日历页面 │ │ 统计页面 │ │ 设置页面 │ │  │
│  │  └────┬────┘ └────┬─────┘ └────┬─────┘ └──────────┘ │  │
│  │       │           │            │                      │  │
│  │  ┌────┴───────────┴────────────┴───────────────────┐  │  │
│  │  │              Zustand Store Layer                 │  │  │
│  │  │  taskStore │ pomodoroStore │ filterStore │ stats │  │  │
│  │  └────────────────────┬────────────────────────────┘  │  │
│  │                       │                                │  │
│  │  ┌────────────────────┴────────────────────────────┐  │  │
│  │  │           API Layer (Axios + interceptors)       │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                            │ HTTP/REST                      │
└────────────────────────────┼────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────┐
│                      服务端 (Node.js)                        │
│  ┌────────────────────────┴────────────────────────────┐   │
│  │                  Express.js 5.x                       │   │
│  │                                                       │   │
│  │  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │   │
│  │  │ 路由层    │→│ 校验层   │→│ 服务层 (Business)  │  │   │
│  │  │ tasks    │  │ (Zod)    │  │ taskService       │  │   │
│  │  │ lists    │  │          │  │ pomodoroService   │  │   │
│  │  │ pomodoros│  │          │  │ statsService      │  │   │
│  │  │ stats    │  │          │  │ listService       │  │   │
│  │  └──────────┘  └──────────┘  └────────┬──────────┘  │   │
│  │                                        │              │   │
│  │  ┌─────────────────────────────────────┴──────────┐  │   │
│  │  │              Prisma ORM (数据访问层)             │  │   │
│  │  └────────────────────────┬───────────────────────┘  │   │
│  └───────────────────────────┼──────────────────────────┘   │
│                              │                              │
│  ┌───────────────────────────┴──────────────────────────┐   │
│  │              SQLite / PostgreSQL                      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 前端路由设计

```
/                        → 重定向到 /tasks
/tasks                   → 任务管理主页（看板/列表视图切换）
/tasks/:id               → 任务详情（含关联番茄记录）
/pomodoro                → 番茄计时器主界面
/pomodoro?taskId=xxx     → 为指定任务启动番茄钟
/calendar                → 日历视图（月/周/日切换，展示每日任务与完成情况）
/stats                   → 专注统计仪表盘（日/周/月维度）
/stats/tasks             → 按任务维度的统计
/stats/lists             → 按清单维度的统计
/settings                → 设置（番茄时长、白噪音、主题等）
```

### 3.3 番茄计时客户端架构

```
┌─────────────────────────────────────┐
│          usePomodoro Hook            │
│  ┌────────────────────────────────┐ │
│  │  Timer Engine                  │ │
│  │  · setInterval (主线程)        │ │
│  │  · Web Worker (后台保活)       │ │
│  │  · Page Visibility API (防休眠)│ │
│  ├────────────────────────────────┤ │
│  │  State Machine                 │ │
│  │  IDLE → FOCUS → SHORT_BREAK   │ │
│  │    ↑       ↓          ↓        │ │
│  │    └─── LONG_BREAK ←───────────│ │
│  ├────────────────────────────────┤ │
│  │  Audio Manager (Howler.js)     │ │
│  │  Notification Manager          │ │
│  └────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## 4. 数据模型设计

### 4.1 实体关系图 (ERD)

```
┌──────────┐       ┌──────────┐       ┌──────────┐       ┌──────────────┐
│   User   │1────*│   List   │1────*│ Section  │1────*│    Task      │
│          │      │          │      │          │      │              │
│ id       │      │ id       │      │ id       │      │ id           │
│ name     │      │ name     │      │ name     │      │ title        │
│ settings │      │ color    │      │ sortOrder│      │ description  │
└──────────┘      │ userId   │      │ listId   │      │ priority     │
                  └──────────┘      └──────────┘      │ status       │
                                                      │ dueDate      │
                                                      │ estimatedPomos│
                                                      │ listId       │
                                                      │ sectionId    │
                                                      │ parentId (子任务)│
                                                      │ order        │
                                                      │ tags[]       │
                                                      └──────┬───────┘
                                                             │1
                                                             │
                                                             │*
                                                      ┌──────┴───────┐
                                                      │ PomodoroRecord│
                                                      │              │
                                                      │ id           │
                                                      │ taskId       │
                                                      │ userId       │
                                                      │ startTime    │
                                                      │ endTime      │
                                                      │ duration     │
                                                      │ type(FOCUS/BREAK)│
                                                      │ completed    │
                                                      │ interruptedAt│
                                                      └──────────────┘
```

### 4.2 Prisma Schema

```prisma
// schema.prisma

datasource db {
  provider = "sqlite"    // 开发环境；生产切换为 "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ==================== 用户 ====================
model User {
  id        String   @id @default(uuid())
  name      String   @default("FocusList User")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // 番茄设置（JSON 存储灵活配置）
  settings  String   @default("{\"focusDuration\":25,\"shortBreakDuration\":5,\"longBreakDuration\":15,\"longBreakInterval\":4,\"autoStartBreak\":false,\"autoStartFocus\":false,\"whiteNoise\":\"none\",\"volume\":80}")

  lists     List[]
  tasks     Task[]
  pomodoros PomodoroRecord[]
}

// ==================== 清单（项目/分类） ====================
model List {
  id        String   @id @default(uuid())
  name      String
  color     String   @default("#3B82F6")
  icon      String   @default("list")
  sortOrder Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  tasks     Task[]
  sections  Section[]

  @@index([userId])
}

// ==================== 单元分组（清单内编号单元 1,2,3...） ====================
model Section {
  id        String   @id @default(uuid())
  name      String                     // 如 "第1单元"、"模块一"
  sortOrder Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  listId    String
  list      List     @relation(fields: [listId], references: [id], onDelete: Cascade)

  tasks     Task[]

  @@index([listId])
}

// ==================== 任务 ====================
model Task {
  id             String    @id @default(uuid())
  title          String
  description    String    @default("")
  priority       Priority  @default(MEDIUM)
  status         Status    @default(TODO)
  dueDate        DateTime?
  estimatedPomos Int       @default(0)    // 预估番茄数
  completedPomos Int       @default(0)    // 已完成番茄数（冗余字段，便于快速展示）
  totalFocusTime Int       @default(0)    // 累计专注秒数（冗余字段）
  tags           String    @default("[]") // JSON 数组存储标签
  sortOrder      Int       @default(0)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  completedAt    DateTime?

  // 子任务支持（自引用）
  parentId       String?
  parent         Task?     @relation("SubTasks", fields: [parentId], references: [id], onDelete: SetNull)
  children       Task[]    @relation("SubTasks")

  userId         String
  user           User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  listId         String?
  list           List?     @relation(fields: [listId], references: [id], onDelete: SetNull)

  sectionId      String?
  section        Section?  @relation(fields: [sectionId], references: [id], onDelete: SetNull)

  pomodoros      PomodoroRecord[]

  @@index([userId, status])
  @@index([userId, priority])
  @@index([userId, listId])
  @@index([userId, sectionId])
  @@index([parentId])
}

// ==================== 番茄记录 ====================
model PomodoroRecord {
  id            String        @id @default(uuid())
  startTime     DateTime
  endTime       DateTime?
  duration      Int           // 实际计时秒数
  type          PomodoroType  @default(FOCUS)  // FOCUS | SHORT_BREAK | LONG_BREAK
  completed     Boolean       @default(false)  // 是否正常完成
  interruptedAt DateTime?                      // 中断时间点

  createdAt     DateTime      @default(now())

  taskId        String
  task          Task          @relation(fields: [taskId], references: [id], onDelete: Cascade)

  userId        String
  user          User          @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt])
  @@index([taskId])
  @@index([userId, type])
}

// ==================== 每日统计快照（可选，用于趋势图） ====================
model DailyStats {
  id             String   @id @default(uuid())
  date           DateTime // 日期（只存日期部分）
  totalFocusSec  Int      @default(0)
  completedPomos Int      @default(0)
  completedTasks Int      @default(0)
  interruptedPomos Int    @default(0)

  userId         String
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, date])
  @@index([userId, date])
}

// ==================== 枚举 ====================
enum Priority {
  HIGH
  MEDIUM
  LOW
}

enum Status {
  TODO
  IN_PROGRESS
  DONE
}

enum PomodoroType {
  FOCUS
  SHORT_BREAK
  LONG_BREAK
}
```

### 4.3 关键设计决策

| 设计点 | 方案 | 理由 |
|-------|------|------|
| `completedPomos` / `totalFocusTime` 冗余 | Task 表冗余存储 | 避免每次展示任务列表都做聚合查询 |
| `estimatedPomos` | Task 表字段 | 用户可以预估任务需要几个番茄，计划分配 |
| 标签存储 | JSON 数组字符串 `"["urgent","work"]"` | SQLite 不支持数组，JSON 字符串简单够用，标签数量少 |
| `parentId` 自引用 | 同一 Task 表 | 子任务最多两级，无需独立表 |
| `DailyStats` 快照表 | 独立聚合表 | 避免跨月统计时扫描大量 PomodoroRecord |
| 用户设置存储 | JSON 字符串字段 | 番茄设置结构简单、读取频繁、极少单独查询字段 |

---

## 5. RESTful API 设计

### 5.1 基础规范

- **Base URL**: `/api/v1`
- **Content-Type**: `application/json`
- **统一响应格式**:

```json
{
  "success": true,
  "data": { ... },
  "message": "ok",
  "pagination": { "page": 1, "pageSize": 20, "total": 100, "totalPages": 5 }
}
```

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "标题不能为空",
    "details": [{ "field": "title", "message": "必填字段" }]
  }
}
```

### 5.2 接口清单

#### 清单 (Lists)

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/lists` | 获取用户所有清单 |
| `POST` | `/lists` | 创建清单 |
| `PUT` | `/lists/:id` | 更新清单 |
| `DELETE` | `/lists/:id` | 删除清单（级联取消关联任务） |
| `PATCH` | `/lists/reorder` | 拖拽排序清单 |

#### 单元分组 (Sections)

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/lists/:listId/sections` | 获取清单下所有单元 |
| `POST` | `/lists/:listId/sections` | 创建单元（如"第1单元"） |
| `PUT` | `/sections/:id` | 更新单元名称/排序 |
| `DELETE` | `/sections/:id` | 删除单元 |

#### 任务 (Tasks)

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/tasks` | 获取任务列表（支持筛选） |
| `GET` | `/tasks/:id` | 获取任务详情（含关联番茄记录摘要） |
| `POST` | `/tasks` | 创建任务 |
| `PUT` | `/tasks/:id` | 更新任务 |
| `DELETE` | `/tasks/:id` | 删除任务 |
| `PATCH` | `/tasks/:id/status` | 快速切换状态 |
| `PATCH` | `/tasks/reorder` | 拖拽排序任务 |
| `POST` | `/tasks/:id/subtasks` | 添加子任务 |
| `GET` | `/tasks/:id/pomodoros` | 获取任务关联的番茄记录 |

**筛选参数** (`GET /tasks`):

```
?status=TODO,IN_PROGRESS    // 状态筛选（逗号分隔多选）
&priority=HIGH              // 优先级筛选
&listId=xxx                 // 按清单筛选
&sectionId=xxx              // 按单元筛选
&tag=urgent                 // 按标签筛选
&keyword=xxx                // 标题搜索
&dueDate=today|week|overdue // 截止日筛选
&sort=priority|dueDate|createdAt  // 排序
&order=asc|desc
&page=1&pageSize=20
```

#### 番茄计时 (Pomodoros)

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/pomodoros` | 创建/保存一条番茄记录（计时结束时调用） |
| `GET` | `/pomodoros` | 获取番茄记录列表（按时间倒序） |
| `GET` | `/pomodoros/today` | 获取今日番茄记录摘要 |
| `PATCH` | `/pomodoros/:id/interrupt` | 标记番茄中断 |

**创建番茄记录请求体**:

```json
{
  "taskId": "uuid",
  "startTime": "2026-07-17T09:00:00Z",
  "endTime": "2026-07-17T09:25:00Z",
  "duration": 1500,
  "type": "FOCUS",
  "completed": true
}
```

#### 日历 (Calendar)

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/calendar?start=&end=` | 获取日期范围内的任务，按日期分组返回 |

**响应格式**：

```json
{
  "success": true,
  "data": {
    "2026-07-17": [
      { "id": "uuid", "title": "完成架构设计", "status": "DONE", "priority": "HIGH", "listId": "uuid", "dueDate": "2026-07-17" },
      { "id": "uuid", "title": "编写测试用例", "status": "TODO", "priority": "MEDIUM", "listId": "uuid", "dueDate": "2026-07-17" }
    ],
    "2026-07-18": [
      { "id": "uuid", "title": "前端开发", "status": "IN_PROGRESS", "priority": "HIGH", "listId": "uuid", "dueDate": "2026-07-18" }
    ]
  }
}
```

#### 统计 (Stats)

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/stats/overview` | 总览统计（总专注时长、完成番茄数、完成任务数） |
| `GET` | `/stats/daily?start=&end=` | 每日统计趋势（用于图表） |
| `GET` | `/stats/by-task?start=&end=` | 按任务聚合统计 |
| `GET` | `/stats/by-list?start=&end=` | 按清单聚合统计 |
| `GET` | `/stats/by-tag?start=&end=` | 按标签聚合统计 |
| `GET` | `/stats/list-progress` | 清单进度统计：每个清单的任务完成率（total/done/rate） |

**清单进度响应格式**：
```json
{
  "success": true,
  "data": [
    {
      "listId": "uuid", "listName": "工作项目", "color": "#3B82F6",
      "totalTasks": 8, "doneTasks": 5, "inProgressTasks": 2, "todoTasks": 1,
      "completionRate": 62.5,
      "sections": [
        { "sectionId": "uuid", "name": "第1单元", "totalTasks": 4, "doneTasks": 3, "completionRate": 75 },
        { "sectionId": "uuid", "name": "第2单元", "totalTasks": 4, "doneTasks": 2, "completionRate": 50 }
      ]
    }
  ]
}
```

#### 用户设置 (Settings)

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/settings` | 获取用户设置 |
| `PUT` | `/settings` | 更新用户设置 |

### 5.3 番茄计时关键流程

```
客户端                                服务端
  │                                     │
  │  用户选择任务 → 点击"开始专注"        │
  │  ─────────────────────────────────  │
  │  usePomodoro Hook 启动本地计时器     │
  │  (不请求服务端，完全本地计时)         │
  │                                     │
  │  计时结束 / 用户主动结束              │
  │  ─────────────────────────────────  │
  │  POST /api/v1/pomodoros ──────────→│
  │                                     │ 创建 PomodoroRecord
  │                                     │ 更新 Task.completedPomos +1
  │                                     │ 更新 Task.totalFocusTime
  │                                     │ 更新 DailyStats 快照
  │  ←────────── 返回记录 ──────────────│
  │                                     │
```

**设计理由**：番茄计时对实时性要求高（秒级），若依赖服务端计时，网络抖动会导致体验差。客户端自管理计时，仅在结束时上报，简洁可靠。

---

## 6. 项目目录结构

```
todo-app/
├── package.json                    # 根目录统一脚本
├── README.md
├── .gitignore
├── .env.example
├── docker-compose.yml
│
├── docs/
│   ├── architecture.md             # 本文档
│   └── ui-design.md                # UI 设计规范
│
├── server/                         # 后端
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env
│   ├── Dockerfile
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── src/
│       ├── index.ts                # 入口：Express 启动
│       ├── app.ts                  # Express app 配置（中间件注册）
│       ├── config/
│       │   └── env.ts              # 环境变量解析
│       ├── middleware/
│       │   ├── errorHandler.ts     # 全局错误处理
│       │   └── validate.ts         # Zod 校验中间件工厂
│       ├── routes/
│       │   ├── index.ts            # 路由汇总注册
│       │   ├── list.routes.ts
│       │   ├── task.routes.ts
│       │   ├── section.routes.ts
│       │   ├── pomodoro.routes.ts
│       │   ├── calendar.routes.ts
│       │   ├── stats.routes.ts
│       │   └── settings.routes.ts
│       ├── validators/
│       │   ├── list.validator.ts
│       │   ├── task.validator.ts
│       │   ├── pomodoro.validator.ts
│       │   ├── calendar.validator.ts
│       │   └── stats.validator.ts
│       ├── services/
│       │   ├── list.service.ts
│       │   ├── task.service.ts
│       │   ├── section.service.ts
│       │   ├── pomodoro.service.ts
│       │   ├── calendar.service.ts
│       │   ├── stats.service.ts
│       │   └── settings.service.ts
│       ├── lib/
│       │   ├── prisma.ts           # PrismaClient 单例
│       │   ├── apiResponse.ts      # 统一响应工具函数
│       │   └── errors.ts           # 自定义错误类
│       └── types/
│           └── index.ts            # 共享类型定义
│
└── client/                         # 前端
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── index.html
    ├── Dockerfile
    ├── nginx.conf
    └── src/
        ├── main.tsx                # 入口
        ├── App.tsx                 # 路由配置 + 全局 Provider
        ├── vite-env.d.ts
        │
        ├── assets/                 # 静态资源（图标、音频）
        │   └── sounds/
        │       ├── bell.mp3        # 番茄结束提示音
        │       ├── rain.mp3        # 雨声白噪音
        │       └── forest.mp3      # 森林白噪音
        │
        ├── styles/
        │   ├── global.css          # 全局样式 + CSS 变量
        │   ├── theme.ts            # Ant Design 主题配置
        │   └── animations.css      # 动效样式
        │
        ├── types/
        │   ├── task.ts             # Task 相关类型
        │   ├── list.ts             # List 相关类型
        │   ├── pomodoro.ts         # Pomodoro 相关类型
        │   └── api.ts              # API 响应泛型
        │
        ├── api/
        │   ├── client.ts           # Axios 实例 + 拦截器
        │   ├── tasks.ts            # 任务 API
        │   ├── lists.ts            # 清单 API
        │   ├── pomodoros.ts        # 番茄记录 API
        │   ├── calendar.ts          # 日历 API
        │   ├── stats.ts            # 统计 API
        │   └── settings.ts         # 设置 API
        │
        ├── stores/
        │   ├── taskStore.ts        # 任务状态管理
        │   ├── listStore.ts        # 清单状态管理
        │   ├── pomodoroStore.ts    # 番茄计时状态
        │   ├── calendarStore.ts     # 日历视图状态
        │   ├── filterStore.ts      # 筛选状态
        │   └── settingsStore.ts    # 用户设置状态
        │
        ├── hooks/
        │   ├── usePomodoro.ts      # 番茄计时核心 Hook
        │   ├── usePomodoroTimer.ts # 计时器引擎
        │   ├── useAudio.ts         # 音频播放 Hook
        │   ├── useNotification.ts  # 浏览器通知 Hook
        │   ├── useDebounce.ts      # 防抖 Hook
        │   └── usePageTitle.ts     # 页面标题（显示剩余时间）
        │
        ├── pages/
        │   ├── TasksPage/
        │   │   ├── index.tsx       # 任务管理页
        │   │   └── components/
        │   │       ├── TaskList.tsx
        │   │       ├── TaskItem.tsx
        │   │       ├── TaskForm.tsx
        │   │       ├── TaskFilter.tsx
        │   │       ├── ListSidebar.tsx
        │   │       └── TaskDetailDrawer.tsx
        │   │
        │   ├── PomodoroPage/
        │   │   ├── index.tsx       # 番茄计时页
        │   │   └── components/
        │   │       ├── TimerDisplay.tsx      # 圆形计时器显示
        │   │       ├── TimerControls.tsx     # 开始/暂停/跳过按钮
        │   │       ├── TaskSelector.tsx      # 选择要专注的任务
        │   │       ├── SessionProgress.tsx   # 当前轮次进度指示
        │   │       └── WhiteNoiseSelector.tsx
        │   │
        │   ├── CalendarPage/
        │   │   ├── index.tsx          # 日历视图主页
        │   │   └── components/
        │   │       ├── CalendarGrid.tsx       # 月/周日历网格
        │   │       ├── DayCell.tsx            # 日期单元格（任务数+完成状态）
        │   │       ├── DayDetail.tsx          # 点击日期展开当日任务列表
        │   │       ├── ViewSwitcher.tsx       # 月/周/日视图切换
        │   │       └── MiniTaskItem.tsx       # 日历中的迷你任务卡片
        │   │
        │   ├── StatsPage/
        │   │   ├── index.tsx       # 统计仪表盘
        │   │   └── components/
        │   │       ├── OverviewCards.tsx     # 总览卡片
        │   │       ├── DailyChart.tsx        # 每日趋势图
        │   │       ├── TaskDistribution.tsx  # 任务分布饼图
        │   │       └── TagBreakdown.tsx      # 标签分类统计
        │   │
        │   └── SettingsPage/
        │       ├── index.tsx
        │       └── components/
        │           ├── PomodoroSettings.tsx  # 番茄时长设置
        │           ├── AudioSettings.tsx     # 音频设置
        │           └── ThemeSettings.tsx     # 主题设置
        │
        └── components/             # 共享组件
            ├── Layout/
            │   ├── AppLayout.tsx   # 主布局（侧边栏 + 内容区）
            │   ├── Sidebar.tsx     # 导航侧边栏
            │   └── Header.tsx      # 顶部栏
            ├── PomodoroMini/
            │   └── index.tsx       # 迷你计时器（常驻侧边栏）
            └── common/
                ├── EmptyState.tsx
                ├── ErrorBoundary.tsx
                └── LoadingSkeleton.tsx
```

---

## 7. 关键模块设计

### 7.1 usePomodoro Hook 设计

这是应用最核心的模块，需要处理计时精度、标签页后台运行、通知提醒。

```typescript
// hooks/usePomodoro.ts 接口设计

interface UsePomodoroReturn {
  // 状态
  phase: 'idle' | 'focus' | 'shortBreak' | 'longBreak';
  timeLeft: number;           // 剩余秒数
  totalDuration: number;      // 当前阶段总秒数
  progress: number;           // 0-1 进度
  isRunning: boolean;
  isPaused: boolean;

  // 当前轮次
  currentSession: number;     // 第几个番茄
  totalSessions: number;      // 长休息前共几个番茄

  // 关联任务
  selectedTaskId: string | null;

  // 操作
  selectTask: (taskId: string) => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
  skip: () => void;           // 跳过当前阶段
  stop: () => void;           // 完全停止
  interrupt: () => void;      // 中断当前番茄

  // 设置
  settings: PomodoroSettings;
  updateSettings: (s: Partial<PomodoroSettings>) => void;
}

interface PomodoroSettings {
  focusDuration: number;         // 默认 25 分钟
  shortBreakDuration: number;    // 默认 5 分钟
  longBreakDuration: number;     // 默认 15 分钟
  longBreakInterval: number;     // 默认 4 个番茄后
  autoStartBreak: boolean;
  autoStartFocus: boolean;
  whiteNoise: 'none' | 'rain' | 'forest' | 'cafe';
  volume: number;
}
```

### 7.2 计时精度保障

```
┌──────────────────────────────────────┐
│         计时精度策略                   │
│                                      │
│  主方案：setInterval(1000ms)          │
│  · 每秒递减 timeLeft                 │
│  · 用 Date.now() 差值校准（防漂移）   │
│                                      │
│  后台保活：Web Worker                 │
│  · 标签页不可见时 Worker 继续计时     │
│  · postMessage 同步剩余时间          │
│                                      │
│  防休眠：Page Visibility API          │
│  · 页面恢复可见时校准时间             │
│  · 休眠时间过长 → 标记番茄可能无效    │
│                                      │
│  降级方案：纯 setInterval             │
│  · 不支持 Worker 的环境回退          │
└──────────────────────────────────────┘
```

### 7.3 番茄完成后的服务端处理

当 `POST /api/v1/pomodoros` 被调用时，服务端需要原子性地执行以下操作：

```
BEGIN TRANSACTION

1. INSERT INTO PomodoroRecord (taskId, userId, startTime, endTime, duration, type, completed)
2. UPDATE Task SET completedPomos = completedPomos + 1,
                  totalFocusTime = totalFocusTime + duration
   WHERE id = taskId
3. UPSERT INTO DailyStats (userId, date)
   SET completedPomos = completedPomos + 1,
       totalFocusSec = totalFocusSec + duration

COMMIT
```

### 7.4 日历视图实现方案

```
┌──────────────────────────────────────┐
│         日历视图策略                   │
│                                      │
│  数据获取：GET /calendar?start=&end=  │
│  · 传入日期范围（月视图≈42天）        │
│  · 服务端按 dueDate 分组返回          │
│  · 客户端缓存在 calendarStore         │
│                                      │
│  视图切换：月 / 周 / 日               │
│  · dayjs 计算当月起止 + 前后补齐      │
│  · UI 用 CSS Grid 渲染日历网格        │
│                                      │
│  日期单元格 (DayCell)：               │
│  · 显示任务数量徽标                   │
│  · 0-100% 完成进度环                  │
│  · 点击弹出 DayDetail 抽屉            │
│                                      │
│  当日任务列表 (DayDetail)：            │
│  · 任务标题 + 优先级标签 + 状态勾选   │
│  · 支持直接勾选完成                   │
│  · 支持跳转到番茄计时页               │
└──────────────────────────────────────┘
```

---


## 8. 设计决策记录

| # | 决策 | 备选方案 | 选择理由 |
|---|------|---------|---------|
| 1 | 番茄计时客户端自管理 | 服务端计时 + WebSocket 同步 | 避免网络延迟影响体验；离线场景友好 |
| 2 | 任务完成番茄数冗余存储 | 每次查询时 COUNT 聚合 | 任务列表高频读取，冗余避免 N+1 |
| 3 | DailyStats 独立聚合表 | 直接查 PomodoroRecord GROUP BY | 统计页面查询性能；数据量增大后优势明显 |
| 4 | 标签用 JSON 字符串 | 独立 Tag 表 + 多对多 | 标签数量少(每个任务 2-5 个)，JSON 更简洁；SQLite 无原生数组 |
| 5 | 子任务用自引用 parentId | 独立 SubTask 表 | 子任务结构简单，自引用减少表数量 |
| 6 | 用户设置用 JSON 字符串 | 独立 Settings 表多字段 | 设置结构稳定、整体读写、极少条件查询 |
| 7 | 白噪音用 Howler.js | Web Audio API 原生 | 跨浏览器兼容性好、音频控制 API 简洁 |
| 8 | 统计图表用 Recharts | ECharts / Chart.js | 最轻量、React 原生声明式、满足需求 |
| 9 | 不做实时同步 | WebSocket 双向通信 | 当前无多端实时协作需求，HTTP 足够；v3 再考虑 |
| 10 | 前端路由 SPA | SSR (Next.js) | 应用交互密集、SEO 需求低、部署简单 |
| 11 | 日历日期库 dayjs | moment.js / date-fns | dayjs 仅 2KB、API 与 moment 兼容、插件化 |

---

## 9. 功能清单（开发总览）

### 9.1 Phase 1 — 核心 MVP（第一批交付）

| # | 模块 | 功能项 | 说明 | 状态 |
|---|------|--------|------|:----:|
| 1 | 清单管理 | 创建/编辑/删除清单 | 项目分类，含名称、颜色、图标 | ⬜ |
| 2 | 清单管理 | 清单拖拽排序 | 自定义排序后持久化 | ⬜ |
| 3 | 清单管理 | 单元分组管理 | 清单内创建编号单元（1,2,3），任务按单元归类 | ⬜ |
| 4 | 任务管理 | 创建/编辑/删除任务 | 标题、描述、优先级、截止日、预估番茄数、归属单元 | ⬜ |
| 5 | 任务管理 | 任务归属清单+单元 | 将任务分配到已有清单的指定单元 | ⬜ |
| 6 | 任务管理 | 快速切换状态 | TODO → IN_PROGRESS → DONE 一键流转 | ⬜ |
| 7 | 任务管理 | 筛选与搜索 | 按状态/优先级/清单/单元/标签/截止日/关键词筛选 | ⬜ |
| 8 | 任务管理 | 拖拽排序 | 任务在清单内自定义排序 | ⬜ |
| 9 | 任务管理 | 任务选择执行 | 从任务列表中勾选当前要执行的任务，高亮显示 | ⬜ |
| 10 | 番茄计时 | 标准番茄钟 | 25 分钟专注 + 5 分钟短休息，支持暂停/继续 | ⬜ |
| 11 | 番茄计时 | 自定义时长 | 用户可自行设定专注/短休/长休时长 | ⬜ |
| 12 | 番茄计时 | 跳过/中断 | 跳过当前阶段、中断番茄并记录 | ⬜ |
| 13 | 番茄计时 | 关联任务 | 从任务卡片一键启动番茄，计时自动关联 | ⬜ |
| 14 | 番茄记录 | 完成上报 | 计时结束自动 POST 记录，服务端原子事务更新统计 | ⬜ |
| 15 | 番茄记录 | 今日摘要 | 查看今日已完成番茄数、总专注时长 | ⬜ |
| 16 | 日历视图 | 月视图 | 显示当月所有日期，每天显示任务数+完成进度环 | ⬜ |
| 17 | 日历视图 | 周/日视图 | 切换至周视图或单日视图 | ⬜ |
| 18 | 日历视图 | 日期详情 | 点击某天弹出当日任务列表，支持勾选完成 | ⬜ |
| 19 | 统计面板 | 总览卡片 | 总专注时长、完成番茄数、完成任务数 | ⬜ |
| 20 | 统计面板 | 每日趋势图 | 日期范围内的每日专注时长柱状图 | ⬜ |
| 21 | 统计面板 | 清单进度统计 | 每个清单的任务完成率（done/total）+ 进度条 | ⬜ |
| 22 | 用户设置 | 番茄设置 | 自定义专注/短休/长休时长、长休间隔、自动开始 | ⬜ |
| 23 | 用户设置 | 主题设置 | 亮色/暗色模式切换 | ⬜ |

| 总计 | Phase 1 | **23 项功能** |

### 9.2 Phase 2 — 统计增强（第二批交付）

| # | 模块 | 功能项 | 说明 | 状态 |
|---|------|--------|------|:----:|
| 24 | 统计面板 | 按任务聚合统计 | 查看每个任务的番茄投入排行 | ⬜ |
| 25 | 统计面板 | 按清单聚合统计 | 按清单维度查看时间分配 | ⬜ |
| 26 | 统计面板 | 按标签聚合统计 | 标签维度的专注时间分布（饼图） | ⬜ |
| 27 | 统计面板 | 按单元进聚合统计 | 清单内各单元的任务完成率对比 | ⬜ |

| 总计 | Phase 2 | **4 项功能** |

### ~~9.3 Phase 3 — 体验优化~~（已砍掉）
| ~~白噪音~~ | ~~浏览器通知~~ | ~~迷你计时器~~ | ~~键盘快捷键~~ | ~~页面标题倒计时~~ |

### 9.4 Phase 3 — 高级功能（第三批交付）

| # | 模块 | 功能项 | 说明 | 状态 |
|---|------|--------|------|:----:|
| 28 | 任务管理 | 子任务 | 任务下创建子任务，支持展开/折叠 | ⬜ |
| 29 | 任务管理 | 标签管理 | 全局标签列表，标签颜色自定义 | ⬜ |
| 30 | 任务管理 | 暗色模式 | 完整暗色主题适配 | ⬜ |
| 31 | 统计面板 | 导出报告 | 导出 PDF/CSV 专注报告 | ⬜ |

| 总计 | Phase 3 | **4 项功能** |

> **全量总计：31 项功能** | 当前 MVP 范围：Phase 1 的 23 项

---

## 附录 A：开发阶段规划

| 阶段 | 内容 | 预估 |
|------|------|------|
| **Phase 1: 核心 MVP** | 任务 CRUD + 清单管理 + 单元分组 + 基础番茄计时 + 日历视图 + 清单进度统计 | 第一优先级 |
| **Phase 2: 统计增强** | 统计仪表盘、每日趋势图、按任务/清单/标签/单元聚合 | 第二优先级 |
| **Phase 3: 高级功能** | 子任务、标签管理、暗色模式、导出报告 | 第三优先级 |
| ~~Phase 3(旧)~~ | ~~白噪音、浏览器通知、迷你计时器、快捷键、标题倒计时~~ | 已砍掉 |

## 附录 B：环境变量

```env
# 服务端
SERVER_PORT=3001
DATABASE_URL="file:./dev.db"        # SQLite 开发
# DATABASE_URL="postgresql://..."    # PostgreSQL 生产
NODE_ENV=development

# 客户端
VITE_API_BASE_URL=http://localhost:3001/api/v1
VITE_PORT=5173
```
