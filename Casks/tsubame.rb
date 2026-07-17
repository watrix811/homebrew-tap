cask "tsubame" do
  version "0.15.6"
  sha256 "a9ff77e72fc5358a5b398f78879b097be5231aa51a1f2b819f118c60700eb9b8"

  url "https://github.com/watrix811/homebrew-tap/releases/download/tsubame-v#{version}/Tsubame-v#{version}-macOS.zip",
      verified: "github.com/watrix811/homebrew-tap/"
  name "Tsubame"
  desc "Terminal-style desktop app with an animated office of working characters"
  homepage "https://tsubame.watrix.co.jp"

  depends_on macos: :big_sur

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
