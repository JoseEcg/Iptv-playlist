// @name Buscador de Recursos de Video/Claves
// @description Registra peticiones de red y busca archivos .key, .m3u8, .ts
// @version 1.0
// @match *://play.nbaidu.com/*
// @match *://*.xrnwrax.cn/*

(function() {
    'use strict';

    // 1. CONFIGURACIÓN: Patrones de URL que queremos buscar
    const targetPatterns = [
        /\.key(\?|$)/i,      // Claves de cifrado
        /\.m3u8(\?|$)/i,     // Listas de reproducción
        /\.ts(\?|$)/i,       // Segmentos de video
        /auth_key/i          // Parámetro de autenticación
    ];

    console.log("[PCAPdroid Injector] Script cargado. Monitoreando peticiones...");

    // 2. MONITOREO de todas las peticiones de red (Fetch API y XHR)
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const url = args[0];
        logAndCheckUrl(url);
        return originalFetch.apply(this, args);
    };

    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url) {
        logAndCheckUrl(url);
        return originalOpen.apply(this, arguments);
    };

    // 3. FUNCIÓN para revisar y registrar las URLs
    function logAndCheckUrl(urlString) {
        if (!urlString) return;

        for (const pattern of targetPatterns) {
            if (pattern.test(urlString)) {
                // ¡Encontramos algo de interés!
                const message = `[ENCONTRADO] ${urlString}`;
                console.log(message);

                // Opcional: Mostrar una alerta en la página (útil para pruebas)
                alert(message);

                // Opcional: Enviar los datos a un servidor externo
                // fetch('https://tuservidor.com/log', { method: 'POST', body: urlString });
                break;
            }
        }
    }

    // 4. INSPECCIÓN del DOM: Busca también enlaces en el código HTML de la página
    setTimeout(() => {
        const allElements = document.querySelectorAll('[href], [src]');
        allElements.forEach(el => {
            const url = el.href || el.src;
            logAndCheckUrl(url);
        });
        console.log(`[PCAPdroid Injector] Inspección DOM completada. ${allElements.length} elementos revisados.`);
    }, 3000); // Espera 3 segundos a que la página cargue

})();
