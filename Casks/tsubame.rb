cask "tsubame" do
  version "0.14.0"
  sha256 "ccb1489d09f73ac710742cb92855a58c142bc2dc8d0e7785df45859d8209e799"

  url "https://github.com/watrix811/homebrew-tap/releases/download/tsubame-v#{version}/Tsubame-v#{version}-macOS.zip",
      verified: "github.com/watrix811/homebrew-tap/"
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
