# 2026-07-04 NEWAPI-QIQI AI 规范初始化

## 背景

NEWAPI-QIQI 以官方 new-api 为全新基线开始自定义修改。第一次线上修复尝试暴露出一条必须固化的工程规则：Docker 镜像构建不应默认发生在业务服务器上。

## 变更

- 从 ZERO 迁移六层 `.ai` 架构。
- 新增项目入口 `.ai/README.md`。
- 新增项目级开发规范 `00.project-01.development-rules.md`。
- 将“Docker 镜像必须默认在 GitHub 构建，禁止默认在业务服务器上构建”设为第一条零容忍规则。
- 新增 GitHub Actions 镜像构建入口 `.github/workflows/ghcr-newapi-qiqi.yml`。

## 后续执行

后续 NEWAPI-QIQI 镜像发布默认走 GitHub Actions 构建并推送到 `ghcr.io/lickjcr/newapi-qiqi`，生产服务器只负责拉取镜像、重启容器、健康检查和回滚。
