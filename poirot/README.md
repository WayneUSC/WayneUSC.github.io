# POIROT:最后一次演示 (POIROT: The Final Demo)

一个可玩的浏览器侦探游戏,也是一个 **machine Theory of Mind 的可玩化演示**:AI 游戏主持人 POIROT-7 在你破案的同时,公开地对"你"进行在线建模——它推测你的怀疑分布、评估你的证据覆盖率、判定你是否"卡住",并据此自适应地投放提示。

灵感来自 POIROT 项目(机器人剧本杀主持人)与"让机器读懂玩家推理到了哪里"的研究思路。

## 玩法

- 单文件、零依赖:双击 `index.html` 即可在浏览器中游玩(桌面/手机均可)。
- 5 个房间搜证 + 4 名嫌疑人问询 + 三要素指控(凶手/动机/手法)。
- 右侧面板实时显示主持人的心智模型:怀疑分布(对玩家信念的估计,EMA 更新)、关键证据覆盖率(知识状态)、"卡住"判定(触发分级提示策略)。
- 结局附主持人复盘:评级 + 完整信念快照。

## 设计要点(可写进 portfolio / SoP)

- **玩家知识模型**:追踪已获取证据集合,门控线索(如取证权限)模拟真实调查依赖链。
- **玩家信念估计**:每个行动携带嫌疑人相关性权重,指数滑动平均更新怀疑分布;含排除性(负权重)证据。
- **自适应提示策略**:以"无新发现的连续行动数"为 stuck 信号,分级投放指向最缺失关键证据的提示——先邀约,后介入,不剧透。

## 部署到 GitHub Pages

```bash
cd POIROT-最后一次演示
git init && git add . && git commit -m "POIROT: The Final Demo"
# 在 GitHub 新建仓库 poirot-final-demo 后:
git remote add origin git@github.com:WayneUSC/poirot-final-demo.git
git push -u origin main
# GitHub → Settings → Pages → Deploy from branch → main → / (root)
```

或直接放进 `wayneusc.github.io` 仓库的子目录,如 `/poirot/`,即可通过 `wayneusc.github.io/poirot/` 访问。

© 2026 Wen Chen
