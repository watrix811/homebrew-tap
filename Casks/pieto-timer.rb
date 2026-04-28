cask "pieto-timer" do
  version "1.0"
  sha256 "d1c7fca672ffc65271e5988589ef7ed68e3bba1667164bff7887bef21c1411ce"

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
