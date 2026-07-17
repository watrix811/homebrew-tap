cask "octsnap" do
  version "1.0.0"
  sha256 "20d137eef7b2120aa1e89270e1f378c83326436df48858f0552f5333bf717af5"

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
