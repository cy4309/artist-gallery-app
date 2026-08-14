# P4 收藏／登入 — App 專用登入 API（做法 2）

> 狀態：App／Next 已落地；需 deploy 新 API，並在 LINE Login 加 Callback  
> 約束：網站既有登入與收藏流程不改；只**新增**一支 API

---

## 結論

- **收藏**：沿用 `/api/favorites/list|toggle|check|ensure`（認人仍靠 `cyc_session`）
- **網站 Google／LINE 登入頁**：不動
- **新增**：`POST /api/auth/app-login`（給 Expo 用）
- GAS user／favorites **不新增 action**

---

## 新 API

`POST https://cyc-zine.vercel.app/api/auth/app-login`

**Google**

```json
{ "provider": "google", "idToken": "<Google ID token>" }
```

後端用現有 `GOOGLE_CLIENT_ID` 驗證 `idToken`，再走跟網站相同的  
`checkGoogleUser` / `createGoogleUser` / `updateGoogleUser`。

**LINE**

App **不持有** Channel Secret。只把授權碼交給後端換 token（與現有 `/api/auth/login-line` 相同）：

```json
{
  "provider": "line",
  "code": "<authorization code>",
  "redirectUri": "<App 實際用的 callback，必須先登入 LINE Developers>"
}
```

後端驗證後走既有 `upsertLineUser`。

**成功（200）**

```json
{ "user": { "id": "google_…", "provider": "google", "name": "…", "picture": "…", "email": "…" } }
```

同時 `Set-Cookie`：`cyc_session`（httpOnly）+ `cyc_user`（與網站相同）。

App 另外把 `user` 存進 SecureStore；之後打收藏 API 帶：

```
Cookie: cyc_session=<encodeURIComponent(JSON.stringify(user))>
```

（RN 不一定會自動存網站 cookie，所以要自己帶；`getCurrentUser()` 不用改。）

**失敗**

- 400 缺欄位／provider 不對
- 401 token／code 無效
- 502 GAS 失敗

**登出**：App 清 SecureStore 即可。可選打既有 `POST /api/auth/logout`（清瀏覽器 cookie，對 App 不是重點）。

---

## 不動的東西

- `/api/auth/login`、`/api/auth/login-line`、`/auth` 頁面
- `/api/favorites/*`
- 網站 Set-Cookie 格式、GAS action

---

## App 端（同意 API 後再做）

1. 未登入進收藏／按愛心 → 登入頁（Google／LINE）
2. `expo-auth-session` 拿 Google `idToken` / LINE `code`
3. `POST /api/auth/app-login`
4. 存 user → 列表／toggle 走現有 favorites API
5. 活動卡片／詳情加收藏按鈕（未登入先去登入）

---

## 你現在要做的（不是新 LIFF）

1. 把 frontend 新增的 API 部署到 production Next（跟之前 push API 一樣自己複製過去）
   - `POST /api/auth/app-login`
   - `GET /api/auth/app-login-line`
2. LINE Developers → **同一個 Login Channel** → Callback URL 新增：
   `https://cyc-zine.vercel.app/api/auth/app-login-line`

App Google 登入走網站既有 `/api/auth/login`（不必 `EXPO_PUBLIC_GOOGLE_CLIENT_ID`）。

---

## 明確不做（本階段）

- 改網站 UI
- Google Calendar
- LIFF
- 新 GAS action
