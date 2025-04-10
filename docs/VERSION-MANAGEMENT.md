# 版本管理指南

本项目使用 [Changesets](https://github.com/changesets/changesets) 进行版本管理。Changesets 是一个为 monorepo 项目设计的版本管理工具，可以帮助我们有效地管理多个包的版本发布。

## 基本概念

- **Changeset**：描述一次更改的元数据，包括版本变更类型（patch/minor/major）和变更描述。
- **版本类型**：
  - `patch`：修复 bug 或小改动，不影响 API 使用（例如：1.0.0 -> 1.0.1）
  - `minor`：添加新功能，但保持向后兼容（例如：1.0.0 -> 1.1.0）
  - `major`：进行破坏性更改，不向后兼容（例如：1.0.0 -> 2.0.0）

## 开发工作流

1. **创建更改**：在开发新功能或修复 bug 后，创建一个 changeset：

   ```bash
   bun changeset
   ```

   按照提示，选择受影响的包，选择版本类型，并写下变更描述。

2. **提交更改**：将生成的 changeset 文件与代码一起提交到 Git 仓库。

   ```bash
   git add .changeset/
   git commit -m "添加关于 XXX 功能的 changeset"
   ```

3. **版本更新**：准备发布时，运行以下命令更新各个包的版本号：

   ```bash
   bun version
   ```

4. **发布**：运行以下命令构建并发布更新的包：

   ```bash
   bun publish
   ```

## 常用命令

- **创建 changeset**：

  ```bash
  bun changeset
  ```

- **更新版本号**：

  ```bash
  bun version
  ```

- **发布包**：

  ```bash
  bun publish
  ```

- **预览变更（不实际更新版本号）**：

  ```bash
  bun changeset version --dry-run
  ```

## 如何处理依赖关系

- 当包 A 依赖于包 B，并且包 B 发生了变化，Changesets 会自动更新包 A 的依赖版本，根据 `.changeset/config.json` 中的 `updateInternalDependencies` 设置确定版本提升类型（默认为 `patch`）。

- 如果多个包总是需要一起发布，可以在 `.changeset/config.json` 的 `fixed` 中进行配置：

  ```json
  {
    "fixed": [["@doc-editor/core", "@doc-editor/ui"]]
  }
  ```

## 自动化发布 (CI/CD)

如果需要通过 CI/CD 自动发布，可以考虑结合 GitHub Actions 来实现。创建 `.github/workflows/release.yml` 文件实现相关功能。

## 最佳实践

1. 每次功能开发或 bug 修复后，都创建一个 changeset
2. changeset 的描述应清晰说明变更内容，以便于自动生成有意义的 CHANGELOG
3. 在合并到主分支前，确保所有需要的 changeset 已创建
4. 定期发布版本，避免积累过多变更

## 相关资源

- [Changesets 官方文档](https://github.com/changesets/changesets/blob/main/docs/intro-to-using-changesets.md)
- [使用 GitHub Actions 自动发布](https://github.com/changesets/action)
