cask "pieto-timer" do
  version "2.4.8"
  sha256 "6ec8a3b44feaf044f28cc69145b6d8322dfdc1445ad028cd3dbb9df77c537501"

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
