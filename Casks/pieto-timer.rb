cask "pieto-timer" do
  version "1.0"
  sha256 "d41849e514a9e7753a679785e552b60f202ed0c62bc5a431d8345ac49d84df19"

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
