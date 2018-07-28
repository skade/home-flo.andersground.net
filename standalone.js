imports.searchPath.unshift('.');
const GLib = imports.gi.GLib;
const HomeExtension = imports.service.HomeExtension;

let extension = new HomeExtension();
extension.enable();

let loop = new GLib.MainLoop(null, false);
loop.run();