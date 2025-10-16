// tools/preview_manager.js
(function() {
    'use strict';
    window.FancyBorderTools = window.FancyBorderTools || {};

    class PreviewManager {
        constructor(stateManager) {
            this.stateManager = stateManager;
            this.dom = {
                previewBox: document.getElementById('preview-box'),
                previewContainer: document.getElementById('preview-section'), 
                handles: {
                    advanced: document.querySelectorAll('[data-handle-advanced]'),
                    simple: document.querySelectorAll('[data-handle-simple]'),
                }
            };
            this.activeHandle = null;
            this._initEventListeners();
        }

        update(state) {
            this.renderPreview(state);
            this.updateHandlePositions(state);
        }

        renderPreview(state) {
            const css = this.stateManager.generateCss();
            const borderRadiusValue = css.split(': ')[1].replace(';', ''); 
            this.dom.previewBox.style.borderRadius = borderRadiusValue;
            document.getElementById('css-output').textContent = css;
        }

        updateHandlePositions(state) {
            this.dom.handles.advanced.forEach(h => h.classList.remove('visible'));
            this.dom.handles.simple.forEach(h => h.classList.remove('visible'));
            
            const resetStyles = (h) => {
                h.style.left = h.style.right = h.style.top = h.style.bottom = 'auto';
            };


            if (state.mode === 'advanced') {
                const { radii } = state;
                const advHandles = {};
                this.dom.handles.advanced.forEach(h => {
                    advHandles[h.dataset.handleAdvanced] = h;
                    h.classList.add('visible');
                    resetStyles(h);
                });

                // Lógica de posicionamiento de handles avanzada (8 puntos)
                advHandles.tlh.style.left = `${radii.tlh}%`; advHandles.tlh.style.top = `0%`;
                advHandles.tlv.style.top = `${radii.tlv}%`; advHandles.tlv.style.left = `0%`;
                
                advHandles.trh.style.right = `${radii.trh}%`; advHandles.trh.style.top = `0%`;
                advHandles.trv.style.top = `${radii.trv}%`; advHandles.trv.style.right = `0%`;

                advHandles.brh.style.right = `${radii.brh}%`; advHandles.brh.style.bottom = `0%`;
                advHandles.brv.style.bottom = `${radii.brv}%`; advHandles.brv.style.right = `0%`;

                advHandles.blh.style.left = `${radii.blh}%`; advHandles.blh.style.bottom = `0%`;
                advHandles.blv.style.bottom = `${radii.blv}%`; advHandles.blv.style.left = `0%`;

            } else { // mode === 'simple'
                const { simpleRadii } = state;
                const simpHandles = {};
                this.dom.handles.simple.forEach(h => {
                    simpHandles[h.dataset.handleSimple] = h;
                    h.classList.add('visible');
                    resetStyles(h);
                });
                
                // Lógica de posicionamiento de handles simple (4 puntos)
                simpHandles.top.style.left = `${simpleRadii.top}%`; simpHandles.top.style.top = '0%';
                simpHandles.bottom.style.left = `${simpleRadii.bottom}%`; simpHandles.bottom.style.bottom = '0%';
                simpHandles.left.style.top = `${simpleRadii.left}%`; simpHandles.left.style.left = '0%';
                simpHandles.right.style.top = `${simpleRadii.right}%`; simpHandles.right.style.right = '0%';
            }
        }
        
        // ... (El resto de la lógica de arrastre (_startDrag, _drag, _stopDrag) es idéntica a la versión modular anterior y no requiere cambios) ...
        _initEventListeners() {
            this.dom.previewBox.addEventListener('mousedown', (e) => this._startDrag(e));
            this.dom.previewBox.addEventListener('touchstart', (e) => this._startDrag(e));

            document.getElementById('copy-button').addEventListener('click', () => {
                const cssOutput = document.getElementById('css-output');
                navigator.clipboard.writeText(cssOutput.textContent).then(() => {
                    const originalText = document.getElementById('copy-button').textContent;
                    document.getElementById('copy-button').textContent = '¡Copiado!';
                    setTimeout(() => { document.getElementById('copy-button').textContent = originalText; }, 2000);
                }).catch(err => console.error('Error al copiar:', err));
            });
        }
        
        _startDrag(e) {
            if (!e.target.classList.contains('handle')) return;
            this.activeHandle = e.target;
            document.addEventListener('mousemove', this._drag);
            document.addEventListener('touchmove', this._drag, { passive: false });
            document.addEventListener('mouseup', this._stopDrag);
            document.addEventListener('touchend', this._stopDrag);
        }
        
        _drag = (e) => {
            if (!this.activeHandle) return;
            e.preventDefault();

            const rect = this.dom.previewBox.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            
            let valueX = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
            let valueY = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
            
            let stateUpdate = {};
            const state = this.stateManager.getState();

            if (state.mode === 'simple') {
                const side = this.activeHandle.dataset.handleSimple;
                const newSimpleRadii = { ...state.simpleRadii };
                
                if (side === 'top' || side === 'bottom') newSimpleRadii[side] = Math.round(valueX);
                if (side === 'left' || side === 'right') newSimpleRadii[side] = Math.round(valueY);
                
                stateUpdate = { simpleRadii: newSimpleRadii };
                
            } else { // mode === 'advanced'
                const corner = this.activeHandle.dataset.handleAdvanced;
                const newRadii = { ...state.radii };

                switch (corner) {
                    case 'tlh': newRadii.tlh = Math.round(valueX); break;
                    case 'tlv': newRadii.tlv = Math.round(valueY); break;
                    case 'trh': newRadii.trh = Math.round(100 - valueX); break;
                    case 'trv': newRadii.trv = Math.round(valueY); break;
                    case 'brh': newRadii.brh = Math.round(100 - valueX); break;
                    case 'brv': newRadii.brv = Math.round(100 - valueY); break;
                    case 'blh': newRadii.blh = Math.round(valueX); break;
                    case 'blv': newRadii.blv = Math.round(100 - valueY); break;
                }
                
                stateUpdate = { radii: newRadii };
            }
            
            this.stateManager.updateState(stateUpdate);
        }

        _stopDrag = () => {
            this.activeHandle = null;
            document.removeEventListener('mousemove', this._drag);
            document.removeEventListener('touchmove', this._drag);
            document.removeEventListener('mouseup', this._stopDrag);
            document.removeEventListener('touchend', this._stopDrag);
        }
    }

    window.FancyBorderTools.PreviewManager = PreviewManager;
})();