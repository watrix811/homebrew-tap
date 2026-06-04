cask "hibari" do
  version "1.2.4"
  sha256 "51587c03a9c58b34963dda4018c4554e5f24f51159cc9c51e57a60c497363872"

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
