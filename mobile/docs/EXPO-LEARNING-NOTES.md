# Expo / React Native 學習筆記

> 對應計畫：`CYC-ZINE-EXPO-DEVELOPMENT.md`  
> 最後更新：2026-08-12  
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
| 入口 | `app/` 檔案路由 | `index.ts` → `App.tsx` |
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
| 頁面切換靠網址 | 現在靠 `useState` | 還不是正式路由（階段 4 才學） |

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

**對應檔案：** `mobile/App.tsx`、`mobile/index.ts`、`mobile/app.json`

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

## 階段 3：基本 App UI 🔄

**學什麼：** 把「83 筆」變成可捲動列表。Home 是入口；Events 才真正顯示資料。

### 畫面怎麼切（暫時）

現在 **還沒裝** Expo Router。`App.tsx` 用 state 決定要顯示哪個畫面：

```ts
type Screen = 'home' | 'events';
```

| Next.js | 現在的 App | 之後（階段 4） |
|---|---|---|
| `/`、`/events` 是網址 | `screen === 'home'` | Expo Router 檔案路由 |

這不是正式 Navigation，只是先搞懂：**一個 Screen = 一個元件**。

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
| `App.tsx` | 用 state 切 Home / Events |

**複習口訣：** 相對路徑只存在「有網站 origin」的世界。手機上 API 和遠端圖片都要絕對 URL。

---

## 階段 4：Navigation ⬜ 之後

預計學：Expo Router（官方建議）取代現在的 `useState` 切畫面。

| Next.js App Router | Expo Router（預計） |
|---|---|
| `app/page.tsx` → `/` | `app/index.tsx` → Home |
| `app/events/page.tsx` → `/events` | `app/events.tsx` → Events |
| `useRouter().push()` | `router.push()` |

目標結構：Home → Events → Event Detail。

---

## 階段 5：Push Notification ⬜ 之後

預計學：Expo Notifications、Push Token。Token 要存到 Next API，不要寫死在 App。

---

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
