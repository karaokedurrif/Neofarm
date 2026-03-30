"Actúa como un experto en React Three Fiber y Digital Twins. He anexado el modelo vinyard.glb y quiero que sustituyas mi viñedo actual por una escena profesional de alta fidelidad.
1. Procesamiento del Modelo:
Carga el .glb usando useGLTF.
IMPORTANTE: No renderices el modelo completo múltiples veces. Usa la geometría de la 'vid' del archivo para crear un InstancedMesh. Genera 5 filas con 10 vides cada una, aplicando una rotación y escala aleatoria mínima para que se vea orgánico.
2. Estética de Iluminación y Escena:
Configura el background del canvas en #0f0f0f y añade una Fog (niebla) del mismo color para que el modelo se funda con el fondo.
Usa <Environment preset="sunset" /> para reflejos realistas y una SpotLight cenital que proyecte sombras suaves sobre el suelo.
3. Post-procesado (Efecto 'Glow'):
Implementa un <EffectComposer> con los siguientes efectos:
SSAO: Para sombras de contacto profundas entre las plantas.
Bloom: Con intensity={1.5} y luminanceThreshold={1}.
Crea esferas pequeñas (sensores) sobre las vides con un material emissive potente. El Bloom debe hacer que estas esferas 'brillen' como luces LED sobre el viñedo oscuro.
4. Materiales:
Fuerza que el material del suelo sea mate (roughness: 1) y de color tierra oscuro, para que no brille y distraiga de los sensores.
Tarea: Genera el código completo del componente VineyardPro.jsx optimizado para este modelo."
