cask "tsubame" do
  version "0.13.0"
  sha256 "7d314f972fe1ae2e77bf0a4ad8676f5cae7140f0c599d86d91ea9f6c365aa6cd"

  url "https://github.com/watrix811/homebrew-tap/releases/download/tsubame-v#{version}/Tsubame-v#{version}-macOS.zip"
  name "Tsubame"
  desc "Terminal-style desktop app with an animated office of working characters"
  homepage "https://tsubame.watrix.co.jp"

  depends_on macos: ">= :big_sur"

  app "Tsubame.app"

  zap trash: [
    "~/Library/Application Support/jp.watrix.tsubame",
    "~/Library/Caches/jp.watrix.tsubame",
    "~/Library/Logs/jp.watrix.tsubame",
    "~/Library/Preferences/jp.watrix.tsubame.plist",
    "~/Library/Saved Application State/jp.watrix.tsubame.savedState",
    "~/Library/WebKit/jp.watrix.tsubame",
  ]
end
