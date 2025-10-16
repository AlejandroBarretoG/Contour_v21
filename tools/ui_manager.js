// tools/ui_manager.js
(function() {
    'use strict';
    window.FancyBorderTools = window.FancyBorderTools || {};

    class UIManager {
        constructor(stateManager) {
            this.stateManager = stateManager;
            this.dom = {
                body: document.body,
                modeSimpleBtn: document.getElementById('mode-simple'),
                modeAdvancedBtn: document.getElementById('mode-advanced'),
                randomizeBtn: document.getElementById('randomize-button'),
            };
            this.inputs = {};
            this._collectInputReferences();
            this._initEventListeners();
        }
        
        _collectInputReferences() {
            // Avanzados (Inputs de número)
            ['tlh', 'tlv', 'trh', 'trv', 'brh', 'brv', 'blh', 'blv'].forEach(key => {
                this.inputs[key] = document.getElementById(key);
            });
            // Simples (Inputs de número)
            ['top', 'bottom', 'left', 'right'].forEach(key => {
                this.inputs[key] = document.getElementById(`simple-${key}`);
            });
        }

        update(state) {
            // 1. Renderizar Modo
            this.dom.body.classList.toggle('mode-simple', state.mode === 'simple');
            this.dom.body.classList.toggle('mode-advanced', state.mode === 'advanced');
            this.dom.modeSimpleBtn.classList.toggle('active', state.mode === 'simple');
            this.dom.modeAdvancedBtn.classList.toggle('active', state.mode === 'advanced');
            
            // Renderizar la visibilidad de los grupos de inputs
            document.querySelector('.sliders-advanced').style.display = state.mode === 'advanced' ? 'grid' : 'none';
            document.querySelector('.sliders-simple').style.display = state.mode === 'simple' ? 'grid' : 'none';

            // 2. Renderizar Valores de Inputs
            const isAdvanced = state.mode === 'advanced';
            const currentRadii = isAdvanced ? state.radii : state.simpleRadii;
            
            const keys = isAdvanced 
                ? ['tlh', 'tlv', 'trh', 'trv', 'brh', 'brv', 'blh', 'blv']
                : ['top', 'bottom', 'left', 'right'];

            keys.forEach(key => {
                const value = currentRadii[key];
                const inputId = isAdvanced ? key : `simple-${key}`; 
                const inputEl = document.getElementById(inputId);

                if (inputEl) inputEl.value = value;
            });
        }

        _initEventListeners() {
            this.dom.modeSimpleBtn.addEventListener('click', () => {
                this.stateManager.updateState({ mode: 'simple' });
            });
            this.dom.modeAdvancedBtn.addEventListener('click', () => {
                this.stateManager.updateState({ mode: 'advanced' });
            });
            
            this.dom.randomizeBtn.addEventListener('click', () => {
                this._handleRandomize();
            });

            // Escuchar 'input' (para tiempo real) y 'change' (para blur/enter) de los inputs de número
            Object.keys(this.inputs).forEach(key => {
                const input = this.inputs[key];
                if (input) {
                    input.addEventListener('input', (e) => this._handleInputChange(key, Number(e.target.value)));
                    input.addEventListener('change', (e) => this._handleInputChange(key, Number(e.target.value)));
                }
            });
        }
        
        _handleInputChange(key, value) {
            // Aseguramos que el valor esté dentro del rango 0-100 
            let clampedValue = Math.max(0, Math.min(100, value));

            const state = this.stateManager.getState();
            let stateUpdate = {};

            if (state.mode === 'advanced') {
                const newRadii = { ...state.radii, [key]: clampedValue };
                stateUpdate = { radii: newRadii };
            } else { // mode === 'simple'
                const newSimpleRadii = { ...state.simpleRadii, [key]: clampedValue };
                stateUpdate = { simpleRadii: newSimpleRadii };
            }
            this.stateManager.updateState(stateUpdate);
        }
        
        _handleRandomize() {
            const state = this.stateManager.getState();
            let stateUpdate = {};
            
            if (state.mode === 'simple') {
                const newSimpleRadii = {};
                for (const key in state.simpleRadii) {
                    newSimpleRadii[key] = Math.floor(Math.random() * 101);
                }
                stateUpdate = { simpleRadii: newSimpleRadii };
            } else {
                const newRadii = {};
                for (const key in state.radii) {
                    newRadii[key] = Math.floor(Math.random() * 101);
                }
                stateUpdate = { radii: newRadii };
            }
            this.stateManager.updateState(stateUpdate);
        }
    }

    window.FancyBorderTools.UIManager = UIManager;
})();