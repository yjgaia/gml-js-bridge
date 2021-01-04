Object.defineProperty(window, "room", { get: () => { return gml_Script_gmcallback_room(); } });
Object.defineProperty(window, "application_surface", { get: () => { return gml_Script_gmcallback_application_surface(); } });
