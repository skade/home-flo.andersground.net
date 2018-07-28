const ExtensionUtils = imports.misc.extensionUtils;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const HomeService = Me.imports.service.HomeService;


function init() {
    return new HomeService();
}
