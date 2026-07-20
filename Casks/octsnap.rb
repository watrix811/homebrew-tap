cask "octsnap" do
  version "1.5.0"
  sha256 "b5a551e16f6f3d423fa5967d8b2daf352e6f9048abdeecb64e743b4be0cf561a"

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
