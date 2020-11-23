let game = null;

const defaultAcrions = {
    '+' : 'right 90',
    '-' : 'left 90',
    '[' : 'stash',
    ']' : 'pop'
};

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.querySelector('#canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#ffffff';
});

function draw() {
    const vars = document.querySelector('#vars').value;
    const constants = document.querySelector('#constants').value;
    const start = document.querySelector('#start').value;
    const mutation = document.querySelector('#mutation').value;
    const angle = document.querySelector('#angle').value;

    const actions = document.querySelector('.dynamic');

    const startPos = new Dir(window.innerWidth / 2, 0, toRadian(angle));

    const regulations = new Regulations({
        vars,
        constants,
        start,
        mutation,
        actions
    });

    game = new LSystemBase({
        regulations,
        ctx,
        startPos,
        lineLength: 5
    });

    game.next();

}

function next() {
    if (!game) {
        draw();
    }

    game.next();
}


function updateDynamic() {
    const vars = document.querySelector('#vars').value;
    const constants = document.querySelector('#constants').value;
    const dynamic = document.querySelector('.dynamic');
    
    while(dynamic.lastChild) {
        dynamic.removeChild(dynamic.lastChild);
    }

    const appendNodes = (node, name) => {
        // <div class="label-wrapper"><label>X</label></div>
        // <textarea name="X"></textarea>
        // <br>

        const label = document.createElement('div');
        label.classList.add('label-wrapper');
        label.innerText = name;

        const textarea = document.createElement('textarea');
        textarea.name = name;
        textarea.value = defaultAcrions[name] || 'step';

        const br = document.createElement('br');

        node.appendChild(label);
        node.appendChild(textarea);
        node.appendChild(br);
    }

    (vars + constants).replace(/\s/g, '').split('').forEach((item) => {
        appendNodes(dynamic, item);
    });

}

function mouseWheel(event) {

    if (game) {
        const delta = (event.deltaY || event.detail) > 0 ? -1 : 1;
        const newLineLength = lineLength + delta * 0.1;
        if (newLineLength > 0) {
            lineLength = newLineLength;
        }
        game.update();
    }
}

let mousePressed = false;
let mousePos = null;

function mouseDown(event) {
    mousePos = {
        x: event.pageX,
        y: event.pageY
    };
}

function mouseMove(event) {
    if (mousePos && game) {
        const dev = {
            x: mousePos.x - event.pageX,
            y: mousePos.y - event.pageY
        };
        mousePos = {
            x: event.pageX,
            y: event.pageY
        };
        offset = {
            x: offset.x - dev.x,
            y: offset.y - dev.y
        };
        game.update();
    }
}

function mouseUp(event) {
    mousePos = null;
}

function spoiler(event) {
    this.expand = !this.expand;
    const menu = document.querySelector('.menu');
    event.target.textContent = this.expand ? '>>' : '<<';
    
    if (this.expand) {
        menu.classList.add('closed');
    } else {
        menu.classList.remove('closed');
    }
}