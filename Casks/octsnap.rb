cask "octsnap" do
  version "1.1.0"
  sha256 "b29bd99d3460cd2afb9f2dda3847b5875026204ef99a11864ca9362ff793a031"

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
