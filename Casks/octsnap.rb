cask "octsnap" do
  version "1.0.0"
  sha256 "3f65aec5953cf36b453c79a4f168a451b586b91dc9fa7882be9b7f6895ab97fd"

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
