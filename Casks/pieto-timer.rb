cask "pieto-timer" do
  version "1.0"
  sha256 "fcef72b06b0bdae103d70cbad05f838c759251f2a78ae80ac9673001bbd6870b"

  url "https://github.com/watrix811/pieto-timer/releases/download/v#{version}/PietoTimer-v#{version}-macOS.zip"
  name "Pieto Timer"
  desc "ビジュアル集中タイマー（カウントダウン・ポモドーロ）"
  homepage "https://pieto.watrix.co.jp/"

  app "Pieto Timer/Pieto Timer.app"

  zap trash: [
    "~/Library/Preferences/jp.watrix.PietoTimer.plist",
    "~/Library/Saved Application State/jp.watrix.PietoTimer.savedState",
  ]
end
