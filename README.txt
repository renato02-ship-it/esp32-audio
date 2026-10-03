PÁGINA WEB - ESP32 AUDIO REMOTE

La página ya está creada. Incluye:
- selección de MP3
- arrastrar y soltar
- vista previa
- límite inicial de 25 MB
- subida a Supabase Storage
- preparación para notificar al ESP32 por MQTT
- diseño para celular y PC

LO QUE TÚ DEBES HACER:
1. Crear una cuenta/proyecto en Supabase.
2. Crear un Storage Bucket llamado "audio".
3. Configurar el acceso del bucket.
4. Obtener la URL del proyecto y la clave ANON/PUBLIC.
5. Poner esos datos en config.js.
6. Crear el endpoint seguro que publica el aviso MQTT.
7. Configurar el ESP32 con el mismo broker MQTT.

IMPORTANTE:
Nunca pongas una clave service_role de Supabase ni la contraseña privada
del broker MQTT dentro de la página pública.

ORDEN DEL PROYECTO:
Página web -> Supabase Storage -> endpoint seguro -> MQTT -> ESP32
-> microSD -> DAC GPIO25 -> PAM8403 -> parlante.

Cuando terminemos la página, te guiaré paso a paso para crear Supabase
y el endpoint MQTT. No necesitas saber programar para hacer esa parte.
