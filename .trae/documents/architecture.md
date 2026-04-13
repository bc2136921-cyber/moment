## 1. 架构设计
```mermaid
graph TD
    subgraph Frontend ["前端 (React + Vite + Tailwind)"]
        A["UI 组件层"]
        B["相机与图像处理服务 (Canvas/WebRTC)"]
        C["状态管理与路由 (Zustand/React Router)"]
        D["实时通信层 (Mock/Supabase Realtime)"]
    end
    subgraph Backend ["后端服务 (可选 BaaS 或 Mock)"]
        E["数据库 (存储房间与状态)"]
        F["存储服务 (存储图片)"]
        G["实时频道 (WebSocket)"]
    end
    A --> C
    A --> B
    C --> D
    B --> D
    D <--> G
    D --> E
    B --> F
```

## 2. 技术说明
- 前端：React@18 + tailwindcss@3 + vite
- 初始化工具：vite-init (或 npm create vite@latest)
- 路由：react-router-dom
- 状态管理：zustand
- 图像处理：HTML5 Canvas API (用于拼接两张照片、应用滤镜并叠加文字)
- 动画库：framer-motion (实现页面丝滑切换、极简呼吸动效)
- 字体与图标：lucide-react，搭配极简无衬线字体
- 后端与实时通信：为快速实现并最小化外部依赖，开发阶段采用基于 localStorage 和 URL 参数的 **Mock Realtime 服务**，后期可无缝接入 Supabase 或自建 WebSocket 服务以实现真正的异地通信。

## 3. 路由定义
| 路由 | 用途 |
|-------|---------|
| / | 首页，展示应用极简简介与“开始我们的时刻”入口 |
| /create | 拍摄与描述页，获取摄像头权限、拍照并输入状态文本 |
| /wait/:roomId | 邀请与等待页，显示分享链接/二维码，实时等待对方加入 |
| /join/:roomId | 受邀者加入页面，同样进行拍摄与描述 |
| /result/:roomId | 拼图结果页，展示拼接后的电影感双人照，提供下载分享 |

## 4. API 定义 (Mock Backend 接口层)
| 接口方法 | 描述 |
|-------|---------|
| `createRoom(data)` | 创建一个房间，返回包含房间 ID 的邀请链接 |
| `joinRoom(roomId, data)` | 受邀者加入房间，提交自己的照片和文本 |
| `pollRoomStatus(roomId)` | 轮询或监听房间状态，当双方完成拍摄时触发结果页跳转 |
| `uploadPhoto(base64)` | 模拟照片上传，返回虚拟或本地 URL |

## 5. 服务器架构图 (状态同步流)
```mermaid
graph LR
    A["客户端 A (发起者)"] -->|1. 创建房间/生成 ID| B("Mock API 层 / 本地存储")
    C["客户端 A (发起者)"] -.->|2. 轮询房间状态| B
    E["客户端 B (受邀者)"] -->|3. 根据 ID 加入房间| B
    B -->|4. 状态变为已完成| B
    B -.->|5. 返回双方数据| A
    B -.->|5. 返回双方数据| E
```

## 6. 数据模型

### 6.1 数据模型定义
```mermaid
erDiagram
    ROOM {
        string id PK "房间唯一标识"
        string creator_photo "创建者照片 (Base64/URL)"
        string creator_status "创建者状态文本"
        string joiner_photo "加入者照片 (Base64/URL)"
        string joiner_status "加入者状态文本"
        string status "状态: waiting/completed"
        number created_at "时间戳"
    }
```

### 6.2 数据定义语言
```javascript
// 基于前端的状态模型类型定义 (TypeScript)
interface Room {
  id: string;
  creatorPhoto: string;
  creatorStatus: string;
  joinerPhoto?: string;
  joinerStatus?: string;
  status: 'waiting' | 'completed';
  createdAt: number;
}
```