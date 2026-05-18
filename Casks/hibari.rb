cask "hibari" do
  version "1.0.0"
  sha256 "551f2f8fc9fffbedd28784bd24e3865e55c1b88811fd60644c846469d00580b9"

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
