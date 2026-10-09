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
- `web-offline/`：離線網頁版（index.html + sw.js + manifest + icon），之前其實沒部署過；階段 3 起放在公開 repo `robinrn0419/class-pay-app`，用 GitHub Pages 發布。與 `www/index.html` 只差 PWA 設定（head 的 meta／manifest 和結尾註冊 sw.js），改 App 時要一起同步。（另一個網站 trunnionlab.com 是 `technic-studio` repo，放在 Vercel，跟這個專案無關。）sw.js 的 VERSION 目前是 `class-pay-v6`，更新網頁版時要加一。

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

## 下一步：做成 iPhone App
使用者想要：像 App 的功能（震動回饋、從左緣滑回上一頁），以及學會做 App。
決定的做法：
- **Capacitor** 把 `www/` 包成 iOS App。
- **GitHub Actions 的 macOS runner** 打包出未簽名 `.ipa`（使用者沒有 Mac）。
- **免費 Apple ID + SideStore** 安裝，手機上用「捷徑」每天自動續簽（使用者覺得 99 美元太貴、每 7 天接電腦太麻煩）。
- 之後用 SideStore「來源」功能做一鍵更新（Actions 打包完自動更新來源清單）。

階段 4 前查證（2026-10-08）：SideStore 官方說 iOS 27 已支援（issue #1566），但仍有部分使用者 iOS 27 登入失敗（#1604，未解）；27.2 Beta 沒有專門資料。官方最新是 0.7.0-alpha（0.6.4 以前登入壞掉，不能用）。電腦端官方工具改成 **iloader**（github.com/nab138/iloader），Windows 只需要 iTunes **或** Apple Devices App（Microsoft Store 版可以），不再需要 iCloud。使用者電腦已有 Apple Devices App。不要用非官方的 SideInstaller。iloader 預設 anisette 伺服器 ani.sidestore.io 登入失敗（WebSocket connection reset），在 iloader 設定改成 **StikStore** 後成功（2026-10-08）。
**階段 4 進度（2026-10-09）：課堂薪水 v1.0.2 已用 SideStore 0.7.0（Stable）裝上 iPhone，主畫面顯示「課堂薪水」。** 剩下：使用者實測震動／滑回、設定「捷徑」自動續簽。
- SideStore 0.7.0-alpha 會直接拿 CFBundleDisplayName 去註冊 App ID，中文被 Apple 拒（`appIdName` invalid）。nightly（0.7.0-20260920）修好中文名，但 iloader 放不進配對檔（SideStore issue #1611），所以退回 Stable。解法：Info.plist 的 CFBundleDisplayName 改 `ClassPay`，`ios/App/App/en.lproj` 與 `zh-Hant.lproj/InfoPlist.strings` 設成「課堂薪水」（已加進 project.pbxproj）。**使用者不接受主畫面出現英文名稱**，以後別提議改成英文。
- 換 SideStore 版本後要在 iloader「Manage Pairing File → SideStore → Place」重放配對檔（不要按 Export）。
- 驗證碼：簽名用 Apple ID 沒有受信任裝置，只能收簡訊；短時間要太多次會被 Apple 限流一天。
**階段 4 卡關點（2026-10-08，已解決）：** iloader 已把 SideStore 裝進手機，已信任開發者、開了開發者模式。SideStore 內登入時，簽名用 Apple ID 沒有任何受信任裝置，推播收不到驗證碼；改簡訊時 Apple 回「目前無法傳送驗證碼至此電話號碼，請稍後再試」（短時間要太多次驗證碼被限流）。決定：停手等約 24 小時，再只試一次（SideStore 選簡訊，或瀏覽器登入 account.apple.com 取得簡訊碼後輸入 SideStore）。注意：iPhone 設定裡的「取得驗證碼」是主帳號的碼，不適用。SideStore 7 天期限約到 2026-10-15，之前要登入續簽，否則要接電腦用 iloader 重裝。還沒做：LocalDevVPN 連線、確認 SideStore 版本 ≥0.7.0、手動續簽、加入來源、裝課堂薪水。下面「iTunes／iCloud 要用官網版」那條已過時。
已經提醒過使用者的注意事項：建議另開一個專門簽名用的 Apple ID；只從 sidestore.io、altstore.io 下載；配對檔不可外流；iOS 大改版先別急著升級；iTunes／iCloud 要用 Apple 官網版本而非 Microsoft Store 版；刪掉 App 設定會消失（計畫加「匯出／匯入設定」）。

階段（一次只做一個）：
0. 準備：Node.js、Git、VS Code
1. 建 Capacitor 專案，放入 `www/`
2. 加原生功能：@capacitor/haptics 震動；左緣滑回上一頁
3. GitHub Actions 雲端打包 `.ipa` ＋ SideStore 來源清單
4. 設定 SideStore、安裝、設定自動續簽

已決定：GitHub 帳號 `robinrn0419`；App ID `io.github.robinrn0419.classpay`（不要再改）；App 名稱「課堂薪水」；專案根目錄就是 `class-pay-app/`。

**目前進度：階段 3 完成（2026-10-08），下一步是階段 4。** 階段 3 結果：公開 repo https://github.com/robinrn0419/class-pay-app ；`.github/workflows/build.yml` 每次推 main（只改 .md 不觸發）就在 macos-latest（Xcode 26.6）不簽名編譯，版本號 1.0.<run_number>，`ClassPay.ipa` 放 Releases（tag v1.0.N）；接著把 `web-offline/` 加上 `scripts/make-source.js` 產生的 `source.json` 發布到 GitHub Pages。網頁版：https://robinrn0419.github.io/class-pay-app/ ；SideStore 來源：https://robinrn0419.github.io/class-pay-app/source.json 。App 圖示換成 icon.png 放大的 1024 版；啟動畫面改成純色 systemGroupedBackgroundColor（刪了 Capacitor 預設 Splash）。第一版 v1.0.1 已驗證：含 HapticsPlugin、Bundle ID 正確。
階段 2： 階段 2 結果：@capacitor/haptics 8.0.2，`index.html` 用 `Capacitor.Plugins.Haptics`（網頁版自動略過）；量尺 selection、按鈕 impact、結果 notification（差 5 級以上 WARNING）；左緣 16px 滑回、跟手、放開過半或快甩才返回，「對方評估」頁禁止滑回。網頁版 `web-offline/` 同步（只多 PWA 設定），sw.js 已改 `class-pay-v6`，但尚未部署到 GitHub Pages。
階段 1： 階段 1 結果：Capacitor 8.5.3（core、ios、cli），`npx cap add ios` 產生 `ios/`，原生套件用 Swift Package Manager（不用 CocoaPods）；本機 Git 已建立並完成第一筆 commit（分支 main，尚未推上 GitHub）。Git 身分：robinrn0419／321250246+robinrn0419@users.noreply.github.com。改了 `www/` 之後要跑 `npx cap sync` 才會複製進 `ios/`。
階段 0： 已安裝：Node.js v24.21.0、npm 11.19.0、Git 2.55.0、VS Code 1.132.1；PowerShell 執行原則已設為 CurrentUser RemoteSigned。 使用者的 iOS 版本：27.2 公開 Beta 版（2026-10-08 回報）。階段 4 前要先確認 SideStore 是否支援此版本。
