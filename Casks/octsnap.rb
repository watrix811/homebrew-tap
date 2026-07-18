cask "octsnap" do
  version "1.2.1"
  sha256 "d45319eaab9703eaabbec93ecadffe3d82e88a16dd08d245ff572c716a4c74e3"

  url "https://github.com/watrix811/homebrew-tap/releases/download/octsnap-v#{version}/OctSnap-v#{version}-macOS.zip"
  name "OctSnap"
  desc "Menu bar utility to resize windows into a half-screen or 8-cell grid via keyboard shortcuts"
  homepage "https://octsnap.watrix.co.jp"

  depends_on macos: :ventura

  app "OctSnap.app"

  zap trash: [
    "~/Library/Preferences/com.watrix.octsnap.plist",
    "~/Library/Saved Application State/com.watrix.octsnap.savedState",
  ]
end
