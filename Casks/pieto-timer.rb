cask "pieto-timer" do
  version "2.12.0"
  sha256 "29fb97176245cf8c3a690f1d2315fdef6c19f1b83b5305dd687766d27ad51865"

  url "https://pieto.watrix.co.jp/PietoTimer-v#{version}-macOS.zip"
  name "Pieto Timer"
  desc "ビジュアル集中タイマー（カウントダウン・ポモドーロ）"
  homepage "https://pieto.watrix.co.jp/"

  app "Pieto Timer.app"

  zap trash: [
    "~/Library/Preferences/jp.watrix.PietoTimer.plist",
    "~/Library/Saved Application State/jp.watrix.PietoTimer.savedState",
  ]
end
