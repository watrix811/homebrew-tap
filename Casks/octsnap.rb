cask "octsnap" do
  version "1.4.1"
  sha256 "76a25d88ccb61186d5e181ec006294291e82247f62beb987ea06fc9734be5180"

  url "https://github.com/watrix811/homebrew-tap/releases/download/octsnap-v#{version}/OctSnap-v#{version}-macOS.zip"
  name "OctSnap"
  desc "Menu bar utility to resize windows into a half-screen or 8-cell grid via keyboard shortcuts"
  homepage "https://octsnap.watrix.co.jp"

  depends_on macos: :ventura

  app "OctSnap.app"

  zap trash: [
    "~/Library/Preferences/jp.watrix.octsnap.plist",
    "~/Library/Saved Application State/jp.watrix.octsnap.savedState",
  ]
end
