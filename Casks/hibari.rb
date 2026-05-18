cask "hibari" do
  version "1.0.0"
  sha256 "aac23cecc749157ef07b670082bd3dc11908f9e64193ae0098c9a121d32ad1ee"

  url "https://github.com/watrix811/hibari/releases/download/v#{version}/Hibari-v#{version}-macOS.zip"
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
