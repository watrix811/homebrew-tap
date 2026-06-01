cask "hibari" do
  version "1.2.2"
  sha256 "e38400150d75b95302af599b29d1f2de5089efbe0d440091acb82463dc46b377"

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
