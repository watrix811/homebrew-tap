cask "hibari" do
  version "1.2.1"
  sha256 "0031a2fa47848a85ba8435a8db53a4a39a26743060110331390471ce12939773"

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
