namespace user_interface_base {
    /**
    * A Navigator is a wrapper over a group of buttons.
    * It is owned by a CursorScene. When you press a physical button on a controller,
    * the cursor will invoke methods on the Navigator and Cursor to change the GUI.
    * Dynamically adding or removing buttons is supported.
    * The main types of Navigator are Row and Grid.
    *
    * You do not need to hold references to buttons locally, they can all be held in here.
    * Ensure that this.navigator.drawComponents() is invoked in your CursorScene.draw()
    */
    export interface INavigator {
        clear: () => void
        setBtns: (btns: Button[][]) => void
        addRow: (btns: Button[]) => void
        addCol: (btns: Button[]) => void
        getRow: () => number
        getCol: () => number
        move: (dir: CursorDir) => Button
        getCurrent: () => Button
        screenToButton: (x: number, y: number) => Button
        initialCursor: (row: number, col: number) => Button
        updateAria: () => void
        drawComponents(): void;
    }

    export const BACK_BUTTON_ERROR_KIND = "back_button"
    export const FORWARD_BUTTON_ERROR_KIND = "forward_button"
    export class NavigationError {
        kind: string
        constructor(kind: string) {
            this.kind = kind
        }
    }


    /**
    * A ragged rows of buttons
    * When B is pressed the CursorScene, but not the CursorSceneWithPriorPage,
    * will tell this Navigator to show the Cursor as hovering over the first button again.
    * You can have multiple rows (addRow() is supported) if you wish,
    * But the GridNavigator is recommended for that usecase.
    */
    export class RowNavigator implements INavigator {
        /** This can be used to support multiple Rows, but this is not recommended. */
        protected buttonGroups: Button[][]
        protected row: number
        protected col: number

        constructor() {
            this.buttonGroups = []
            this.row = 0;
            this.col = 0;
        }

        public clear() {
            this.buttonGroups = []
        }

        public getRow() {
            return this.row
        }
  
        public getCol() {
          return this.col;
        }

        public setBtns(btns: Button[][]) {
            this.buttonGroups = btns
        }

        public addRow(btns: Button[]) {
            this.buttonGroups.push(btns)
        }

        /**
        * Append a col during runtime.
        * Does not need to be the same size as the grid height
        * @param btns
        */
        public addCol(btns: Button[]) {
            for (let i = 0; i < btns.length; i++) {
                this.buttonGroups[i].push(btns[i]);
            }
        }

        /**
        * Invoke .draw() on each button
        */
        public drawComponents() {
            this.buttonGroups.forEach(row => {
                row.forEach(btn => { btn.draw() })
            })
        }

        public screenToButton(x: number, y: number): Button {
            const p = new Vec2(x, y)
            for (let row = 0; row < this.buttonGroups.length; row++) {
                const buttons = this.buttonGroups[row]
                const target = buttons.find(btn =>
                    Bounds.Translate(btn.bounds, btn.xfrm.worldPos).contains(p)
                )
                if (target) {
                    this.row = row
                    this.col = buttons.indexOf(target)
                    return target
                }
            }
            return undefined
        }

        /**
        * Invoked by the CursorScene.
        */
        public move(dir: CursorDir) {
            this.makeGood()
            switch (dir) {
                case CursorDir.Up: {
                    if (this.row == 0)
                        throw new NavigationError(BACK_BUTTON_ERROR_KIND)
                    this.row--
                    // because the column in new row may be out of bounds
                    this.makeGood()
                    break
                }

                case CursorDir.Down: {
                    if (this.row == this.buttonGroups.length - 1)
                        throw new NavigationError(FORWARD_BUTTON_ERROR_KIND)
                    this.row++
                    // because the column in new row may be out of bounds
                    this.makeGood()
                    break
                }

                case CursorDir.Left: {
                    if (this.col == 0) {
                        if (this.row > 0) {
                            this.row--
                        } else {
                            this.row = this.buttonGroups.length - 1
                        }
                        this.col = this.buttonGroups[this.row].length - 1
                    } else this.col--
                    break
                }

                case CursorDir.Right: {
                    if (this.col == this.buttonGroups[this.row].length - 1) {
                        if (this.row < this.buttonGroups.length - 1) {
                            this.row++
                        } else {
                            this.row = 0
                        }
                        this.col = -1
                    }
                    this.col++
                    break
                }

                case CursorDir.Back: {
                    if (this.col > 0) this.col = 0
                    else if (this.row > 0) this.row--
                    else return undefined
                    break
                }
            }

            const btn = this.buttonGroups[this.row][this.col]
            this.reportAria(btn)
            return btn
        }

        public updateAria() {
            this.reportAria(this.getCurrent())
        }

        protected reportAria(btn: Button) {
            if (btn) btn.reportAria(true)
        }

        public getCurrent(): Button {
            return this.buttonGroups[this.row][this.col]
        }
        
        /**
        * Helper function to ensure .row and .col are not out of bounds.
        */
        protected makeGood() {
            if (this.row >= this.buttonGroups.length)
                this.row = this.buttonGroups.length - 1
            if (this.col >= this.buttonGroups[this.row].length)
                this.col = this.buttonGroups[this.row].length - 1
        }


        /**
        * Ensure that the default cursor position is inbounds.
        */
        public initialCursor(row: number = 0, col: number = 0) {
            const rows = this.buttonGroups.length
            while (row < 0) row = (row + rows) % rows
            const cols = this.buttonGroups[row].length
            while (col < 0) col = (col + cols) % cols
            this.row = row
            this.col = col
            return this.buttonGroups[row][col]
        }
    }


    /**
    * A Navigator for hetrogenous rows and columns.
    */
    export class GridNavigator extends RowNavigator {
        private height: number;
        private widths: number[];

        constructor(btns?: Button[][]) {
            super()

            if (btns) {
                this.buttonGroups = btns
                this.widths = btns.map(row => row.length)
                this.height = btns.length
            } else {
                this.height = 0;
                this.widths = []
            }
        }

        public getRow() {
            return this.row
        }
  
        public getCol() {
          return this.col;
        }

        public setBtns(btns: Button[][]) {
            this.buttonGroups = btns
            this.widths = btns.map(row => row.length)
            this.height = btns.length
        }


        /**
        * Append a row during runtime.
        * @param btns
        */
        public addRow(btns: Button[]) {
            this.buttonGroups.push(btns)
            this.widths.push(btns.length)
            this.height++
        }

        /**
        * Append a col during runtime.
        * Does not need to be the same size as the grid height
        * @param btns
        */
        public addCol(btns: Button[]) {
            for (let i = 0; i < btns.length; i++) {
                this.buttonGroups[i].push(btns[i]);
                this.widths[i]++;
            }
        }

        public move(dir: CursorDir) {
            switch (dir) {
                case CursorDir.Up: {
                    this.row = (((this.row - 1) % this.height) + this.height) % this.height; // Non-negative modulo

                    // Row above could have less cols, adjust if neccessary:
                    if (this.widths[this.row] <= this.col)
                        this.col = this.widths[this.row] - 1

                    break
                }

                case CursorDir.Down: {
                    this.row = (this.row + 1) % this.height;

                    // Row below could have less cols, adjust if neccessary:
                    if (this.widths[this.row] <= this.col)
                        this.col = this.widths[this.row] - 1

                    break
                }

                case CursorDir.Left: {
                    if (this.widths[this.row] == 1)
                        break
                    else if (this.col == 0)
                        this.col = this.widths[this.row] - 1
                    else
                        this.col -= 1
                    break
                }

                case CursorDir.Right: {
                    if (this.widths[this.row] == 1)
                        break
                    if (this.col == this.widths[this.row])
                        this.col = 0
                    else
                        this.col = (this.col + 1) % this.widths[this.row]
                    break
                }

                case CursorDir.Back: {
                    if (this.col > 0) this.col = 0
                    else if (this.row > 0) this.row--
                    else return undefined
                    break
                }
            }

            const btn = this.buttonGroups[this.row][this.col]
            this.reportAria(btn)
            return btn
        }

        public getCurrent(): Button {
            return this.buttonGroups[this.row][this.col];
        }
    }


    /**
    * Mostly a matrix, except for last row, which may be ragged
    * Supports delete button
    */
    export class PickerNavigator implements INavigator {
        protected deleteButton: Button
        protected row: number
        protected col: number

        constructor(private picker: Picker) {
            this.row = 0;
            this.col = 0;
        }

        private get width() {
            return this.picker.width
        }
        private get length() {
            return this.picker.group.defs.length
        }

        get hasDelete() {
            return !!this.deleteButton
        }

        public getRow() {
            return this.row
        }
  
        public getCol() {
          return this.col;
        }

        public setBtns(btns: Button[][]) { }
        public addRow(btns: Button[]) { }
        public addCol(btns: Button[]) { }


        moveToIndex(index: number) {
            control.assert(index < this.length, "index out of bounds")
            this.row = Math.idiv(index, this.width)
            this.col = index % this.width
            this.reportAria()
            return this.picker.group.getButtonAtIndex(index)
        }

        private height() {
            return Math.ceil(this.length / this.width)
        }

        private currentRowWidth() {
            control.assert(this.row >= 0, "row out of bounds")
            return this.row < this.height() - 1
                ? this.width
                : this.length - this.width * (this.height() - 1)
        }

        public initialCursor(row: number = 0, col: number = 0): Button {
            this.row = row
            this.col = col
            const btn = this.getCurrent()
            if (btn) {
                this.reportAria()
                return undefined // TODO
            }
            return undefined
        }

        clear() {
            this.deleteButton = undefined
        }

        addButtons(btns: ButtonBase[]) { }

        addDelete(btn: Button) {
            this.deleteButton = btn
        }

        public drawComponents() { }

        getCurrent() {
            // console.log(`row: ${this.row}, col: ${this.col}`)
            if (this.row == -1) {
                return this.deleteButton
            } else {
                const index = this.row * this.width + this.col
                if (index < this.length)
                    return this.picker.group.getButtonAtIndex(index)
            }
            return undefined
        }

        screenToButton(x: number, y: number): Button {
            const p = new Vec2(x, y)
            const btn = this.deleteButton
            if (
                btn &&
                Bounds.Translate(btn.bounds, btn.xfrm.worldPos).contains(p)
            )
                return btn
            const np = this.picker.group.getButtonAtScreen(x, y)
            if (np) {
                this.row = np.y
                this.col = np.x
                if (this.col >= this.currentRowWidth())
                    this.col = this.currentRowWidth() - 1
                return this.getCurrent()
            }
            return undefined
        }

        move(dir: CursorDir) {
            switch (dir) {
                case CursorDir.Up: {
                    if (this.row == -1 || (!this.deleteButton && this.row == 0))
                        throw new NavigationError(BACK_BUTTON_ERROR_KIND)
                    if (this.row > 0) this.row--
                    else if (this.deleteButton) this.row = -1
                    break
                }
                case CursorDir.Down: {
                    if (this.row < this.height() - 1) {
                        this.row++
                        if (this.col >= this.currentRowWidth()) {
                            this.col = this.currentRowWidth() - 1
                        }
                    } else throw new NavigationError(FORWARD_BUTTON_ERROR_KIND)
                    break
                }
                case CursorDir.Left: {
                    if (this.col > 0) this.col--
                    else if (this.row > 0) {
                        this.row--
                        this.col = this.width - 1
                    } else if (this.deleteButton) {
                        this.row = -1
                    }
                    break
                }
                case CursorDir.Right: {
                    if (this.row == -1) {
                        this.row = 0
                        this.col = 0
                    } else if (this.col < this.currentRowWidth() - 1) this.col++
                    else if (this.row < this.height() - 1) {
                        this.row++
                        this.col = 0
                    }
                    break
                }
            }
            this.reportAria()
            return this.getCurrent()
        }

        public updateAria() {
            this.reportAria()
        }

        protected reportAria() {
            // if (this.row == -1) {
            //     accessibility.setLiveContent(<
            //         accessibility.TextAccessibilityMessage
            //         >{
            //             type: "text",
            //             value: "delete_tile",
            //             force: true,
            //         })
            // }
        }
    }

    // accessibility for LEDs
    export class LEDNavigator extends PickerNavigator {
        constructor(picker: Picker) {
            super(picker)
            this.row = 2
            this.col = 2
        }
        protected reportAria() {
            // super.reportAria()
            // if (this.row == -1) return
            // const on = true // TODO: btn.getIcon() == "solid_red"
            // accessibility.setLiveContent(<
            //     accessibility.LEDAccessibilityMessage
            //     >{
            //         type: "led",
            //         on,
            //         x: this.col,
            //         y: this.row,
            //         force: true,
            //     })
        }
    }

    // accessibility for melody
    export class MelodyNavigator extends PickerNavigator {
        constructor(picker: Picker) {
            super(picker)
            this.row = 2
            this.col = 2
        }
        protected reportAria() {
            // super.reportAria()
            // if (this.row == -1) return
            // const on = true // TODO btn.getIcon() === "note_on"
            // const index = this.hasDelete ? this.row - 1 : this.row
            // accessibility.setLiveContent(<
            //     accessibility.NoteAccessibilityMessage
            //     >{
            //         type: "note",
            //         on,
            //         index,
            //         force: true,
            //     })
        }
    }
}
