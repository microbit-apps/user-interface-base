namespace microcode {
    import RowNavigator = user_interface_base.RowNavigator
    import Button = user_interface_base.Button

    // this adds accessibility for rule
    export class RuleRowNavigator extends RowNavigator {
        private rules: RuleDefn[]

        constructor() {
            super()
            this.rules = []
        }

        /* overrides */
        public clear() {
            super.clear()
            this.rules = []
        }

        public addRule(rule: RuleDefn) {
            this.rules.push(rule)
        }

        public atRuleStart() {
            return this.row >= 1 && this.col == 0
        }

        protected reportAria(ret: Button) {
            if (!ret) {
                return
            }

            let accessibilityMessage: accessibility.AccessibilityMessage
            if (this.row > 0 && this.col == 0) {
                const ruleDef = this.rules[this.row - 1]

                const whens = ruleDef.sensors
                    .concat(ruleDef.filters)
                    .map(s => tidToString(s))

                const dos: string[] = ruleDef.actuators
                    .concat(ruleDef.modifiers.map(t => getTid(t)))
                    .map(s => tidToString(s))

                accessibilityMessage = <accessibility.RuleAccessibilityMessage>{
                    type: "rule",
                    whens,
                    dos,
                }
            } else {
                accessibilityMessage = <accessibility.TileAccessibilityMessage>{
                    type: "tile",
                    value: (ret ? ret.ariaId : "") || "",
                    force: true,
                }
            }
            accessibility.setLiveContent(accessibilityMessage)
        }
    }
}
