// @name Extractor de Enlaces de Video - JAVSpanish
// @description Busca y muestra enlaces de video (m3u8, mp4, etc.) en javenspanish.com
// @version 1.1
// @match *://javenspanish.com/*
// @match *://*.javenspanish.com/*

(function() {
    'use strict';

    console.log('[Inyector JAVSpanish] Activado. Buscando enlaces de video...');

    // 1. PATRONES DE BUSQUEDA: Tipos de enlaces de video más comunes
    const videoPatterns = [
        /\.(m3u8|mp4|mkv|avi|mov|webm|flv)(\?[^"\']*)?$/i, // Extensiones directas
        /(m3u8|mp4|index\.m3u8)/i,                          // Palabras clave en la ruta
        /\/video\/|\/stream\/|\/v\/|\/embed\/|googlevideo/i, // Rutas comunes de video
        /source.*?=.*?["\'](http[^"\']+)["\']/i             // Atributos 'src' en texto
    ];

    // 2. FUNCIÓN para verificar y mostrar una URL encontrada
    function logVideoUrl(url, tipo = 'Enlace directo') {
        if (!url || url.startsWith('javascript:')) return;

        const urlObj = new URL(url, window.location.href);
        const mensaje = `🎬 [${tipo.toUpperCase()}] ${urlObj.pathname.split('/').pop() || 'Video'}`;
        const enlace = urlObj.href;

        // Crear un elemento visible en la página (muy útil para pruebas)
        const banner = document.createElement('div');
        banner.style.cssText = 'position:fixed; bottom:20px; right:20px; background:#222; color:#0f0; padding:15px; z-index:9999; border-radius:10px; max-width:400px; font-family:monospace; font-size:14px; box-shadow:0 0 10px #000;';
        banner.innerHTML = `<strong>${mensaje}</strong><br><a href="${enlace}" target="_blank" style="color:#4fc3f7; word-break:break-all;">${enlace}</a><br><button onclick="this.parentNode.remove()" style="margin-top:8px; padding:5px; background:#d32f2f; color:white; border:none; border-radius:4px;">Cerrar</button>`;
        document.body.appendChild(banner);

        // También registrar en la consola
        console.log(`✅ ${mensaje}: ${enlace}`);
    }

    // 3. BUSCAR en atributos HTML (src, href, data-src, etc.)
    function scanAttributes() {
        const attributes = ['src', 'href', 'data-src', 'data-file', 'source'];
        const allElements = document.querySelectorAll('*');
        
        allElements.forEach(el => {
            attributes.forEach(attr => {
                const value = el.getAttribute(attr);
                if (value && videoPatterns.some(pattern => pattern.test(value))) {
                    logVideoUrl(value, `Atributo ${attr}`);
                }
            });
        });
    }

    // 4. MONITOREAR peticiones de red (Fetch y XHR) en tiempo real
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const resource = args[0];
        const url = (typeof resource === 'string') ? resource : (resource.url || '');
        if (videoPatterns.some(pattern => pattern.test(url))) {
            logVideoUrl(url, 'Petición Fetch');
        }
        return originalFetch.apply(this, args);
    };

    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
        if (videoPatterns.some(pattern => pattern.test(url))) {
            setTimeout(() => logVideoUrl(url, 'Petición XHR'), 100);
        }
        return originalOpen.apply(this, arguments);
    };

    // 5. BUSCAR en el código fuente de la página (scripts, iframes)
    function scanPageSource() {
        // En iframes
        document.querySelectorAll('iframe').forEach(iframe => {
            try {
                if (iframe.src && videoPatterns.some(pattern => pattern.test(iframe.src))) {
                    logVideoUrl(iframe.src, 'Iframe');
                }
            } catch(e) {}
        });

        // En scripts que puedan contener URLs
        document.querySelectorAll('script').forEach(script => {
            if (script.textContent) {
                const matches = script.textContent.match(/https?:\/\/[^"'\s]+\.(m3u8|mp4)[^"'\s]*/gi);
                if (matches) {
                    matches.forEach(url => logVideoUrl(url, 'Script embebido'));
                }
            }
        });
    }

    // 6. EJECUTAR todas las búsquedas
    // Escanear inmediatamente
    scanAttributes();
    scanPageSource();

    // Escanear periódicamente por cambios dinámicos (SPA)
    const observer = new MutationObserver(() => {
        scanAttributes();
        scanPageSource();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Escanear después de 3 segundos (por si hay carga dinámica)
    setTimeout(() => {
        scanAttributes();
        scanPageSource();
    }, 3000);

    console.log('[Inyector JAVSpanish] Búsqueda iniciada. Los enlaces aparecerán como ventanas flotantes y en la consola (F12).');

})();
