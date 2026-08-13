# GAS：registerPushToken（第五階段 5c）

> 用途：把 Expo Push Token 存進 Google 試算表。  
> 貼到**正式專案使用的 Google Apps Script**，不是貼進 Next.js。

## 為什麼要這支 action

```
Expo App
  → POST /api/push/register（Next.js，已完成）
  → GAS action: registerPushToken（這一課）
  → 試算表 DEVICE_PUSH_TOKENS 工作表
```

Next.js 已經會送：

```json
{
  "action": "registerPushToken",
  "userId": null,
  "expoPushToken": "ExponentPushToken[...]",
  "platform": "ios"
}
```

## 試算表：新增工作表 `DEVICE_PUSH_TOKENS`

第一列標題（照這個順序）：

| A             | B        | C      | D         | E         |
| ------------- | -------- | ------ | --------- | --------- |
| expoPushToken | platform | userId | updatedAt | createdAt |

規則：

- 以 `expoPushToken` 當唯一鍵
- 同一 token 再來 → **更新**，不要新增一列
- `userId` 可為空（未登入也能註冊）

## 貼到 GAS 的程式

假設你原本已有 `doPost(e)` 依 `action` 分派，在 switch / if 裡加上：

```js
case "registerPushToken":
  return registerPushToken_(payload);
```

並新增函式：

```js
/**
 * payload: { expoPushToken, platform, userId? }
 * 回傳: { success: true, created: boolean }
 */
function registerPushToken_(payload) {
  const token = String(payload.expoPushToken || "").trim();
  const platform = String(payload.platform || "").trim();
  const userId = payload.userId === null || payload.userId === undefined ? "" : String(payload.userId).trim();

  if (!token || token.indexOf("ExponentPushToken[") !== 0) {
    return json_({ success: false, error: "Invalid expoPushToken" });
  }
  if (platform !== "ios" && platform !== "android") {
    return json_({ success: false, error: "Invalid platform" });
  }

  const sheet = getOrCreateDevicePushTokensSheet_();
  const data = sheet.getDataRange().getValues(); // 含標題列
  const now = new Date().toISOString();

  // 從第 2 列開始找（跳過標題）
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === token) {
      // A=token 不動；更新 platform, userId, updatedAt
      sheet.getRange(i + 1, 2, 1, 3).setValues([[platform, userId, now]]);
      return json_({ success: true, created: false });
    }
  }

  // 新 token
  sheet.appendRow([token, platform, userId, now, now]);
  return json_({ success: true, created: true });
}

function getOrCreateDevicePushTokensSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("DEVICE_PUSH_TOKENS");
  if (!sheet) {
    sheet = ss.insertSheet("DEVICE_PUSH_TOKENS");
    sheet.appendRow(["expoPushToken", "platform", "userId", "updatedAt", "createdAt"]);
  }
  return sheet;
}

// 若專案裡已有 json_ helper，可刪這段
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
```

> 若你的 `doPost` 已經用別的回傳寫法（例如直接 `return ContentService...`），把 `json_()` 改成跟現有 style 一致即可。

## 部署後怎麼測

1. GAS 編輯器：**部署 → 管理部署 → 新增版本**（或更新現有 Web App 部署）
2. 確認 Next.js production 的 `GAS_URL` 指向這支 Web App
3. 手機 App（`.env` 已是 `https://cyc-zine.vercel.app`）→ 設定 → 取得並註冊 Push Token
4. 成功時綠色字應變成：
   - **Token 已註冊到後端**（第一次）
   - 或 **Token 已更新到後端**（同一 token 再按）
5. 打開試算表 `DEVICE_PUSH_TOKENS`，應看到一列

若仍顯示「尚未寫入 GAS / stub」，代表 GAS 還沒回 `{ success: true }`（沒部署新版本、action 名稱拼錯、或 `doPost` 沒接到這個 case）。

## 與收藏的差異（複習）

|              | 收藏         | Push Token         |
| ------------ | ------------ | ------------------ |
| 一定要登入？ | 是           | **否**             |
| 唯一鍵       | user + event | **expoPushToken**  |
| 存什麼       | 活動收藏     | 這台手機的推播地址 |
