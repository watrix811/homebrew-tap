cask "octsnap" do
  version "1.0.0"
  sha256 "6d9eb2ae387302936fd548325773d0c28c39160b02232369b20dc3bcbabd54b1"

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
