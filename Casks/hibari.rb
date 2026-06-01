cask "hibari" do
  version "1.2.3"
  sha256 "67fddde183ce4a1e652bb58bf36cee5a9b94b10c77c7379c627c21dcc4c58078"

  url "https://github.com/watrix811/homebrew-tap/releases/download/hibari-v#{version}/Hibari-v#{version}-macOS.zip"
  name "Hibari"
  desc "Single-tap left/right Command keys to toggle Japanese/English IME (US keyboards)"
  homepage "https://github.com/watrix811/hibari"

  depends_on macos: ">= :sonoma"

  app "Hibari.app"

  zap trash: [
    "~/Library/Preferences/com.watrix.hibari.plist",
    "~/Library/Saved Application State/com.watrix.hibari.savedState",
  ]
end
