from pathlib import Path

app = Path("ios/App/App/AppDelegate.swift")
text = app.read_text()

marker = "final class EOTBridgeViewController"
if marker not in text:
    text += Path("native/EOTBridgeViewController.swift.txt").read_text()
    app.write_text(text)

main = Path("ios/App/App/Base.lproj/Main.storyboard")
story = main.read_text()
story = story.replace(
    'customClass="CAPBridgeViewController" customModule="Capacitor"',
    'customClass="EOTBridgeViewController" customModule="App" customModuleProvider="target"'
)
main.write_text(story)

launch = Path("ios/App/App/Base.lproj/LaunchScreen.storyboard")
launch_text = launch.read_text().replace("systemBackgroundColor", "blackColor")
launch.write_text(launch_text)
