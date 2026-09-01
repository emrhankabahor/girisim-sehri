import Foundation
import Capacitor

@objc(EOTReadyBridge)
public class EOTReadyBridge: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "EOTReadyBridge"
    public let jsName = "EOTReady"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "ready", returnType: CAPPluginReturnPromise)
    ]

    @objc func ready(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            NotificationCenter.default.post(name: Notification.Name("EOTGameReady"), object: nil)
            call.resolve()
        }
    }
}
