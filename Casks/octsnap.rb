cask "octsnap" do
  version "1.3.1"
  sha256 "cae73773929f30c55973f74b3134edbb0867d1d752d61fb9007e905dae020402"

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
