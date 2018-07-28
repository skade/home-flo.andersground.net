const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;

const NetworkManagerInterface = '<node> \
    <interface name="org.freedesktop.NetworkManager"> \
        <signal name="PropertiesChanged"> \
            <arg type="a{sv}"/> \
        </signal> \
        <property type="o" name="PrimaryConnection" access="read"/> \
    </interface> \
    <node name="AccessPoint"/> \
</node>';

const ActiveConnectionInterface = '<node> \
    <interface name="org.freedesktop.NetworkManager.Connection.Active"> \
        <signal name="PropertiesChanged"> \
            <arg type="a{sv}"/> \
        </signal> \
        <property type="s" name="Id" access="read"/> \
    </interface> \
</node>'

const HomeInterface = '<node> \
    <interface name="org.florian.HomeInterface"> \
        <signal name="PropertiesChanged"> \
            <arg type="a{sv}"/> \
        </signal> \
        <property type="b" name="Home" access="read"/> \
    </interface> \
</node>'


const NetworkManagerProxy = Gio.DBusProxy.makeProxyWrapper(NetworkManagerInterface);

const ActiveConnectionProxy = Gio.DBusProxy.makeProxyWrapper(ActiveConnectionInterface);

const HomeProxy = Gio.DBusProxy.makeProxyWrapper(HomeInterface);

class HomeService {
    constructor() {
        this._ssids = []
    }

    enable() {
        let [ok, contents] = GLib.file_get_contents('/home/skade/.home_wifis.json');

        if (ok) {
            let settings = JSON.parse(contents);
            this._ssids = settings["ssids"];
        }

        this._netProxy = new NetworkManagerProxy(
            Gio.DBus.system,
            "org.freedesktop.NetworkManager",
            "/org/freedesktop/NetworkManager"
        );
        
        let self = this;
        this._netProxy.connectSignal("PropertiesChanged", function(proxy) {
            self.updateState(proxy);
        });
        
        self.updateState(this._netProxy);

        Gio.DBus.session.own_name('org.florian.Home',
            Gio.BusNameOwnerFlags.NONE,
            null,
            null
        );

        this._bus = Gio.DBusExportedObject.wrapJSObject(HomeInterface, this);
        this._bus.export(Gio.DBus.session, '/org/florian/Home');
    }   

    disable() {
        Gio.DBus.session.unown_name('org.florian.Home',
            Gio.BusNameOwnerFlags.NONE,
            null,
            null
        );

        this._bus = null;
    }

    updateState(proxy) {
        let ssid = this.getSsid(proxy);
        this.Home = this.is_home(ssid);
    
        print("state is now: " + this.Home);
    }

    is_home(ssid) {
        return this._ssids.some((elem) => {
            return elem === ssid
        });
    }

    getSsid(proxy) {
        let conn = proxy.PrimaryConnection;
        if (conn != null) {
            let netProxy = new ActiveConnectionProxy(
                Gio.DBus.system,
                "org.freedesktop.NetworkManager",
                conn
            );
    
            return netProxy.Id;
        }
    
        return null;
    }
}
