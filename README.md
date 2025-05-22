Para modular el programa, en js hay que hacer uso de módulos,
estos módulos al conectarse con el html directamente violan la pólitica de
CORS, Cross Origin algo así.
Por el momento propongo 2 alternativas para trabajar, y al final vemos que hacemos
Al final podríamos a quedarnos con la alternativa 1, o nada mas poner todo el código en 1 solo javascript,
aunque se vería desordenada garantizamos que no hayan dependencias en un fedore recien instalado.

#Alternativa 1
Con correr, bat se ahorran estos pasos.
Solo es darle clicks.

Abrir la carpeta donde está index.html y correr
`python3 -m http.server 8000`
Esto correra un servidor en el puerto 8000, o bueno cualquier puerto que elijan para ejecutar el código
Luego acceder a
`http://localhost:8000/`
Y ahi estara abierto el index.html

#Alternativa 2
`https://chromewebstore.google.com/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf?hl=es`
Instalar esa extensión en el navegador de preferencia que use chromium, y activarla y correr el programa normal.
