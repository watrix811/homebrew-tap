# WATRIX Homebrew Tap

WATRIX合同会社が公開する Homebrew パッケージのタップ。

## Usage

```bash
brew tap watrix811/tap
brew install --cask pieto-timer
```

## Available Casks

- **pieto-timer** — ビジュアル集中タイマー（カウントダウン・ポモドーロ）。[公式サイト](https://pieto.watrix.co.jp/)
- **raikiri-viewer** — コミック・電子書籍ビューア（CBZ / CBR / EPUB / PDF / MOBI）。[公式サイト](https://raikiri.watrix.co.jp/)

### raikiri-viewer について

配布経路が Mac App Store 一本のため、この Cask は DMG を配らず `mas` に App Store から
入れさせる。あらかじめ **自分の Apple Account でこのアプリを「入手」しておく必要がある**
（未入手だと `mas` が `Not purchased` を返して失敗する）。

```bash
brew install mas
brew install --cask raikiri-viewer
```

## License

Each package retains its original license. The tap repository itself is licensed under [MIT](LICENSE).
