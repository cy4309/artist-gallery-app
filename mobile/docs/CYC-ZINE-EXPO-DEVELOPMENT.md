# CYC ZINE — Expo App 產品目標

> 最後更新：2026-08-14  
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
| P2 | 首頁品牌視覺 | ✅ 滿版封面 + 入口卡 |
| P3 | 專訪 | ✅ 列表／篩選／詳情（網站同一批人） |
| P4 | 收藏／登入／活動提醒 | ✅ App 已接（production API 需自行維持） |
| **P5** | **內部分發 + OTA 更新（不上商店）** | ⬜ 未開始 |
| — | 錯誤處理強化 | 穿插 |
| — | Offline DB | 不做（原則） |

**狀態圖例：** ⬜ 未開始 · 🔄 進行中 · ✅ 完成

**近期里程碑：**

> 產品頁面大致可用。下一階段：**P5 內部分發**（自己／朋友下載安裝，不上 App Store／Play；之後改畫面可用 OTA 同步）。

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

## P5 內部分發 + OTA（不上商店）

> 狀態：⬜ 課綱已列，尚未實作  
> 目標：自己能裝獨立 App；可傳下載點給別人；你更新後他們下次開 App 會對到同一版 JS。**不上架商店首頁。**

### 有沒有這種東西？

**有，但 iOS 和 Android 不一樣。**

| | Android | iOS |
|---|---|---|
| 不上商店、傳連結安裝 | **可以**（EAS 出 APK，expo.dev 給安裝頁） | **不能像 Android 隨便傳檔就裝** |
| 別人下載 | 開連結安裝即可 | 幾乎一定要 **Apple Developer（年費）** |
| 給陌生人的下載點 | 預覽安裝頁／APK | **TestFlight 邀請連結**（仍是測試通道，不是上架） |
| 只給自己幾支手機 | 同上 | TestFlight，或 Ad Hoc（每台先登錄 UDID，約 100 台） |

**不是這個需求的做法：** 繼續用 **Expo Go 掃 QR**。那是開發，對方也要裝 Expo Go，沒有獨立圖示／獨立 App，也不能當公開下載點。

**「你改、他們自動變新版」** = **EAS Update（OTA）**：  
先裝好一份原生「殼」，之後多數畫面／邏輯用 `eas update` 推到 Expo；他們重開 App 會拉新 JS。  
**殼要重打、請他們再裝一次的情況：** 新原生套件、改 `app.json` plugins、權限、圖示、Splash、Expo SDK 大版。

免費／低成本現實：Android 內測最接近你要的「傳下載點」。iOS 不上商店也幾乎付年費；沒有官方管道能讓任意 iPhone 點連結就裝未上架 IPA。

### 先只給自己用（你是 iPhone）

三種，由現成 → 比較像正式 App：

| | 做法 | 電腦關掉還能開？ | 主畫面獨立圖示 | 費用 |
|---|---|---|---|---|
| **A 現在這套** | App Store 裝 **Expo Go**，同一 Wi‑Fi 用 `npm start`；外網才 `npm run start:tunnel` | tunnel 時電腦／Metro 還開著才能從外網連 | 否（進 Expo Go） | **免費**（tunnel 不另收費） |
| **B 免費但麻煩** | Mac + 線，`npx expo run:ios --device`（免費 Apple ID） | 可以一陣子 | 有 | 免費，約 **7 天**要重簽一次 |
| **C 建議之後走** | Apple Developer 年費 + EAS 打一顆裝到這支手機，之後 `eas update` | **可以** | 有（CYC ZINE） | 年費 $99 |

自己用、還在改功能：**先維持 A**。  
想不開電腦也能用、之後還能 OTA 同步：**再辦 C**，不必上架。TestFlight 也可以只加自己當測試員。

### 具體作法（之後實作照這條）

1. **帳號**
   - Expo（已有 `owner` / `projectId`）
   - Google：內測 APK 可不上 Play；簽章可用 EAS 代管 keystore
   - Apple：要給別人 iOS → 加入 [Apple Developer Program](https://developer.apple.com)
2. **`eas.json` 加 preview（internal）**  
   Android 產 APK；iOS `distribution: internal` 或走 TestFlight
3. **打殼（各平台一次起）**
   ```bash
   npx eas-cli build --profile preview --platform android
   npx eas-cli build --profile preview --platform ios
   ```
   完成後 [expo.dev](https://expo.dev) 有安裝頁／二進位。Android 把連結給對方即可。
4. **iOS 給別人**
   - **建議：** 同一顆 preview／production build 上傳 **TestFlight**，用公開或內部測試連結邀請（看起來像測試 App，不是商店上架）
   - 人很少：EAS internal + 登記裝置 UDID
5. **日常同步（不上新商店版）**
   ```bash
   npx eas-cli update --branch preview --message "說明這次改什麼"
   ```
   請對方完全關掉再開 App（有時要等幾秒）。`runtimeVersion` 要和當時那顆殼一致。
6. **請他們認的版本**  
   設定頁可之後加：更新頻道、目前 runtime／update id（除錯用）

### 這階段不做

- App Store / Play **正式上架、審核、商店頁**
- 為了分發去改網站 API

### 完成定義（之後實作時）

- [ ] `eas.json` preview（internal）
- [ ] 至少 Android preview 可從連結安裝
- [ ] 文件寫清 iOS 走 TestFlight 或裝置名單
- [ ] 示範一次 `eas update`，已安裝者重開後看到新畫面
- [ ] 註明哪些改動仍要重打 native

---

## 舊計畫對照

舊「階段 1–10 教學路線」已收斂為上表。  
錯誤處理、避免過度抽象等原則仍適用，但**主線改為產品頁面對齊**。
