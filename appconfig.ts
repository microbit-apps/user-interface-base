namespace user_interface_base {
    export const font = bitmaps.font8
    export let getIcon: (name: string | number , nullIfMissing: boolean) => Bitmap  = null
    export let resolveTooltip: (ariaId: string) => string = null
    export interface AppInterface {
        pushScene(scene: Scene): void
        popScene(): void
        save(slot: string, buffer: Buffer): boolean
        load(slot: string): Buffer
    }
}