# CYC ZINE — Expo App 產品目標

> 最後更新：2026-08-13  
> 複習筆記：[`EXPO-LEARNING-NOTES.md`](./EXPO-LEARNING-NOTES.md)  
> 新目標規格：[`APP-PRODUCT-GOAL.md`](./APP-PRODUCT-GOAL.md)  
> GAS：[`GAS-REGISTER-PUSH-TOKEN.md`](./GAS-REGISTER-PUSH-TOKEN.md)

---

## 目標（已調整）

把 [CYC Zine 網站](https://cyc-zine.vercel.app) 做成**原生 Expo App**（非 WebView）。

- **一頁做完再下一頁**（功能 + 視覺一起對齊）
- **順序：活動 → 首頁 → 專訪 → 收藏／登入**
- **與網站共存**：日常只改 `mobile/`；若需新 API／改 Next，**先經你同意**再動線上 web
- 資料仍走 Next.js `/api/*`

---

## 進度總覽

| 階段 | 名稱 | 狀態 |
|------|------|------|
| 基礎 1–4 | Expo、API、基本 UI、Navigation | ✅ 完成 |
| 基礎 5 | Push（Token／註冊／GAS／測試推播） | ✅ 主線完成 |
| 基礎 7 | 環境變數 | ✅ 完成 |
| **P1** | **活動頁對齊（做法 B：縣市篩選 + 視覺）** | ✅ 完成 |
| P2 | 首頁品牌視覺 | ⬜ 未開始 |
| P3 | 專訪 | ⬜ 未開始 |
| P4 | 收藏／登入 | ⬜ 未開始 |
| — | 錯誤處理強化 | 穿插 |
| — | Offline DB | 不做（原則） |

**狀態圖例：** ⬜ 未開始 · 🔄 進行中 · ✅ 完成

**近期里程碑：**

> P1 已完成。下一頁：首頁品牌視覺（P2）。

---

## 共存原則（重要）

| 可以 | 不可以（未同意前） |
|---|---|
| 只改 `mobile/` 畫面、導航、theme、App 端資料處理 | 改線上網站 UI |
| 繼續用現有 `/api/org` 等 | 擅自新增／修改 production API |
| 提出「需要新 API」的方案給你審 | 未同意就改 Next.js 並 deploy |

**預設：只改 mobile。**  
只有現有 API 不夠用時，才可能動 Next；那時會先跟你說明要開什麼、會不會影響網站，**你同意後才改**。

此 monorepo 根目錄已 ignore `/frontend/`；日常產品改版以 **mobile 為主**。

---

## P1 活動頁（做法 B）摘要

```
縣市 chips（資料去重）→ 篩選列表 → 點進詳情
視覺：tokens 對齊網站；縣市用可搜尋選單（非橫滑 chips、非 SVG 地圖）
```

詳細 DoD 見 [`APP-PRODUCT-GOAL.md`](./APP-PRODUCT-GOAL.md)。

---

## 已完成的技術基礎（保留）

仍有效、之後會繼續用：

- Expo Router、`getOrgData()`、Event Detail
- Push：Token → `/api/push/register` → GAS `DEVICE_PUSH_TOKENS` → 測試推播

學習筆記見 `EXPO-LEARNING-NOTES.md`（基礎階段紀錄保留）。

---

## 舊計畫對照

舊「階段 1–10 教學路線」已收斂為上表。  
錯誤處理、避免過度抽象等原則仍適用，但**主線改為產品頁面對齊**。
