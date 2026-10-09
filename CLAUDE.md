# 課堂薪水 App：交接說明

這個資料夾是「課堂薪水」計算工具。之前在 Claude 一般對話裡做出網頁版，現在要在 Claude Code 裡把它做成 iPhone App。

## 使用者
- 用繁體中文溝通。
- 教理工類課程（寫程式、3D 建模、畫 PCB），一堂課通常 1–3 人。
- 電腦是 Windows，手機是 iPhone。有 GitHub 帳號，用過 GitHub Pages。程式還在學。
- 遇到不確定的地方要先問，不要自行假設。先用好問題釐清，再一起定行動計畫。
- **學習方式：一步一步帶他自己做。** 每一步解釋在做什麼、為什麼，讓他在自己電腦上操作；一次只給一個階段，他確認成功再往下。

## 資料夾內容
- `www/index.html`：目前最新的完整 App（單一 HTML 檔，沒有外部依賴，系統字體，可離線）。
- `www/icon.png`：App 圖示（512×512）。
- `web-offline/`：離線網頁版（index.html + sw.js + manifest + icon），之前其實沒部署過；階段 3 起放在公開 repo `robinrn0419/class-pay-app`，用 GitHub Pages 發布。與 `www/index.html` 只差 PWA 設定（head 的 meta／manifest 和結尾註冊 sw.js），改 App 時要一起同步。（另一個網站 trunnionlab.com 是 `technic-studio` repo，放在 Vercel，跟這個專案無關。）sw.js 的 VERSION 目前是 `class-pay-v11`，更新網頁版時要加一。

## App 現在的功能
四步流程：選內容 → 我評估 → 對方評估（看不到我的答案）→ 結果。
- 難易度 15 級，每 3 級一個名稱：入門、基礎、進階、深入、專精。
- 對方只填一個綜合難易度，與我的取平均；相差 5 級以上會提醒。
- 介面：iPhone 內建 App 風格（固定標題列與返回鍵、底部固定主按鈕、分組卡片），每種內容有自己的顏色與圖示（教學橘、寫程式藍紫、3D 建模青、畫 PCB 綠），有回饋動畫，支援深色模式。
- 設定存在 localStorage（key：`class-pay-settings-v3`），全部價格參數都能在「設定」裡改。

## 計價公式（都已用使用者的實際案例校正過，改之前先問）
- **教學**：`(基本費 100 + R(L) × 人數加成 × 折算時數) × 長期折扣`
  - R(L) = 200 × 3^((L−1)/14)，1 級 200、15 級 600 元／時
  - 人數加成 = 1 + 0.18 × log2(人數)（人數每加倍加 18%）
  - 折算時數 = 時數^log2(1.6)（時數每加倍價格 × 1.6）
  - 長期方案：滿 5 堂 95%、10 堂 90%、20 堂 85%
  - 校正案例：7 小時、11 人、4 級、長期 6 堂 → 實際 1,500（算出 1,555）；0.5 小時、2 人、5 級 → 希望約 300（算出 302）
- **寫程式**（買斷，範圍 200–3,000）：`200 + 2800 × (0.8 × (1 − (1 − (L−1)/14)^1.4) + 0.2 × √t)`，t = (天數 − 14) / 46，限制在 0–1
  - 校正案例：12 級、30 天 → 使用者希望約 2,500（算出 2,511）
- **3D 建模**（買斷）：300 × (2000/300)^((L−1)/14)
- **畫 PCB**：我填選購、原理圖、PCB 設計三項，權重 50/25/25 合成綜合評分；價格 200 × 25^((L−1)/14)，範圍 200–5,000
- **單個買**（寫程式、3D 建模）：單價 = 買斷價 × 20%，滿 10 個再 × 80%、滿 30 個 × 60%；大數字顯示「一個的價格」，下方列合計

## iPhone App（四個階段全部完成，2026-10-09）
目前狀態：課堂薪水已用 SideStore 裝在使用者的 iPhone（iOS 27.2 公開 Beta），主畫面顯示「課堂薪水」，「捷徑」每天晚上自動續簽。最新版 v1.0.3。

已決定（不要再改）：GitHub 帳號 `robinrn0419`；App ID `io.github.robinrn0419.classpay`；主畫面名稱「課堂薪水」（**使用者不接受主畫面出現英文名稱**，別提議改英文）；專案根目錄就是 `class-pay-app/`。

### 架構
- **Capacitor 8.5.3**（core、ios、cli）+ **@capacitor/haptics 8.0.2**，原生套件用 Swift Package Manager（沒有 CocoaPods）。改了 `www/` 要 `npx cap sync`。
- **名稱**：Info.plist 的 CFBundleDisplayName 是 `ClassPay`（SideStore 0.7.0 拿它向 Apple 註冊 App ID，只收英數字），`ios/App/App/en.lproj`、`zh-Hant.lproj/InfoPlist.strings` 把主畫面名稱設成「課堂薪水」。
- **圖示**：icon.png 放大成 1024 版；啟動畫面是純色 systemGroupedBackgroundColor。
- **雲端打包**：`.github/workflows/build.yml`，每次推 main（只改 .md 不觸發）→ macos-latest（Xcode 26.6）不簽名編譯，版本 1.0.<run_number> → `ClassPay.ipa` 放 Releases（tag v1.0.N）→ `web-offline/` + `scripts/make-source.js` 產生的 `source.json` 發布到 GitHub Pages。
- 網址：repo https://github.com/robinrn0419/class-pay-app ；網頁版 https://robinrn0419.github.io/class-pay-app/ ；SideStore 來源 https://robinrn0419.github.io/class-pay-app/source.json
- Git 身分：robinrn0419／321250246+robinrn0419@users.noreply.github.com

### index.html 的原生手感（www 和 web-offline 都有）
- 震動走 `Capacitor.Plugins.Haptics`，網頁版自動略過。量尺按下／換級 selection；加減鈕、開關、分段、選內容、返回 impact LIGHT；交給對方 MEDIUM；結果：差不到 5 級 notification SUCCESS，差 5 級以上 `buzz.alarm()` 重重三下（HEAVY ×3，間隔 150ms，使用者說原本 WARNING 和 SUCCESS 分不出來）。
- **紀錄**（2026-10-09 加）：每次算出金額自動存（localStorage key `class-pay-records-v1`，最多 500 筆）；結果頁有「不存入紀錄」↔「改回存入紀錄」；在結果頁按「修改」再算會更新同一筆（`recId`），選新內容或「再算一筆」才開新的一輪。首頁右下角浮動「紀錄」按鈕 → 第 5 頁：最上面當月合計（單個買算單價×數量，教學算這一堂），下面是清單（最新在上），右上「編輯」可刪單筆，也可以往左滑刪除（滑一點露出「刪除」鈕，滑過一半震一下、放開直接刪；使用者要求兩種都保留）。不加備註（使用者決定）。
- 左緣 16px 滑回：跟手、放開過半或快甩才返回（手指停住超過 100ms 不算快甩）；「對方評估」頁禁止滑回（怕對方看到我的答案）。

### 更新 App 的流程
1. 改 `www/index.html`，同步到 `web-offline/index.html`（只差 PWA 的 head meta／manifest 和結尾註冊 sw.js），`web-offline/sw.js` 的 VERSION 加一（目前 `class-pay-v11`）。
2. `npx cap sync` → commit → push，約 2 分鐘後雲端產生新版。
3. 手機：LocalDevVPN 連線 → SideStore Sources 下拉重新整理 → My Apps 按 UPDATE（設定會保留）。

### SideStore 的坑（2026-10 實測）
- 用 **SideStore 0.7.0（Stable）**。nightly（0.7.0-20260920）修好中文名稱，但 iloader 放不進配對檔（issue #1611），所以不用。
- 電腦端用 **iloader**（github.com/nab138/iloader），Windows 只需要 Apple Devices App（使用者已有）。iloader 的 anisette 伺服器要選 **StikStore**（預設的 ani.sidestore.io 會 WebSocket 斷線）。換 SideStore 版本後要「Manage Pairing File → SideStore → Place」重放配對檔，**不要按 Export**。
- 簽名用 Apple ID 是另開的，沒有受信任裝置，驗證碼只能收簡訊；短時間要太多次會被 Apple 限流約一天。iPhone 設定裡的「取得驗證碼」是主帳號的，不適用。
- 自動續簽捷徑「續簽 App」：設定 VPN 連線 LocalDevVPN → 等待 3 秒 → SideStore「Refresh All Apps」；自動化每天 21:00、立即執行、不通知。iOS 27 捷徑若出現 ADI error -45061：SideStore → Settings → User Customizations → Reset adi.db。
- 不要用非官方的 SideInstaller。
- 7 天沒續簽 App 會打不開；真的過期就接電腦用 iloader 重裝 SideStore。

### 提醒過使用者的事
簽名用另一個 Apple ID；SideStore 相關只從官方來源下載；配對檔不可外流；iOS 大改版先別急著升級（先確認 SideStore 支援）；刪掉 App 設定會消失（使用者 2026-10-09 決定**不要**「匯出／匯入設定」功能，不要再提議）。

### 之後可以做的
- 使用者想調整手感時（震動強弱、滑回距離）直接改 index.html 的 `buzz` 和 `EDGE`／`go` 判斷。
