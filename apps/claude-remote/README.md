# Claude Remote

iPhone（や任意のブラウザ）から、**Mac のターミナルで動いている Claude Code を操作する**ための小さな常駐サーバー + モバイル対応 Web UI です。

```
┌─────────────┐      WebSocket       ┌──────────────────────────┐
│  iPhone     │  ◀───────────────▶   │  Mac                     │
│  Safari /   │   (端末ストリーム)     │  claude-remote server     │
│  ホーム画面  │                      │   └─ tmux: claude-remote   │
│             │                      │        └─ claude (TUI)     │
└─────────────┘                      └──────────────────────────┘
```

`tmux` の共有セッションを介するので、**Mac のターミナルからも同じ Claude Code セッションを同時に見られます**（`tmux attach -t claude-remote`）。

> これは「まず動くもの」を最短で得るための **Web UI 版（フェーズ1）** です。将来的に同じ WebSocket プロトコルを使って SwiftUI ネイティブ iOS アプリ（フェーズ2）に置き換えられます。

## 必要なもの

- macOS
- [Node.js](https://nodejs.org/) 18 以上
- [Claude Code](https://claude.com/claude-code)（`claude` コマンドが PATH にある）
- `tmux`（推奨）: `brew install tmux`

## セットアップ

```bash
cd apps/claude-remote
npm install      # node-pty をビルドするため Xcode Command Line Tools が必要
npm run doctor   # 事前チェック（Node/claude/tmux/ポート/IP を確認）
npm start
```

`npm run doctor` は、必要なものが揃っているか（Node 18+, `claude`, `tmux`, ポート空き、LAN IP）を確認してレポートします。問題があれば ✗ で表示されます。

起動すると、接続用 URL と **アクセストークン** がターミナルに表示されます。

```
  Open the URL on your phone and paste this token:

      a1B2c3D4e5F6g7H8i9J0kL...
```

## 使い方（同一 Wi-Fi 内）

1. Mac で `npm start`。
2. Mac の IP アドレスを確認（システム設定 > ネットワーク、または `ipconfig getifaddr en0`）。
3. iPhone の Safari で `http://<MacのIP>:4317` を開く。
4. 表示されたトークンを貼り付けて「接続」。
5. 端末がそのまま表示され、入力・操作できます。下部の補助キー（Esc / Tab / Ctrl-C / 矢印 / ⏎）でモバイルでも操作可能。

「ホーム画面に追加」すると全画面のアプリのように使えます。

## 外出先（インターネット）からアクセスする

サーバーをそのまま公開せず、トンネル経由を推奨します。

### Tailscale（推奨）

Mac と iPhone の両方に [Tailscale](https://tailscale.com/) を入れて同じ tailnet にすると、外出先でも Mac の Tailscale IP（`100.x.y.z`）に直接アクセスできます。HTTPS で公開したい場合:

```bash
tailscale serve 4317
# 表示された https://<machine>.<tailnet>.ts.net を iPhone で開く
```

### Cloudflare Tunnel / ngrok（一時的に外部公開）

```bash
cloudflared tunnel --url http://localhost:4317
# または
ngrok http 4317
```

公開 URL を開き、トークンで認証します。**トークンが唯一の防御線**なので、URL とトークンの取り扱いに注意してください。

## プッシュ通知（Claude が入力待ちになったら通知）

Claude Code の出力が一定時間止まる＝「入力待ち（プロンプト表示・許可待ち・ターン完了）」とみなし、iPhone に **Web Push** で通知します。tmux セッションに read-only でアタッチした監視プロセスが出力の停止を検知します（`server/monitor.js`）。

### 有効化の手順

1. **HTTPS 必須**: Web Push と Service Worker は**セキュアコンテキスト（HTTPS または localhost）でのみ動作**します。平文の `http://<MacのIP>:4317`（LAN 直アクセス）では通知を有効化できません。Tailscale の `tailscale serve`（`https://...ts.net`）や Cloudflare Tunnel など **HTTPS の URL** から開いてください。
2. iOS は **16.4 以上**、かつサイトを **「ホーム画面に追加」したアプリ（PWA）から開く**こと（Safari タブのままでは Web Push 不可）。
3. アプリ上部の **🔔 通知** ボタンをタップ → 通知を許可。これで購読が登録されます。

> 端末操作だけなら HTTP の LAN アクセスで問題ありません。通知機能のみ HTTPS が前提です。`tmux` 無効（直接モード）では入力待ち検知ができないため通知も無効になります。

### 検知のしきい値

無音判定までの時間は `CLAUDE_REMOTE_IDLE_MS`（ミリ秒, 既定 `6000`）で調整できます。短すぎると思考の合間に誤通知、長すぎると反応が鈍くなります。

```bash
CLAUDE_REMOTE_IDLE_MS=8000 npm start
```

## 設定（環境変数）

| 変数 | 既定値 | 説明 |
| --- | --- | --- |
| `CLAUDE_REMOTE_PORT` | `4317` | 待ち受けポート |
| `CLAUDE_REMOTE_HOST` | `0.0.0.0` | 待ち受けアドレス |
| `CLAUDE_REMOTE_TOKEN` | 自動生成 | アクセストークン（未指定なら `~/.claude-remote/token` に保存） |
| `CLAUDE_REMOTE_SESSION` | `claude-remote` | tmux セッション名 |
| `CLAUDE_REMOTE_CMD` | `claude` | 起動するコマンド |
| `CLAUDE_REMOTE_TMUX` | 自動検出 | `0` で tmux を使わず直接起動 |
| `CLAUDE_REMOTE_CWD` | 起動ディレクトリ | Claude Code の作業ディレクトリ |
| `CLAUDE_REMOTE_IDLE_MS` | `6000` | 入力待ち通知を出すまでの無音時間(ms) |

例:

```bash
CLAUDE_REMOTE_CWD=~/projects/myapp CLAUDE_REMOTE_PORT=8080 npm start
```

## 仕組み

- `server/index.js` — 静的ファイル配信 + `/ws` 端末ブリッジ + `/push/*` 通知エンドポイント。
- `server/pty.js` — `node-pty` で `tmux new-session -A -s claude-remote claude` を起動。
- `server/monitor.js` — tmux セッションに read-only アタッチし、出力停止＝入力待ちを検知。
- `server/push.js` — VAPID 鍵管理・購読保存・Web Push 送信。
- `public/` — xterm.js のモバイル Web UI（`sw.js` がプッシュ受信、`manifest.webmanifest` で PWA 化）。

WebSocket メッセージ（JSON）:

| 向き | type | 内容 |
| --- | --- | --- |
| client → server | `input` | `{ data }` キー入力 |
| client → server | `resize` | `{ cols, rows }` 端末サイズ |
| server → client | `output` | `{ data }` 端末出力（エスケープシーケンス込み） |
| server → client | `exit` | `{ code }` セッション終了 |

HTTP エンドポイント:

| メソッド | パス | 用途 |
| --- | --- | --- |
| GET | `/healthz` | 稼働状況（tmux・購読数） |
| GET | `/push/vapid-public-key` | VAPID 公開鍵 + 通知可否 |
| POST | `/push/subscribe` | プッシュ購読登録（要トークン） |
| POST | `/push/unsubscribe` | 購読解除（要トークン） |

## セキュリティ上の注意

- 認証は単一トークンのみ。**実質的に Mac のシェルを操作できる**ため、トークンは厳重に管理してください。
- LAN 外へ出す場合は必ずトンネル（Tailscale / Cloudflare）を使い、平文 HTTP を直接インターネットに晒さないでください。
- トークンを失効させたい場合は `~/.claude-remote/token` を削除（または `CLAUDE_REMOTE_TOKEN` を変更）して再起動。

## ロードマップ

- [x] フェーズ1: Mac サーバー + モバイル Web UI
- [x] 入力待ちプッシュ通知（Web Push / PWA）
- [x] 事前チェック `npm run doctor`
- [ ] フェーズ2: SwiftUI ネイティブ iOS アプリ（同じ `/ws` プロトコルを利用）
- [ ] 複数プロジェクト/セッションの切り替え
