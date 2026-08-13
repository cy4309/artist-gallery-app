# Expo / React Native 學習筆記

> 對應計畫：`CYC-ZINE-EXPO-DEVELOPMENT.md`  
> 最後更新：2026-08-12（第五階段 App 端取得 Token ✅）  
> 用途：日後複習。每完成一個階段就回來對一次表。

---

## 怎麼用這份文件

1. 先看 **總表**：Next.js 習慣 vs 手機 App 習慣。
2. 再看 **該階段筆記**：當時為什麼這樣寫、對應哪個檔案。
3. 標成「之後」的階段，等實作完再補細節。

---

## 總表：Next.js vs Expo / React Native

### 執行環境

| | Next.js Web | Expo App |
|---|---|---|
| 跑在哪 | 瀏覽器 | 手機原生（目前用 Expo Go） |
| 入口 | `app/` 檔案路由 | `expo-router/entry` → `app/_layout.tsx` |
| 能不能包網站 | — | **不要用 WebView**，要真的 RN 畫面 |

### 路徑（最容易踩坑）

| 情境 | Next.js | Expo / RN | 記住 |
|---|---|---|---|
| 打 API | `fetch('/api/org')` 可以 | **不行** | 手機沒有網站 origin，要完整 URL |
| 遠端圖片 | `<img src="/xxx">` 可以 | **不行** | `Image` 的 `uri` 必須是 `https://...` |
| 專案內圖片 | `public/images/a.png` → `/images/a.png` | `require('./assets/icon.png')` | 本地圖用 `require`，不是 `/assets/...` |
| import 元件 | 常用 `@/components/...` | 這專案用 `../components/...` | 尚未設 `@/` alias |

正確 API：

```ts
// ❌ 像 Next 一樣寫相對路徑
fetch('/api/org')

// ✅ 絕對路徑 = env 的 origin + path
fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/org`)
// 實際：https://cyc-zine.vercel.app/api/org
```

正確遠端圖片：

```ts
// ❌
<Image source={{ uri: '/frontsite/xxx.jpg' }} />

// ✅ 完整 https URL（本專案再經 Next image-proxy）
<Image source={{ uri: 'https://cyc-zine.vercel.app/api/image-proxy?url=...' }} />
```

### UI 元件

| Next.js | React Native | 差在哪 |
|---|---|---|
| `div` | `View` | 沒有 HTML |
| `span` / `p` / `h1` | `Text` | **所有文字都要包在 `Text` 裡** |
| `img` | `Image` | 遠端圖要 `source={{ uri }}`，且要設寬高 |
| `button` | `Pressable` | 用 `onPress`，不是 `onClick` |
| `className` + Tailwind | `StyleSheet.create` | 沒有 CSS 檔、沒有 class |
| 滾動長列表 `map()` | `FlatList` | 只渲染看得到的列，83 筆才不會卡 |
| 頁面切換靠網址 | `router.push()` / `router.back()` | Expo Router 檔案路由（階段 4） |

### 資料與設定

| | Next.js | Expo |
|---|---|---|
| 公開環境變數 | `NEXT_PUBLIC_*` | `EXPO_PUBLIC_*` |
| 改 `.env` 之後 | 重啟 `next dev` | **重啟 `expo start`**，熱更新不夠 |
| Secret | 可放 server / Route Handler | **不能放進 App**，留在 Next backend |
| CORS | 瀏覽器會擋跨網域 | 原生 `fetch` 通常沒有 CORS；仍走 Next API 是為了共用後端 |

---

## 階段 1：建立 Expo App ✅

**學什麼：** Expo 是工具鏈，React Native 是 UI。Expo Go 讓你用手機掃 QR 就跑 App，先不上架。

| | Next.js | Expo |
|---|---|---|
| 開發指令 | `npm run dev` | `npx expo start` |
| 預覽 | 瀏覽器 | Expo Go 掃 QR |
| 專案設定 | `next.config` | `app.json` |
| 根元件 | `app/layout.tsx` | `App.tsx` |

**架構（目前）：**

```
Expo Go（手機）
  → React Native App
    → Next.js API（cyc-zine.vercel.app）
      → 政府文化資料 API
```

**對應檔案：** `app/_layout.tsx`、`app.json`、`package.json`（`main: expo-router/entry`）

**複習口訣：** 不是把網站塞進 WebView；是重新用 RN 畫一套 UI，資料打同一組 API。

---

## 階段 2：API 共用 ✅

**學什麼：** App **不要**直接打 `cloud.culture.tw`。一律打現有 Next.js `/api/org`。

| | Next.js 前端 | Expo App |
|---|---|---|
| 呼叫方式 | `fetch('/api/org')` | `apiGet('/api/org')` → 自動補上絕對 URL |
| 寫在哪 | 有時直接寫在 page | **不要寫在畫面裡**，放 `src/api/` |
| 失敗時 | 瀏覽器 Network 面板 | 手機沒有 DevTools 那麼直覺，要自己處理 error |

**為什麼：**

- Web / App 共用同一個 backend
- 政府 API 換了，只改 Next
- cache、timeout、錯誤集中處理

**對應檔案：**

| 檔案 | 職責 |
|---|---|
| `src/api/client.ts` | 通用 `fetch`、timeout、HTTP error |
| `src/api/org.ts` | `getOrgData()` |
| `src/api/errors.ts` | `ApiError` |
| `src/types/orgEvent.ts` | 活動資料型別 |

**複習口訣：** 畫面只呼叫 `getOrgData()`，不要自己 `fetch`。

---

## 階段 7：環境變數 ✅

（計畫編號是 7，但實作上跟 API 一起做。）

| | Next.js | Expo |
|---|---|---|
| 變數名 | `NEXT_PUBLIC_API_URL` | `EXPO_PUBLIC_API_URL` |
| 讀法 | `process.env.NEXT_PUBLIC_*` | `process.env.EXPO_PUBLIC_*` |
| 能藏 Secret？ | server 可以 | **不行**，`EXPO_PUBLIC_*` 會打進 App |

```env
EXPO_PUBLIC_API_URL=https://cyc-zine.vercel.app
```

**對應檔案：** `.env`、`.env.example`、`src/config/env.ts`

**複習口訣：** 改 `.env` 一定要重開 Expo。LINE Secret 等敏感值只留在 Next。

---

## 階段 3：基本 App UI ✅

**學什麼：** 把「83 筆」變成可捲動列表。Home 是入口；Events 才真正顯示資料。

### 列表

| Next.js | React Native |
|---|---|
| `items.map(...)` | `FlatList` + `renderItem` + `keyExtractor` |
| CSS `overflow: auto` | `FlatList` 自己會滾 |

83 筆用 `map()` 一次全畫會卡；`FlatList` 只畫附近幾張。

### 圖片

| Next.js | React Native |
|---|---|
| `<img src={url} className="w-full h-40 object-cover" />` | `<Image source={{ uri }} style={{ width:'100%', height:160 }} resizeMode="cover" />` |
| 相對路徑 `/images/a.png` 可用 | **必須完整 https URL** |
| 沒圖可用 `public` 裡的 placeholder | 沒圖就畫一個灰色 `View` |

政府圖常是相對路徑（`/frontsite/...`），瀏覽器可以靠網站 origin 補；手機不行。本專案做法：

```
相對路徑
  → 補成 https://cloud.culture.tw/...
    → 再經 Next `/api/image-proxy?url=...`
      → Image source={{ uri: 完整網址 }}
```

**對應檔案：** `src/utils/eventImage.ts`

### 其他 UI 差異

| 需求 | Next.js | RN |
|---|---|---|
| 載入中 | 自己做 spinner | `ActivityIndicator` |
| 文字省略 | `line-clamp-2` | `numberOfLines={2}` |
| 點擊回饋 | CSS hover | `Pressable` 的 `pressed` |
| 安全區域（瀏海） | 通常不管 | `SafeAreaView` 避開劉海 / 動態島 |
| 還沒做的入口 | 可以先放連結 | `Alert.alert('之後再接')` |

**對應檔案：**

| 檔案 | 職責 |
|---|---|
| `src/screens/HomeScreen.tsx` | 標題 + 三個入口 |
| `src/screens/EventsScreen.tsx` | loading / error / empty / 列表 |
| `src/components/EventCard.tsx` | 圖、名稱、日期、地點 |
| `src/utils/formatDate.ts` | 日期顯示 |

**複習口訣：** 相對路徑只存在「有網站 origin」的世界。手機上 API 和遠端圖片都要絕對 URL。

---

## 階段 4：Navigation ✅

**學什麼：** 用 **Expo Router** 取代 `useState` 切畫面。概念跟 Next.js App Router 很像：檔案 = 路由。

| Next.js App Router | Expo Router |
|---|---|
| `app/page.tsx` → `/` | `app/index.tsx` → `/` |
| `app/events/page.tsx` → `/events` | `app/events/index.tsx` → `/events` |
| `app/events/[id]/page.tsx` → `/events/123` | `app/events/[id].tsx` → `/events/123` |
| `useRouter().push('/events')` | `router.push('/events')` |
| `router.back()` | `router.back()` |
| `useParams()` | `useLocalSearchParams()` |
| `app/layout.tsx` | `app/_layout.tsx` |

**跟第三階段的差別：**

| 第三階段（暫時） | 第四階段（正式） |
|---|---|
| `App.tsx` 用 `useState` 切畫面 | `app/` 資料夾，檔案即路由 |
| `onOpenEvents()` callback 傳下去 | `router.push('/events')` |
| `onBack()` callback | `router.back()` |
| 沒有網址概念 | 每個畫面有路徑，例如 `/events/123` |

**目前路由結構：**

```
app/
  _layout.tsx        ← Stack 導航 + 通知 handler
  index.tsx          ← Home /
  events/
    index.tsx        ← /events
    [id].tsx         ← /events/123
  interviews/
    index.tsx        ← /interviews（placeholder）
    [id].tsx         ← /interviews/1
  favorites.tsx      ← /favorites（placeholder）
  settings.tsx       ← /settings（Push Token）
```

**畫面邏輯仍放 `src/screens/`**，`app/` 裡的檔案只做「路由入口」。這樣 UI 和路由分開，比較好維護。

**導航 API：**

```ts
import { router } from 'expo-router';

router.push('/events');           // 前往活動列表
router.push(`/events/${actId}`); // 前往活動詳情
router.back();                    // 返回上一頁
```

**讀路由參數（詳情頁）：**

```ts
import { useLocalSearchParams } from 'expo-router';

const { id } = useLocalSearchParams<{ id: string }>();
```

**對應檔案：**

| 檔案 | 職責 |
|---|---|
| `app/_layout.tsx` | Stack 導航、SafeAreaProvider |
| `app/index.tsx` | Home 路由 |
| `app/events/index.tsx` | Events 路由 |
| `app/events/[id].tsx` | Event Detail 路由 |
| `src/screens/EventDetailScreen.tsx` | 活動詳情畫面 |

**複習口訣：** Expo Router = Next.js 的檔案路由，搬到手機上。`router.push` 取代 callback，`router.back` 取代自己寫返回。

| `app/interviews/`、`app/favorites.tsx` | placeholder 頁 |
| `app/settings.tsx` | 設定 / Push |
| `src/screens/EventDetailScreen.tsx` | 活動詳情畫面 |

**複習口訣：** Expo Router = Next.js 的檔案路由，搬到手機上。`router.push` 取代 callback，`router.back` 取代自己寫返回。

---

## 階段 5：Push Notification

### 5a App 端取得 Token ✅

**學什麼：** 手機 App 要收到推播，需要先向 Expo 註冊，取得 **Expo Push Token**。這串 token 就像這台手機的「推播地址」。

| Next.js Web | Expo App |
|---|---|
| 瀏覽器 Web Push（不同機制） | Expo Push Token |
| Service Worker | `expo-notifications` |
| 後端直接打 FCM / APNs | 先打 Expo Push API（之後階段） |

**已完成流程：**

```
App → 請求通知權限 → 取得 Expo Push Token → 顯示在設定頁
```

**流程步驟：**

1. `Device.isDevice` — 模擬器拿不到 token，要實體手機
2. `requestPermissionsAsync()` — 跳出系統通知權限
3. `getExpoPushTokenAsync({ projectId })` — 需要 EAS `projectId`（`npx eas-cli init`）
4. 把 token 顯示在 Settings 畫面

**EAS 初始化（常見錯誤）：**

```powershell
# ❌ 會失敗
npx eas init

# ✅ 正確
npx eas-cli init
```

**對應檔案：**

| 檔案 | 職責 |
|---|---|
| `src/notifications/registerForPush.ts` | 權限 + 取 token |
| `src/screens/SettingsScreen.tsx` | 顯示 token |
| `app/settings.tsx` | 設定頁路由 |
| `app/_layout.tsx` | 前景通知 handler |
| `app.json` → `extra.eas.projectId` | EAS 專案 ID |

**複習口訣：** Push Token 是手機的推播地址；先在 App 拿到並顯示。

### 5b Backend 整合 ✅（App → Next.js）

**學什麼：** Token 不能只留在手機上。要 POST 到 Next.js，後端才能記住「推播要發給誰」。

| Next.js | Expo App |
|---|---|
| `Route Handler` 收 POST | `apiPost('/api/push/register', body)` |
| 可從 cookie 知道登入 user | `userId` optional；未登入也能註冊 |
| 轉送 GAS 儲存 | App 不直接碰 GAS |

**已完成流程：**

```
Settings 按鈕
  → 取得 Expo Push Token
  → POST https://cyc-zine.vercel.app/api/push/register
  → Next.js 驗證 token / platform
  → 目前回 stub: true（GAS 尚未支援 registerPushToken）
```

綠色字「尚未寫入 GAS」= **API 有收到**，只是還沒存進試算表。這不是失敗。

**Request body：**

```json
{
  "userId": "可選",
  "expoPushToken": "ExponentPushToken[...]",
  "platform": "ios"
}
```

**對應檔案：**

| 位置 | 檔案 |
|---|---|
| App | `src/api/push.ts`、`src/api/client.ts`（`apiPost`） |
| App | `src/screens/SettingsScreen.tsx` |
| Next.js | `app/api/push/register/route.ts` |
| Next.js | `src/types/push/register.ts` |
| Next.js | `src/types/gas/actionConstants.ts`（`REGISTER_PUSH_TOKEN`） |

**本機 vs production：**

| App 打誰 | 同一 Wi-Fi？ |
|---|---|
| `http://192.168.x.x:3000`（本機） | 要 |
| `https://cyc-zine.vercel.app` | 不要 |

手機上不要用 `localhost`（那是手機自己）。改 `.env` 後要重開 Expo。

**複習口訣：** 取 token 是 App 的事；收 token 是 Next.js 的事；真正存檔是 GAS 的事。

### 5c 寫入 GAS ✅

**學什麼：** Next.js 只是「門口」；真正記住 Token 的地方，在 **Google Apps Script + 試算表 `DEVICE_PUSH_TOKENS`**。

| 存哪 | 結果 |
|---|---|
| 只存在手機畫面 | 關掉 App / 換機就沒了 |
| 存在 GAS | 後端之後可讀出 Token 推播 |

Token 格式：`ExponentPushToken[...]`（Expo Push 固定此前綴）。

**複習口訣：** App 取 Token → Next 收 Token → GAS 存 Token。

### 5d 發送測試推播 🔄

**學什麼：** 存 Token 的目的是能推。後端呼叫 **Expo Push API**，不是 App 自己推給自己。

```
Settings「傳送測試推播」
  → POST /api/push/send（Next.js）
  → https://exp.host/--/api/v2/push/send
  → 手機收到通知
```

| Next.js / 後端 | 不要 |
|---|---|
| 用 Token 當 `to` 發給 Expo | App 直接依賴前端偷偷推（架構上仍應走後端） |

**對應檔案：**

| 位置 | 檔案 |
|---|---|
| Next.js | `app/api/push/send/route.ts`（需 deploy） |
| App | `src/api/push.ts` → `sendTestPush()` |
| App | `SettingsScreen`「傳送測試推播」按鈕 |

**測試技巧：** 前景有時不明顯，可先把 App 切到背景再按（或按完立刻切背景）。

## 階段 6：不做 Offline DB（原則）

現在：`App → Next API → 政府 API` 就夠。不要先上 SQLite / Realm。

---

## 階段 8：錯誤處理 ⬜ 之後

Events 已有 loading / error / empty / 重試。之後再補 401、403、404、500、斷網、timeout 的完整對照。

手機要假設：Wi-Fi、4G、沒網路、中途斷線都可能發生。

---

## 階段 9–10：學習方式（原則）

- 一次只做一個階段，不要一次生出整個 App。
- 先不要 Redux、Zustand、React Query、Clean Architecture。
- 先搞懂：Component、StyleSheet、state、effect、API、之後才是 Navigation / Push。

---

## 快速除錯

| 現象 | 先查 |
|---|---|
| `fetch('/api/org')` 失敗 | 是不是寫成相對路徑了 |
| 圖片全是「無圖片」 | `uri` 是不是完整 `https://` |
| 改 `.env` 沒生效 | 有沒有重開 `expo start` |
| 列表很卡 | 是不是用 `map()` 而不是 `FlatList` |
| 文字爆紅 / 不顯示 | 是不是忘了包 `Text` |
| 畫面被瀏海擋住 | 最外層有沒有 `SafeAreaView` |
| `npx eas init` 失敗 | 要用 `npx eas-cli init` |
| Push Token 找不到 projectId | 先跑 `npx eas-cli init`，重開 Expo |
| Token 有但後端 404 | production 還沒這支 API；先本機測或 deploy |
| Token 註冊 timeout 但 Sheet 有更新 | GAS 慢；寫入已成功，只是 App 先放棄等待。註冊逾時已改 45s |
| GAS 貼完仍 stub | action 名稱是否 `registerPushToken`；Web App 是否部署新版本 |
| Expo 打 `localhost` 失敗 | 改成電腦 LAN IP，例如 `http://192.168.1.23:3000` |
