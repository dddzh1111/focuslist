import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(cors());
app.use(express.json());

// API v1 路由
app.use('/api/v1', routes);

// 生产环境：托管前端构建产物
// 候选目录：容器内的 dist/public（Docker 复制）或本地 client/dist（本地 prod 预览）
const candidateDirs = [
  path.join(__dirname, 'public'),
  path.resolve(__dirname, '../client/dist'),
];
const publicDir = candidateDirs.find((dir) => fs.existsSync(dir));
if (publicDir) {
  app.use(express.static(publicDir));
  // SPA 回退：非 /api 的 GET 请求都返回 index.html（支持前端路由）
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api/')) {
      const indexPath = path.join(publicDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        return res.sendFile(indexPath);
      }
    }
    next();
  });
}

// 全局错误处理
app.use(errorHandler);

export default app;
