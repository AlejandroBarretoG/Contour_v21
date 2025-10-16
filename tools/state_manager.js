// tools/state_manager.js
(function() {
    'use strict';
    window.FancyBorderTools = window.FancyBorderTools || {};

    class RadiusStateManager {
        constructor() {
            this.state = {
                mode: 'advanced', 
                radii: {
                    tlh: 30, tlv: 30, trh: 70, trv: 30,
                    brh: 70, brv: 70, blh: 30, blv: 70,
                },
                simpleRadii: { top: 50, bottom: 50, left: 50, right: 50 },
            };
            this._runMappingLogic();
        }

        getState() {
            return this.state;
        }
        
        updateState(newStatePart) {
            this.state = { ...this.state, ...newStatePart };
            this._runMappingLogic();
            this._dispatchEvent('stateChange', { state: this.state });
        }
        
        mapAdvancedToSimple() {
            const { radii } = this.state;
            this.state.simpleRadii.top = Math.round((radii.tlh + (100 - radii.trh)) / 2);
            this.state.simpleRadii.bottom = Math.round((radii.blh + (100 - radii.brh)) / 2);
            this.state.simpleRadii.left = Math.round((radii.tlv + (100 - radii.blv)) / 2);
            this.state.simpleRadii.right = Math.round((radii.trv + (100 - radii.brv)) / 2);
        }

        mapSimpleToAdvanced() {
            const { simpleRadii } = this.state;
            this.state.radii.tlh = simpleRadii.top;
            this.state.radii.trh = 100 - simpleRadii.top;
            this.state.radii.blh = simpleRadii.bottom;
            this.state.radii.brh = 100 - simpleRadii.bottom;
            this.state.radii.tlv = simpleRadii.left;
            this.state.radii.blv = 100 - simpleRadii.left;
            this.state.radii.trv = simpleRadii.right;
            this.state.radii.brv = 100 - simpleRadii.right;
        }

        _runMappingLogic() {
            if (this.state.mode === 'simple') {
                 this.mapSimpleToAdvanced();
            } else {
                 this.mapAdvancedToSimple();
            }
        }
        
        generateCss() {
             const { radii } = this.state;
             return `border-radius: ${radii.tlh}% ${radii.trh}% ${radii.brh}% ${radii.blh}% / ${radii.tlv}% ${radii.trv}% ${radii.brv}% ${radii.blv}%;`;
        }

        _dispatchEvent(eventName, detail) {
            const event = new CustomEvent(eventName, { detail, bubbles: true });
            document.dispatchEvent(event);
        }
    }

    window.FancyBorderTools.RadiusStateManager = RadiusStateManager;
})();