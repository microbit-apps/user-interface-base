namespace microcode {
    import AppInterface = user_interface_base.AppInterface
    import Scene = user_interface_base.Scene
    import SceneManager = user_interface_base.SceneManager

    // Auto-save slot
    export const SAVESLOT_AUTO = "sa"

    export interface SavedState {
        progdef: any
        version?: string
    }

    export class App implements AppInterface {
        sceneManager: SceneManager

        constructor() {
            // One interval delay to ensure all static constructors have executed.
            basic.pause(500)
            reportEvent("app.start")

            controller.setRepeatDefault(250, 30)
            // keymap.setupKeys()
            this.sceneManager = new SceneManager()
            const home = new Home(this)
            this.pushScene(home)
        }

        public saveBuffer(slot: string, buf: Buffer) {
            reportEvent("app.save", { slot: slot, size: buf.length })
            console.log(`save to ${slot}: ${buf.length}b`)
            profile()
            settings.writeBuffer(slot, buf)
        }

        public save(slot: string, prog: ProgramDefn) {
            this.saveBuffer(slot, prog.toBuffer())
        }

        public load(slot: string): ProgramDefn {
            try {
                let buf = settings.readBuffer(slot)
                if (buf) {
                    return ProgramDefn.fromBuffer(new BufferReader(buf))
                }
            } catch (e) {
                console.log(e)
            }
            return undefined
        }

        public pushScene(scene: Scene) {
            this.sceneManager.pushScene(scene)
        }

        public popScene() {
            this.sceneManager.popScene()
        }
    }
}
