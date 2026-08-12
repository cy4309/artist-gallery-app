# CYC ZINE — Expo + React Native App 開發任務

> 最後更新：2026-08-12  
> 用途：記錄開發計畫、階段進度與學習重點，供之後追蹤與回顧。  
> 複習筆記：[`EXPO-LEARNING-NOTES.md`](./EXPO-LEARNING-NOTES.md)

---

## 進度總覽

| 階段 | 名稱 | 狀態 |
|------|------|------|
| 1 | 建立 Expo App | ✅ 完成 |
| 2 | API 共用 | ✅ 完成 |
| 3 | 建立基本 App UI | ✅ 完成 |
| 4 | Navigation | ✅ 完成 |
| 5 | Push Notification | 🔄 進行中（5a ✅ · 5b App→Next.js ✅ · GAS 尚未寫入） |
| 6 | 不做 Offline Database（原則） | — |
| 7 | 環境變數 | ✅ 完成 |
| 8 | 錯誤處理 | ⬜ 未開始 |
| 9 | 教學＋實作方式 | — |
| 10 | 避免過度抽象（原則） | — |

**狀態圖例：** ⬜ 未開始 · 🔄 進行中 · ✅ 完成

**第一個里程碑：**

> 我可以用 Expo Go 在自己的手機上跑一個真正的 React Native CYC ZINE App，而且它可以透過現有 Next.js API 取得活動資料。

---

## 目標

我要學習 Expo + React Native，並將目前的 CYC ZINE 網站延伸成真正的 Mobile App。

**請不要使用 WebView 包裝現有網站。**

---

## 現有 Web 專案

| 項目 | 說明 |
|------|------|
| Web | Next.js + React + TypeScript + Tailwind |
| Production | https://cyc-zine.vercel.app |
| Backend API | 目前由 Next.js `/api/*` 提供 |
| 活動資料 | `/api/org` |
| 狀態 | 現有網站已經可以正常取得政府文化活動 API 資料 |

**重要原則：不要修改或重構現有 Web 專案，除非是為了提供 App 所需要的共用 API。**

---

## 第一階段：建立 Expo App

請使用目前穩定版本的 Expo + React Native + TypeScript。

目標架構：

```
Expo Go
    ↓
React Native App
    ↓
現有 Next.js API
    ↓
政府文化資料 API
```

先以 **Expo Go** 在實體手機上執行，不考慮立即上架。

---

## 第二階段：API 共用

App **不可以**直接呼叫政府 API：

```
❌ Expo → cloud.culture.tw
```

而是：

```
✅ Expo → https://cyc-zine.vercel.app/api/org
```

**原因：**

- 避免 Mobile App CORS 問題
- Web / App 共用同一個 backend
- 政府 API 未來更換時，只需要修改 Web backend
- 可以集中處理 cache、timeout、錯誤處理

### API Layer 結構

請在 Expo 專案建立清楚的 API layer，例如：

```
src/
  api/
    client.ts
    org.ts
```

**不要在 component 裡直接寫 fetch。**

例如：`getOrgData()` 由 API layer 負責取得資料。

---

## 第三階段：建立基本 App UI

先不要複製整個 Web UI。

建立最基本的 Mobile App：

### Home

顯示：

- CYC ZINE Logo / Title
- 活動入口
- Interviews 入口
- Favorites 入口

### Events

從 `GET https://cyc-zine.vercel.app/api/org` 取得活動資料。

先做到：

- Loading
- Error
- Empty state
- 活動列表
- 活動圖片
- 活動名稱
- 日期
- 地點

**先讓資料流完整跑通，再處理漂亮 UI。**

---

## 第四階段：Navigation

學習 React Navigation 或 Expo Router。

請優先使用 **Expo 官方目前推薦的 routing/navigation 方式**。

建立至少：

- Home
- Events
- Event Detail
- Interviews
- Interview Detail
- Favorites
- Settings

### Navigation 結構

```
Home
 ├── Events
 │    └── Event Detail
 │
 ├── Interviews
 │    └── Interview Detail
 │
 └── Favorites
```

---

## 第五階段：Push Notification

Push Notification 是這個專案的重要學習目標。請使用 **Expo Notifications**。

### 第一階段（App 端）

```
App
 ↓
取得 Expo Push Token
 ↓
顯示 Token
```

先不要急著建立完整 notification backend。

### 第二階段（Backend 整合）

```
Expo App
   ↓
Push Token
   ↓
Next.js API
   ↓
儲存 Token
```

未來可以讓 CYC ZINE 發送：

- 新活動通知
- 收藏活動提醒
- 活動即將開始
- 編輯推薦活動

### Push Token 資料設計

不要把 Push Token 直接硬寫在 App。

建立 API，例如：`POST /api/push/register`

**Request：**

```json
{
  "userId": "...",
  "expoPushToken": "...",
  "platform": "ios"
}
```

- 未登入使用者也必須能註冊 Push Token
- `userId` optional
- `expoPushToken` required
- `platform` required
- 避免同一個 token 重複建立

---

## 第六階段：不要一開始做 Offline Database

目前**不需要**建立 SQLite / Realm / DB 來儲存所有政府活動。

第一階段：

```
App
 ↓
Next.js API
 ↓
Government API
```

即可。

如果未來真的需要 offline：

```
API
 ↓
App local cache
 ↓
offline fallback
```

再加入 AsyncStorage / SQLite。

**不要現在就增加不必要的架構。**

---

## 第七階段：環境變數

不要把 API URL 散落在程式碼。

建立：

- `.env`
- `.env.example`

例如：

```env
EXPO_PUBLIC_API_URL=https://cyc-zine.vercel.app
```

App 使用：

```typescript
const API_URL = process.env.EXPO_PUBLIC_API_URL;
```

**注意：**

- `EXPO_PUBLIC_*` 不是 secret
- 不要把 API Secret、LINE Secret 等敏感資訊放進 Expo App
- Secret 必須留在 Next.js backend

---

## 第八階段：錯誤處理

API layer 至少要處理：

- loading
- success
- empty
- 401
- 403
- 404
- 500
- network error
- timeout

尤其是手機環境：

- Wi-Fi
- 4G / 5G
- 沒有網路
- 網路突然中斷

**不要假設網路永遠存在。**

---

## 第九階段：我是在學習，不只是要你寫完

這一點非常重要。

**請不要一次產生整個 App。**

請採用「**教學＋實作**」方式：

每完成一個階段：

1. 告訴我這個技術是做什麼
2. 說明它和 Next.js / React Web 有什麼不同
3. 解釋為什麼這樣架構
4. 再產生程式碼
5. 告訴我如何用 Expo Go 測試
6. 告訴我下一步可以學什麼

### 第一次目標範例

```
Expo project
↓
Home Screen
↓
Events Screen
↓
GET /api/org
↓
手機顯示政府活動
```

確認這一步成功後，再進入 Navigation、Push Notification。

---

## 第十階段：避免過度抽象

這是一個**學習專案**。

不要一開始加入：

- Redux
- Zustand
- React Query
- Clean Architecture
- Repository Pattern
- Dependency Injection
- Monorepo
- Native Modules

除非真的有需要。

優先讓我理解：

- React Native component
- Expo
- Navigation
- API
- State
- Effect
- Push Notification
- Mobile permission
- App lifecycle

---

## 最終學習目標

完成後我希望能理解：

```
Next.js Web
      │
      │ REST API
      ▼
Next.js Backend
      │
      ├── Government API
      ├── User API
      └── Push Notification API
             ▲
             │
      Expo React Native
             │
             ├── iOS
             └── Android
```

---

## 上架路線（目前不處理）

最後才考慮：

```
Expo Go
 ↓
Development Build
 ↓
EAS Build
 ↓
TestFlight
 ↓
App Store
```

**目前不要處理正式上架與付費帳號。**

---

## 開始方式

**請從「建立 Expo 專案」開始，一次只帶我完成一個階段。**
