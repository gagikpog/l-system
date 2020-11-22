let offset = {
    x: 0,
    y: 0
}

let lineLength = 5;

function Dir(x = 0, y = 0, d = 0) {
    return typeof x === 'object' ? { ...x } : {x, y, d};
}

function toRadian(alpha) {
    return alpha * Math.PI / 180;
}

class LSystemBase {

    constructor(config) {
        this.regulations = config.regulations;
        this.ctx = config.ctx;
        this.str = (config.regulations.start || '').split('');

        this.height = window.innerHeight;
        this.width = window.innerWidth;

        this.initConfig = {...config};
    }

    _write() {
        this.turtle = new Turtle(this.initConfig);
        for (let i = 0; i < this.str.length; i++) {
            this.regulations[this.str[i]].action(this.turtle);
        }
    }

    _generate(arr) {
        const res = [];
        arr.forEach((char) => {
            res.push(...this.regulations[char].mutation.split(''));
        });
        return res;
    }

    next() {
        ctx.clearRect(0, 0, this.width, this.height);
        this.str = this._generate(this.str);
        this._write();
    }

    update() {
        ctx.clearRect(0, 0, this.width, this.height);
        this._write();
    }
    setLineLength(length) {
        this.turtle.lineLength = length;
    }
    getLineLength() {
        return this.turtle.lineLength;
    }

}

class Turtle {

    constructor(config) {
        this.pos = config.startPos || new Dir(0, 0, toRadian(90));
        this.ctx = config.ctx;
        // this.lineLength  = config.lineLength || 10;

        this.height = window.innerHeight;
        this.width = window.innerWidth;
        this.stack = [];
    }

    savePos() {
        this.stack.push(new Dir(this.pos));
    }

    applyPos() {
        this.pos = this.stack.pop();
    }

    step() {
        const end = this._getEndPos();
        this._drawLine(this.pos, end);
        this.pos = end;
    }

    left(angle = 90) {
        this.pos.d = this.pos.d + toRadian(angle)
    }

    right(angle = 90 ) {
        this.pos.d = this.pos.d - toRadian(angle)
    }

    _getEndPos() {
        const x = this.pos.x + Math.cos(this.pos.d) * lineLength;
        const y = this.pos.y + Math.sin(this.pos.d) * lineLength;
        return new Dir(x, y, this.pos.d);
    }

    _drawLine(p1, p2) {
        this.ctx.beginPath();
        this.ctx.moveTo(p1.x + offset.x, this.height - p1.y + offset.y);
        this.ctx.lineTo(p2.x + offset.x, this.height - p2.y + offset.y);
        this.ctx.closePath();
        this.ctx.stroke();
    }
}

function doAction (action) {

    let actions = action.split('\n');

    const callNumber = (turtle, value, command) => {
        const val = Number(value);
        if (Number.isFinite(val)) {
            turtle[command](val);
        } else {
            throw new Error(`Value "${val}" is not a number`);
        }
    };

    const commands = {
        step: (turtle) => {
            turtle.step();
        },
        stash: (turtle) => {
            turtle.savePos();
        },
        pop: (turtle) => {
            turtle.applyPos();
        },
        right: (turtle, value) => {
            callNumber(turtle, value, 'right');
        },
        left: (turtle, value) => {
            callNumber(turtle, value, 'left');
        }
    }

    actions = actions.map((a) => a.replace(/\s/g, ''));

    return (turtle) => {
        actions.forEach((a) => {
            try {
                if (commands[a]) {
                    commands[a](turtle);
                } else {
                    if (/^(left|right)/.test(a)) {
                        commands[a.replace(/\d/g, '')](turtle, a.replace(/^(left|right)/, ''));
                    } else {
                        // console.log(`Command "${a}" not find`);
                    }
                }
            } catch (error) {
                console.log(error.message);
            }
        })
    }
}

class Regulations {
    constructor(config) {
        const vars = config.vars || '';
        const constants = config.constants || '';
        const mutation = config.mutation || '';
        const actions = config.actions;
        this.start = config.start;

        vars.replace(/\s/g, '').split('').forEach((_var) => {
            const action = actions.children[_var].value;
            this[_var] = {
                action: doAction(action)
            };
        });

        constants.replace(/\s/g, '').split('').forEach((_const) => {
            const action = actions.children[_const].value;
            this[_const] = {
                mutation: _const,
                action: doAction(action)
            };
        });

        const mutations = mutation.replace(/\s/g, '').split(',');
        mutations.forEach((item) => {
            const content = /\(.*\)/.test(item) ? item.replace(/\(|\)/g, '') : item;
            const key = /^.:/.test(content) && content[0]
            if (!key) {
                throw new Error(`Key of "${item}" not find`);
            }
            this[key].mutation = content.slice(2);
        });

    }
}
