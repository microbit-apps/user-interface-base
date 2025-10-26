namespace user_interface_base {
  import Affine = vector_math.Affine
  import Bounds = vector_math.Bounds
  import Vec2 = vector_math.Vec2
  import Screen = user_interface_base.Screen
  import IPlaceable = user_interface_base.IPlaceable
  import IComponent = user_interface_base.IComponent
  import Button = user_interface_base.Button


  //----------------------------------------------------------------------------------------------------------------
  // This is file is responsible for the Cursor, which is used by the Navigator to show which
  // buttons are highlighted over and to activate button.onClick() when the A button is pressed.
  // There is only one Cursor per Navigator, one Navigator per CursorScene, and one CursorScene
  // on the Screen at a time. The way the cursor moves over a row or grid of buttons is controlled by the Navigator.
  // The Cursor can change colour depending on a button state if you wish, see button.dynamicBoundaryColorsOn
  //
  // The Cursor has a reference to the Navigator which owns it, so that they can call each other.
  // The Cursor is also responsible for getting the (optional) text beneath a button and rendering it.
  //----------------------------------------------------------------------------------------------------------------


  /**
   * See .setOutlineColour()
   */
  const DEFAULT_CURSOR_OUTLINE_COLOUR: number = 9 // This is light blue.

  export type CursorCancelHandler = () => void

  export enum CursorDir {
    Up,
    Down,
    Left,
    Right,
    Back,
  }

  export interface CursorState {
    navigator: INavigator
    pos: Vec2
    ariaId: string
    size: Bounds
  }

  export class Cursor implements IComponent, IPlaceable {
    xfrm: Affine
    /** The cursor will call navigator.move() as appropriate. */
    navigator: INavigator
    cancelHandlerStack: CursorCancelHandler[]
    moveStartMs: number
    moveDest: Vec2
    ariaPos: Vec2
    ariaId: string
    size: Bounds
    borderThickness: number
    visible = true

    resetOutlineColourOnMove = false
    private cursorOutlineColour: number

    constructor() {
      this.xfrm = new Affine()
      this.cancelHandlerStack = []
      this.moveDest = new Vec2()
      this.borderThickness = 3
      this.setSize()

      this.cursorOutlineColour = DEFAULT_CURSOR_OUTLINE_COLOUR
    }


    /**
    * Mutates outlineColour, ariaContents and size as neccessary.
    * Used by CursorScene.
    */
    public moveTo(pos: Vec2, ariaId: string, sizeHint: Bounds) {
      if (this.resetOutlineColourOnMove)
        this.setOutlineColour(DEFAULT_CURSOR_OUTLINE_COLOUR)

      this.setSize(sizeHint)
      this.moveDest.copyFrom(pos)
      this.moveStartMs = control.millis()
      this.setAriaContent(ariaId)
    }

    /**
    * Fetch the text that goes beneath the button.
    */
    public setAriaContent(ariaId: string, ariaPos: Vec2 = null) {
      this.ariaId = ariaId || ""
      this.ariaPos = ariaPos
    }

    /**
    * Alternative to moveTo.
    * Used by CursorScene.
    */
    public snapTo(x: number, y: number, ariaId: string, sizeHint: Bounds) {
      this.setSize(
        sizeHint ||
        new Bounds({ left: 0, top: 0, width: 16, height: 16 }),
      )
      this.moveDest.x = this.xfrm.localPos.x = x
      this.moveDest.y = this.xfrm.localPos.y = y
      this.setAriaContent(ariaId)
    }

    public setSize(size?: Bounds) {
      size =
        size || new Bounds({ left: 0, top: 0, width: 16, height: 16 })
      if (this.size) this.size.copyFrom(size)
      else this.size = size.clone()
    }


    /**
    * Light blue by default.
    */
    public setOutlineColour(colour: number = 9) {
      // 9 is the DEFAULT_CURSOR_OUTLINE_COLOUR, which is light blue.
      this.cursorOutlineColour = colour
    }


    /**
    * Gets the state of the Cursor.
    * Used by picker.ts
    */
    public saveState(): CursorState {
      return {
        navigator: this.navigator,
        pos: this.xfrm.localPos.clone(),
        ariaId: this.ariaId,
        size: this.size.clone(),
      }
    }

    /**
    * Rebuild the cursor from a previously fetched state.
    * see .saveState().
    * Used by picker.ts
    */
    public restoreState(state: CursorState) {
      this.navigator = state.navigator
      this.xfrm.localPos.copyFrom(state.pos)
      this.moveDest.copyFrom(state.pos)
      this.ariaId = state.ariaId
      this.size.copyFrom(state.size)
    }


    /**
    * Tells the navigator to .move()
    */
    public move(dir: CursorDir): Button {
      return this.navigator.move(dir)
    }


    /**
    * Uses the navigator to find the hovered button, invokes it.
    */
    public click(): boolean {
      let target = this.navigator.getCurrent() //.sort((a, b) => a.z - b.z);
      if (target && target.clickable()) {
        target.toggleSelected()
        target.click()
        profile()
        return true
      }
      return false
    }

    public cancel(): boolean {
      if (this.cancelHandlerStack.length) {
        this.cancelHandlerStack[this.cancelHandlerStack.length - 1]()
        return true
      }
      return false
    }

    /**
    * How many times should the border around the button be drawn?
    */
    public setBorderThickness(thickness: number) {
      this.borderThickness = thickness
    }

    update() {
      this.xfrm.localPos.copyFrom(this.moveDest)
    }

    draw() {
      if (!this.visible) return

      // Draw the outline multiple times for a thicker border.
      // TODO: optimise this, and the underlying outlineBoundsXfrm, outlineBoundsXfrm invokes drawLine between 4 and 8 times each!
      for (let dist = 1; dist <= this.borderThickness; dist++) {
        Screen.outlineBoundsXfrm(
          this.xfrm,
          this.size,
          dist,
          this.cursorOutlineColour,
        )
      }

      const text = accessibility.ariaToTooltip(this.ariaId)
      if (text) {
        const pos = this.ariaPos || this.xfrm.localPos
        const n = text.length
        const w = font.charWidth * n
        const h = font.charHeight
        const x = Math.max(
          Screen.LEFT_EDGE + 1,
          Math.min(Screen.RIGHT_EDGE - 1 - w, pos.x - (w >> 1)),
        )
        const y = Math.min(
          pos.y + (this.size.width >> 1) + (font.charHeight >> 1) + 1,
          Screen.BOTTOM_EDGE - 1 - font.charHeight,
        )
        Screen.fillRect(x - 1, y - 1, w + 1, h + 2, 15)
        Screen.print(text, x, y, 1, font)
      }
    }
  }
}
