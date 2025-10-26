/**
 * Tagged bitmap literal converter
 * TODO: THIS SHOULD LIVE IN /bitmap
 */
//% shim=@f4 helper=bitmaps::ofBuffer blockIdentity="bitmaps._bitmap"
//% groups=["0.","1#","2T","3t","4N","5n","6G","7g","8","9","aAR","bBP","cCp","dDO","eEY","fFW"]
function bmp(lits: any, ...args: any[]): Bitmap { return null; }

namespace user_interface_base {
  /**
  * This is a wrapper around a Bitmap; which represents the screen.
  * Abstractions like Button, Cursor and Scene invoke this object.
  * It has static methods so you are also able to use it anywhere like so:
  * Screen.fill(6);
  */
  export class Screen {
    private static displayManager = display_devices.DisplayManager;

    static resetScreenImage(): void { Screen.currentDisplay.resetScreenImage(); }
    static setImageSize(width: number, height: number): void { }
    static drawTransparentImage(from: Bitmap, x: number, y: number): void { }
    static drawTransparentImageXfrm(xfrm: Affine, from: Bitmap, x: number, y: number): void { }
    static drawLine(x0: number, y0: number, x1: number, y1: number, c: number): void { }
    static drawLineXfrm(xfrm: Affine, x0: number, y0: number, x1: number, y1: number, c: number): void { }
    static drawLineShaded(x0: number, y0: number, x1: number, y1: number, shader: (x: number, y: number) => number): void { }
    static drawRect(x: number, y: number, width: number, height: number, c: number): void { }
    static drawRectXfrm(xfrm: Affine, x: number, y: number, width: number, height: number, c: number): void { }
    static fillRect(x: number, y: number, width: number, height: number, c: number): void { }
    static fillRectXfrm(xfrm: Affine, x: number, y: number, width: number, height: number, c: number): void { }
    static fillBoundsXfrm(xfrm: Affine, bounds: Bounds, c: number): void { }
    static drawBoundsXfrm(xfrm: Affine, bounds: Bounds, c: number): void { }
    static outlineBoundsXfrm(xfrm: Affine, bounds: Bounds, dist: number, c: number): void { }
    static outlineBoundsXfrm4(xfrm: Affine, bounds: Bounds, dist: number, colors: { top: number; left: number; right: number; bottom: number }): void { }
    static setPixel(x: number, y: number, c: number): void { }
    static setPixelXfrm(xfrm: Affine, x: number, y: number, c: number): void { }
    static print(text: string, x: number, y: number, color?: number, font?: bitmaps.Font, offsets?: texteffects.TextEffectState[]): void { }
    static printCenter(text: string, y: number, color?: number, font?: bitmaps.Font, offsets?: texteffects.TextEffectState[]): void { }
  }
}
