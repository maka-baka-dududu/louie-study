# Louie 的小站：线上运行说明

唯一使用入口：https://louie-study-access.louie-zhuo-lv.workers.dev/

- 访客模式：访客密码，可查看允许的内容，配色仅保存于自己的浏览器。
- 个人模式：独立密码与指定 Google 账号验证，可编辑和上传。
- 个人账户、关联记录、附件及智能问答由服务端隔离，不下发给访客。
- 旧 GitHub Pages 首页只负责跳转；通用地图与编程运行组件仍作为静态资源托管，不需要本地服务器。
- 学习数据、附件、问答快照保存在私人 Google Drive。每次保存产生新快照，旧版本留作回滚。
- 问答对话、问题本、长期记忆、教学规则已移至线上；使用原有 DeepSeek API。
- 浏览器中的 Python/C++ 练习、录音、播放和缓存仍使用设备能力，均不需要运行本地网站。

## 授权和密钥

Google OAuth 项目必须为正式版，授权范围为 `drive.file`；回调为网站 `/auth/owner/callback`。代码验证 Google 账号身份后才建立个人模式。

首次正式授权取得的长期刷新令牌保存在 Durable Object 中，并由 `SESSION_SECRET` 派生的 AES-GCM 密钥加密。DeepSeek 密钥也加密存于服务端。前端和备份不会拿到这些密钥。不要随意更换 `SESSION_SECRET`，否则需要重新连接授权和 API。

部署时的必需 secrets：`READ_VERIFIER`、`EDIT_VERIFIER`、`SESSION_SECRET`、`GOOGLE_CLIENT_ID`、`GOOGLE_CLIENT_SECRET`、`DRIVE_ROOT_ID`、`DRIVE_REFRESH_TOKEN`（初始迁移/回滚用途）。线上取得的新长期授权优先于初始令牌。

仓库不保存真实凭证。不要把 `secrets.local.json`、授权配置目录、浏览器 Cookie、私人备份或迁移报告复制进仓库。

## 维护和恢复

`wrangler.jsonc` 为免费 Worker 配置，`ASSET_COMMIT` 指向已推送的前端提交。修改代码后先推送，再将该值设为新提交并部署。不得开启付费服务来绕过额度限制。

每日北京时间 09:15 在云端检查 Drive 连接，记录上次成功时间；不会调用收费 AI 或依赖个人电脑。个人模式的 `/api/system/status` 可查询，`POST /api/system/check` 可手动核验。

个人模式右上角“存储容量”读取 Google 真实额度，达到 90% 提醒。单文件 250 MiB，采用分块可恢复上传。DeepSeek 费用取决于已有 API 账户余额及用量。

免费托管不代表永久 SLA；Google 授权撤销、账号异常、Drive 空间不足、DeepSeek 余额不足及服务商故障仍需处理。若 Drive 需重连，在个人模式“存储容量”中更新长期授权。

本次迁移未删除本地原始记录。旧公开文件已从当前 Pages 部署移除，Git 历史和外部缓存不因普通删除提交而自动清除；如需追溯清理，应先备份并单独评估历史重写及缓存清理。

已安装官方 Wrangler 并登录时，可在推送代码后执行 `node access-server/deploy.mjs`。它使用当前 Git 提交覆盖 `ASSET_COMMIT`，不会读取或打印凭证，也不会把密钥放进命令参数。
