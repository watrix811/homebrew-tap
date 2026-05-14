cask "pieto-timer" do
  version "2.0"
  sha256 "d254dc6383d5b8fde42a426b5854e16e65d65e0d87d74920cad66eb9702ebcf5"

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
