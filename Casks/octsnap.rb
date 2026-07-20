cask "octsnap" do
  version "1.4.2"
  sha256 "114cec9eb684394453eab9b19ce14b558dc42aceb9acc591e4872d21af261544"

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
