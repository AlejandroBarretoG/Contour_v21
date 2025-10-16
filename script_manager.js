// script_manager.js
(function() {
    'use strict';
    
    // Ruta donde se encuentran los archivos de la aplicación
    const MODULE_DIR = 'tools/'; 
    
    // Lista de módulos con orden de dependencia CRÍTICO
    const scripts = [
        'state_manager.js',
        'ui_manager.js',
        'preview_manager.js',
        'app.js' // Debe ser el último
    ];

    let scriptsLoaded = 0;

    const onScriptLoad = () => {
        scriptsLoaded++;
        if (scriptsLoaded === scripts.length) {
            document.dispatchEvent(new CustomEvent('fancyBorderModulesLoaded'));
        }
    };

    // Recorre y carga cada script desde la carpeta 'tools/'
    scripts.forEach(script_name => {
        const script = document.createElement('script');
        script.src = MODULE_DIR + script_name; 
        script.onload = onScriptLoad;
        script.onerror = () => console.error(`Error al cargar el script: ${script_name}`);
        document.head.appendChild(script);
    });
})();