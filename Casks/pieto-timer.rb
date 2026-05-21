cask "pieto-timer" do
  version "2.3"
  sha256 "253fd1185aa67fa139b516a3752984f1ce90a930b3a8361e8c70f27e9ba31a80"

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
