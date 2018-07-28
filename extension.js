const ExtensionUtils = imports.misc.extensionUtils;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const HomeExtension = Me.imports.service.HomeExtension;

function init() {
    return new HomeExtension();
}
