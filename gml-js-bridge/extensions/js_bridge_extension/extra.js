Object.defineProperty(window, "room", { get: () => { return gml_Script_gmcallback_room(); } });
Object.defineProperty(window, "application_surface", { get: () => { return gml_Script_gmcallback_application_surface(); } });

window.js_bridge_extension_main = () => {
	if (window.main !== undefined) {
		window.main();
	}
};

window.js_bridge_extension_instance_create = (instance_id) => {
};

window.js_bridge_extension_instance_destroy = (instance_id) => {
};