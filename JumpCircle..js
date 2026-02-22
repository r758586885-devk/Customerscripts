const circleMod = new Module("Circle", true, true, ModuleCategory.MISC);

const radius = new SliderSetting("Radius", [0.8, 0.8, 10, 0.1]);
const thickness = new SliderSetting("Thickness", [0.2, 0.05, 1.0, 0.05]);
const segments = new SliderSetting("Segments", [32, 8, 64, 1]);
const fadeSpeed = new SliderSetting("Fade Speed", [0.8, 0.8, 10, 0.1]);
const yOffset = new SliderSetting("Y Offset", [2, 2, 10, 1]);
const animationSpeed = new SliderSetting("Animation Speed", [1, 1, 10, 1]);
const transparency = new SliderSetting("Transparency", [50, 0, 100, 1]);
const glowIntensity = new SliderSetting("Glow Intensity", [1.0, 0.5, 3.0, 0.1]);
const jumpDelay = new SliderSetting("Jump Delay", [10, 1, 20, 1]); // 10 тиков = 0.5 сек

const ctx = getContext();
const GL10 = javax.microedition.khronos.opengles.GL10;
const GLU = android.opengl.GLU;

let circles = [];
let canCreateCircle = true;
let jumpTimer = 0;
let wasOnGround = true;

let isGLSurfaceViewRendering = false;

circleMod.addSettings([
    radius, thickness, segments, fadeSpeed, yOffset, animationSpeed, 
    transparency, glowIntensity, jumpDelay
]);

circleMod.setOnToggleListener((view, a) => {
    jumpTimer = 0;
    if (!circleMod.isActive()) {
        circles = [];
        canCreateCircle = true;
        if (Render.glSurface) {
            ctx.runOnUiThread(() => {
                Render.glSurface.setRenderMode(android.opengl.GLSurfaceView.RENDERMODE_WHEN_DIRTY);
            });
            isGLSurfaceViewRendering = false;
        }
    } else {
        if (Render.glSurface) {
            ctx.runOnUiThread(() => {
                Render.glSurface.setRenderMode(android.opengl.GLSurfaceView.RENDERMODE_CONTINUOUSLY);
            });
            isGLSurfaceViewRendering = true;
        }
    }
});

var Render = {
    getFloatBuffer: function(fArray) {
        let bBuffer = java.nio.ByteBuffer.allocateDirect(fArray.length * 4);
        bBuffer.order(java.nio.ByteOrder.nativeOrder());
        let fBuffer = bBuffer.asFloatBuffer();
        fBuffer.put(fArray);
        fBuffer.position(0);
        return fBuffer;
    },
    renderer: null,
    glSurface: null,
    fov: 110,
    initted: false,
    init: function() {
        this.renderer = new android.opengl.GLSurfaceView.Renderer({
            onSurfaceCreated: function(gl, config) {
                gl.glEnable(GL10.GL_TEXTURE_2D);
                gl.glShadeModel(GL10.GL_SMOOTH);
                gl.glClearColor(0, 0, 0, 0);
                gl.glClearDepthf(1);
                gl.glEnable(GL10.GL_DEPTH_TEST);
                gl.glDepthFunc(GL10.GL_LEQUAL);
                gl.glHint(GL10.GL_PERSPECTIVE_CORRECTION_HINT, GL10.GL_NICEST);
            },
            onSurfaceChanged: function(gl, width, height) {
                gl.glMatrixMode(GL10.GL_PROJECTION);
                gl.glLoadIdentity();
                GLU.gluPerspective(gl, Render.fov * Math.sqrt(Memory.getFloat(Memory.getLevelRenderer(), 0x1440)), ctx.getResources().getDisplayMetrics().widthPixels / ctx.getResources().getDisplayMetrics().heightPixels, .1, 100);
                gl.glMatrixMode(GL10.GL_MODELVIEW);
                gl.glLoadIdentity();
            },
            onDrawFrame: function(gl) {
                gl.glMatrixMode(GL10.GL_PROJECTION);
                gl.glLoadIdentity();
                GLU.gluPerspective(gl, Render.fov * Math.sqrt(Memory.getFloat(Memory.getLevelRenderer(), 0x1440)), ctx.getResources().getDisplayMetrics().widthPixels / ctx.getResources().getDisplayMetrics().heightPixels, .1, 100);
                gl.glMatrixMode(GL10.GL_MODELVIEW);
                gl.glLoadIdentity();
                gl.glClear(GL10.GL_COLOR_BUFFER_BIT | GL10.GL_DEPTH_BUFFER_BIT);
                gl.glLoadIdentity();
                gl.glDisable(GL10.GL_LIGHTING);

                if (getScreenName().equals("hud_screen")) {
                    try {
                        let yaw = LocalPlayer.getYaw() % 360;
                        let pitch = LocalPlayer.getPitch() % 360;

                        let eyeX = LocalPlayer.getPositionX();
                        let eyeY = LocalPlayer.getPositionY() + 1;
                        let eyeZ = LocalPlayer.getPositionZ();

                        let dCenterX = Math.sin(yaw / 180 * Math.PI);
                        let dCenterZ = Math.cos(yaw / 180 * Math.PI);
                        let dCenterY = Math.sqrt(dCenterX * dCenterX + dCenterZ * dCenterZ) * Math.tan((pitch - 180) / 180 * Math.PI);

                        let centerX = eyeX - dCenterX;
                        let centerZ = eyeZ + dCenterZ;
                        let centerY = eyeY - dCenterY;

                        GLU.gluLookAt(gl, eyeX, eyeY, eyeZ, centerX, centerY, centerZ, 0, 1, 0);

                        try {
                            if (circleMod.isActive() && LocalPlayer.isInGame()) {
                                // Обновляем и рисуем существующие круги
                                circles.forEach(circle => {
                                    if (circle.radius < radius.getCurrentValue()) {
                                        circle.radius += animationSpeed.getCurrentValue() * 0.1;
                                    }
                                    Render.drawGlowingRing(gl, circle.x, circle.y, circle.z, circle.radius, thickness.getCurrentValue(), Math.round(segments.getCurrentValue()), circle.alpha);
                                    circle.alpha -= fadeSpeed.getCurrentValue() * 0.01;
                                });
                                
                                // Удаляем старые круги
                                circles = circles.filter(circle => circle.alpha > 0);

                                // Логика создания нового круга при прыжке
                                let onGround = LocalPlayer.isOnGround();
                                
                                // Если игрок был на земле и начал прыжок (отрыв от земли)
                                if (wasOnGround && !onGround) {
                                    // Начинаем отсчет задержки
                                    jumpTimer = 0;
                                    canCreateCircle = true;
                                }
                                
                                // Если игрок в воздухе и прошла задержка
                                if (!onGround && canCreateCircle) {
                                    jumpTimer++;
                                    if (jumpTimer >= jumpDelay.getCurrentValue()) {
                                        // Создаем круг
                                        let x = LocalPlayer.getPositionX();
                                        let y = LocalPlayer.getPositionY() - yOffset.getCurrentValue();
                                        let z = LocalPlayer.getPositionZ();

                                        circles.push({
                                            x: x,
                                            y: y,
                                            z: z,
                                            radius: 0,
                                            alpha: 1
                                        });
                                        
                                        canCreateCircle = false;
                                        jumpTimer = 0;
                                    }
                                }
                                
                                // Если игрок приземлился, разрешаем создание нового круга для следующего прыжка
                                if (onGround && !wasOnGround) {
                                    canCreateCircle = true;
                                    jumpTimer = 0;
                                }
                                
                                wasOnGround = onGround;
                            }
                        } catch (e) {
                            print(e + e.lineNumber);
                        }
                    } catch (e) {
                        print("RenderProblem: " + e + e.lineNumber);
                    }
                }
            }
        });

        ctx.runOnUiThread(() => {
            Render.glSurface = new android.opengl.GLSurfaceView(ctx);
            Render.glSurface.setZOrderOnTop(true);
            Render.glSurface.setEGLConfigChooser(8, 8, 8, 8, 16, 0);
            Render.glSurface.getHolder().setFormat(android.graphics.PixelFormat.TRANSLUCENT);
            Render.glSurface.setRenderer(Render.renderer);
            Render.glSurface.setRenderMode(android.opengl.GLSurfaceView.RENDERMODE_WHEN_DIRTY);
            isGLSurfaceViewRendering = false;

            ctx.getWindow().getDecorView().addView(Render.glSurface);

            Render.initted = true;
        });
    },

    drawGlowingRing: function(gl, x, y, z, radius, thickness, numSegments, alpha) {
        let angleStep = 2 * Math.PI / numSegments;
        let innerRadius = radius - thickness;
        if (innerRadius < 0.1) innerRadius = 0.1;
        
        let currentAlpha = alpha * (transparency.getCurrentValue() / 100);
        let glow = glowIntensity.getCurrentValue();
        
        gl.glEnable(GL10.GL_BLEND);
        gl.glDepthMask(false);
        
        // Сияние (режим ADD)
        gl.glBlendFunc(GL10.GL_SRC_ALPHA, GL10.GL_ONE);
        
        // Рисуем несколько слоев для сияния
        for (let layer = 0; layer < 3; layer++) {
            let layerAlpha = currentAlpha * (1 - layer * 0.3);
            let layerRadius = radius + layer * 0.15 * glow;
            let layerInnerRadius = innerRadius - layer * 0.15 * glow;
            
            if (layerInnerRadius < 0.05) layerInnerRadius = 0.05;
            
            gl.glColor4f(1.0, 1.0, 1.0, layerAlpha * 0.4);
            
            let vertices = [];
            
            for (let i = 0; i < numSegments; i++) {
                let angle1 = angleStep * i;
                let angle2 = angleStep * ((i + 1) % numSegments);
                
                let xOut1 = x + layerRadius * Math.cos(angle1);
                let zOut1 = z + layerRadius * Math.sin(angle1);
                let xOut2 = x + layerRadius * Math.cos(angle2);
                let zOut2 = z + layerRadius * Math.sin(angle2);
                
                let xIn1 = x + layerInnerRadius * Math.cos(angle1);
                let zIn1 = z + layerInnerRadius * Math.sin(angle1);
                let xIn2 = x + layerInnerRadius * Math.cos(angle2);
                let zIn2 = z + layerInnerRadius * Math.sin(angle2);
                
                vertices.push(xOut1, y, zOut1);
                vertices.push(xIn1, y, zIn1);
                vertices.push(xOut2, y, zOut2);
                
                vertices.push(xIn1, y, zIn1);
                vertices.push(xIn2, y, zIn2);
                vertices.push(xOut2, y, zOut2);
            }
            
            let vertexBuffer = Render.getFloatBuffer(vertices);
            gl.glEnableClientState(GL10.GL_VERTEX_ARRAY);
            gl.glVertexPointer(3, GL10.GL_FLOAT, 0, vertexBuffer);
            gl.glDrawArrays(GL10.GL_TRIANGLES, 0, vertices.length / 3);
            gl.glDisableClientState(GL10.GL_VERTEX_ARRAY);
        }
        
        // Основное кольцо (обычный режим)
        gl.glBlendFunc(GL10.GL_SRC_ALPHA, GL10.GL_ONE_MINUS_SRC_ALPHA);
        gl.glColor4f(1.0, 1.0, 1.0, currentAlpha);
        
        let mainVertices = [];
        for (let i = 0; i < numSegments; i++) {
            let angle1 = angleStep * i;
            let angle2 = angleStep * ((i + 1) % numSegments);
            
            let xOut1 = x + radius * Math.cos(angle1);
            let zOut1 = z + radius * Math.sin(angle1);
            let xOut2 = x + radius * Math.cos(angle2);
            let zOut2 = z + radius * Math.sin(angle2);
            
            let xIn1 = x + innerRadius * Math.cos(angle1);
            let zIn1 = z + innerRadius * Math.sin(angle1);
            let xIn2 = x + innerRadius * Math.cos(angle2);
            let zIn2 = z + innerRadius * Math.sin(angle2);
            
            mainVertices.push(xOut1, y, zOut1);
            mainVertices.push(xIn1, y, zIn1);
            mainVertices.push(xOut2, y, zOut2);
            
            mainVertices.push(xIn1, y, zIn1);
            mainVertices.push(xIn2, y, zIn2);
            mainVertices.push(xOut2, y, zOut2);
        }
        
        let mainBuffer = Render.getFloatBuffer(mainVertices);
        gl.glEnableClientState(GL10.GL_VERTEX_ARRAY);
        gl.glVertexPointer(3, GL10.GL_FLOAT, 0, mainBuffer);
        gl.glDrawArrays(GL10.GL_TRIANGLES, 0, mainVertices.length / 3);
        
        // Контур
        gl.glColor4f(1.0, 1.0, 1.0, currentAlpha * 1.5);
        gl.glLineWidth(2.0);
        
        // Внешний контур
        let outerVertices = [];
        for (let i = 0; i <= numSegments; i++) {
            let angle = angleStep * i;
            let x1 = x + radius * Math.cos(angle);
            let z1 = z + radius * Math.sin(angle);
            outerVertices.push(x1, y, z1);
        }
        
        let outerBuffer = Render.getFloatBuffer(outerVertices);
        gl.glVertexPointer(3, GL10.GL_FLOAT, 0, outerBuffer);
        gl.glDrawArrays(GL10.GL_LINE_STRIP, 0, outerVertices.length / 3);
        
        // Внутренний контур
        let innerVertices = [];
        for (let i = 0; i <= numSegments; i++) {
            let angle = angleStep * i;
            let x1 = x + innerRadius * Math.cos(angle);
            let z1 = z + innerRadius * Math.sin(angle);
            innerVertices.push(x1, y, z1);
        }
        
        let innerBuffer = Render.getFloatBuffer(innerVertices);
        gl.glVertexPointer(3, GL10.GL_FLOAT, 0, innerBuffer);
        gl.glDrawArrays(GL10.GL_LINE_STRIP, 0, innerVertices.length / 3);
        gl.glDisableClientState(GL10.GL_VERTEX_ARRAY);
        
        gl.glDepthMask(true);
        gl.glDisable(GL10.GL_BLEND);
    }
}

circleMod.setOnToggleListener(function() {
    if (!LocalPlayer.isInGame()) { print("Join world first!"); return; }
    if (!Render.initted) { Render.init(); }
});

function onFastTick() {
    if (circleMod.isActive() && LocalPlayer.isInGame() && Render.initted) {
        if (!isGLSurfaceViewRendering) {
            ctx.runOnUiThread(() => {
                Render.glSurface.setRenderMode(android.opengl.GLSurfaceView.RENDERMODE_CONTINUOUSLY);
            });
            isGLSurfaceViewRendering = true;
        }
    } else {
        if (isGLSurfaceViewRendering && Render.glSurface) {
            ctx.runOnUiThread(() => {
                Render.glSurface.setRenderMode(android.opengl.GLSurfaceView.RENDERMODE_WHEN_DIRTY);
            });
            isGLSurfaceViewRendering = false;
        }
    }
}

function onScriptEnabled() {
    ModuleManager.addModule(circleMod);
    wasOnGround = true;
    canCreateCircle = true;
    jumpTimer = 0;
}

function onScriptDisabled() {
    ModuleManager.removeModule(circleMod);
    circles = [];
    if (Render.glSurface) {
        ctx.runOnUiThread(() => {
            Render.glSurface.setRenderMode(android.opengl.GLSurfaceView.RENDERMODE_WHEN_DIRTY);
        });
        isGLSurfaceViewRendering = false;
    }
}