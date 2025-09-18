namespace user_interface_base {
    const INPUT_PRIORITY = 10
    const UPDATE_PRIORITY = 20
    const RENDER_PRIORITY = 30
    const SCREEN_PRIORITY = 100

    /**
    * Top-level abstraction drawn to the screen.
    * Extended by CursorScene when you want to have a GUI with Button support.
    * Useful if you: don't want buttons, aren't making a GUI, or to make a more complex GUI.
    * CursorScene overwrites a number of these abstract methods.
    */
    export abstract class Scene implements IComponent {
        private xfrm_: Affine
        private color_: number
        private backgroundCaptured_ = false

        //% blockCombine block="xfrm" callInDebugger
        public get xfrm() {
            return this.xfrm_
        }
        //% blockCombine block="color" callInDebugger
        public get backgroundColor() {
            return this.color_
        }
        public set backgroundColor(v) {
            this.color_ = v
        }

        constructor(public app?: AppInterface, public name?: string) {
            this.xfrm_ = new Affine()
            this.color_ = 12
        }

        /* abstract */ startup(controlSetupFn?: () => {}) {
            if (Options.menuProfiling) {
                context.onEvent(
                    ControllerButtonEvent.Pressed,
                    controller.menu.id,
                    () => {
                        control.heapSnapshot()
                    }
                )
            }
        }

        /* abstract */ shutdown() { }

        /* override */ activate() {
            profile()
        }

        /* override */ deactivate() {
            profile()
        }

        /* abstract */ update() { }

        /* abstract */ draw() { }

        protected handleClick(x: number, y: number) { }

        protected handleMove(x: number, y: number) { }

        protected handleWheel(dx: number, dy: number) { }

        get backgroundCaptured() {
            return !!this.backgroundCaptured_
        }

        /**
         * Captures the current screen image as background image. You must call releaseBackground to resume usual rendering.
         */
        captureBackground() {
            this.backgroundCaptured_ = true
        }

        releaseBackground() {
            this.backgroundCaptured_ = false
        }

        __init() {
            context.eventContext().registerFrameHandler(INPUT_PRIORITY, () => {
                control.enablePerfCounter()
                const dtms = (context.eventContext().deltaTime * 1000) | 0
                controller.left.__update(dtms)
                controller.right.__update(dtms)
                controller.up.__update(dtms)
                controller.down.__update(dtms)
            })
            // Setup frame callbacks.
            context.eventContext().registerFrameHandler(UPDATE_PRIORITY, () => {
                control.enablePerfCounter()
                this.update()
            })
            context.eventContext().registerFrameHandler(RENDER_PRIORITY, () => {
                control.enablePerfCounter()
                // perf: render directly on the background image buffer
                this.draw()
                if (Options.fps)
                    Screen.image.print(context.EventContext.lastStats, 1, 1, 15)
                if (screen() !== Screen.image)
                    screen().drawBitmap(Screen.image, 0, 0)
            })
            context.eventContext().registerFrameHandler(SCREEN_PRIORITY, () => {
                control.enablePerfCounter()
                control.__screen.update()
            })
        }
    }


    /**
    * This is an wrapper around a stack of scenes.
    * You can .push() and .pop() scenes to navigator your application.
    * In a microbit App this SceneManager is setup in app.ts,
    * which has a wrapper around SceneManager methods.
    * The app object is normally passed as a reference between scenes,
    * so that they can access this SceneManager.
    */
    export class SceneManager {
        scenes: Scene[]

        constructor() {
            this.scenes = []
        }

        public pushScene(scene: Scene) {
            const currScene = this.currScene()
            if (currScene) {
                currScene.deactivate()
            }
            context.pushEventContext()
            this.scenes.push(scene)
            scene.startup()
            scene.activate()
            scene.__init()
        }

        public popScene() {
            const prevScene = this.scenes.pop()
            if (prevScene) {
                prevScene.deactivate()
                prevScene.shutdown()
                context.popEventContext()
            }
            const currScene = this.currScene()
            if (currScene) {
                currScene.activate()
            }
        }

        private currScene(): Scene {
            if (this.scenes.length) {
                return this.scenes[this.scenes.length - 1]
            }
            return undefined
        }
    }
}
