jsrel-min.js: jsrel-concat.js
	java -jar /usr/bin/compiler.jar --js jsrel-concat.js --js_output_file jsrel-min.js --compilation_level ADVANCED_OPTIMIZATIONS --externs externs.js
jsrel-concat.js: ../lib/audio.js  ../graphics/camera.js ../graphics/colors.js  ../graphics/mesh.js  ../graphics/shader.js  ../lib/io.js jsrel.js  sim/extended.js  sim/scene.js sim/worldline.js ../lib/ui.js
	touch jsrel-concat.js
	rm jsrel-concat.js
	cat ../lib/audio.js  ../graphics/camera.js ../graphics/colors.js  ../graphics/mesh.js  ../graphics/shader.js  ../lib/io.js jsrel.js  sim/extended.js  sim/scene.js  sim/worldline.js ../lib/ui.js  >> jsrel-concat.js
	gjslint --strict jsrel-concat.js
