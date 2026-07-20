cask "octsnap" do
  version "1.5.0"
  sha256 "35c526e5213790ec045f2a81a7708205e3895fec2146bd7f58e64210a351f6f6"

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
