// tools/app.js
(function() {
    'use strict';
    window.FancyBorderTools = window.FancyBorderTools || {};

    const initialize = () => {
        const { RadiusStateManager, UIManager, PreviewManager } = window.FancyBorderTools;
        
        if (!RadiusStateManager || !UIManager || !PreviewManager) return; 

        // 1. Inicializar el Estado Central
        const stateManager = new RadiusStateManager();
        
        // 2. Inicializar Managers de UI y Preview
        const uiManager = new UIManager(stateManager);
        const previewManager = new PreviewManager(stateManager);
        
        // Función de Renderizado Central
        const updateAll = () => {
             const state = stateManager.getState();
             uiManager.update(state);
             previewManager.update(state);
        };

        // 3. Suscribirse al evento de cambio de estado
        document.addEventListener('stateChange', updateAll);
        
        // 4. Renderizado Inicial
        updateAll();
    };

    window.FancyBorderTools.initializeApp = initialize;
})();