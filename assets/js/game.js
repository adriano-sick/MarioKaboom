// Adriano Siqueira - 8/1/2021 - Mario Kaboom.JS

//IMPORTANTE: =====>>>>COMENTAR TODAS FUNÇÕES 'PLAY()' PRA CONSEGUIR RODAR LOCAL

kaboom({
    global: true,
    fullscreen: true,
    scale: 2.5,
    debug: true,
    clearColor: [0, 0, 0, 1],
});

const moveSpeed = 120;
const enemySpeed = 20;
const jumpForce = 360; 
const bigJumpForce = 550; 
const fallDeath = 400;
let currentJumpForce = jumpForce;
let isJumping = true;

loadSound('pnsc', './assets/sounds/pau_no_seu_cuogg.ogg');
loadSound('argh', './assets/sounds/tuzoarghogg.ogg');
loadSound('adivinha', './assets/sounds/adivinhaogg.ogg');
loadSound('spa', './assets/sounds/sperderamizade.ogg');

loadRoot('https://i.imgur.com/');
loadSprite('coin',                  'wbKxhcd.png');
loadSprite('pirocossaur',           'n1yqrNT.png');
loadSprite('brick',                 'pogC9x5.png');
loadSprite('block',                 'M6rwarW.png');
loadSprite('mario',                 'bw9dLhR.png');
loadSprite('mushroom',              '0wMd92p.png');
loadSprite('surprise',              'gesQ1KP.png');
loadSprite('unboxed',               'bdrLpi6.png');
loadSprite('pipe-top-left',         'ReTPiWY.png');
loadSprite('pipe-top-right',        'hj2GK4n.png');
loadSprite('pipe-bottom-left',      'c1cYSbt.png');
loadSprite('pipe-bottom-right',     'nqQ79eI.png');

loadSprite('blue-block',        'fVscIbn.png');
loadSprite('blue-brick',        '3e5YRQd.png');
loadSprite('blue-steel',        'gqVoI2b.png');
loadSprite('gih',               'Rk0fOaC.png');
loadSprite('blue-surprise',     'RMqCc1G.png');

scene("game", ({level, score}) => {

    layers(['bg', 'obj', 'ui'], 'obj');

    const maps = [
        [
            '                                      ',
            '                                      ',
            '                      z               ',
            '                                      ',
            '                                      ',
            '     %   =*=%=                        ',
            '                                      ',
            '               z      ^     -+        ',
            '                            ()        ',
            '==============================   =====',
          ],
          [
            '£                                       £',
            '£                                       £',
            '£                                       £',
            '£                                       £',
            '£                              ^        £',
            '£        @@@@@@              x x        £',
            '£                          x x x        £',
            '£              ^   z     x x x x  x   -+£',
            '£                      x x x x x  x   ()£',
            '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!',
          ]       
    ]

    const levelCfg = {
        width: 20,
        height: 20,
        '=': [sprite('block'), solid()],
        '$': [sprite('coin'), 'coin'],
        '%': [sprite('surprise'), solid(), 'coin-surprise'],
        '*': [sprite('surprise'), solid(), 'mushroom-surprise'],
        '}': [sprite('unboxed'), solid()],
        '(': [sprite('pipe-bottom-left'), solid(), scale(0.5)],
        ')': [sprite('pipe-bottom-right'), solid(), scale(0.5)],
        '-': [sprite('pipe-top-left'), solid(), scale(0.5), 'pipe'],
        '+': [sprite('pipe-top-right'), solid(), scale(0.5), 'pipe'],
        '^': [sprite('pirocossaur'), solid(), 'dangerous', body()],
        '#': [sprite('mushroom'), solid(), 'mushroom', body()],
        '!': [sprite('blue-block'), solid(), scale(0.5)],
        '£': [sprite('blue-brick'), solid(), scale(0.5)],
        'z': [sprite('gih'), solid(), scale(0.5), 'dangerous', body()],
        '@': [sprite('blue-surprise'), solid(), scale(0.5), 'coin-surprise'],
        'x': [sprite('blue-steel'), solid(), scale(0.5)]

    }

    const gameLevel = addLevel(maps[level], levelCfg);
    
    let scoreLabel = add([
        text('Score: ' + score),
        pos(10, 6),
        layer('ui'),
        {
            value: score,
        }
    ]);

    add([text('level ' + parseInt(level + 1)), pos(10, 8)]);

    function big() {
        let timer = 0;
        let isBig = false;
        return{
            update() {
                if (isBig) {
                    currentJumpForce = bigJumpForce;
                    timer -=dt();
                    if (timer <= 0) {
                        this.smallify();
                    }
                }
            },
            isBig() {
                return isBig;
            },
            smallify() {
                this.scale = vec2(1);
                currentJumpForce = jumpForce;
                timer = 0;
                isBig = false;
            },
            biggify(time) {
                this.scale = vec2(2);
                timer = time;
                isBig = true;
            }
        }
    }

    const player = add([
        sprite('mario'), solid(),
        pos(30, 0),
        body(),
        big(),
        origin('bot')
    ]);

    action('mushroom', (m) => {
        m.move(10, 0);
    });

    player.on('headbump', (obj) => {
        if (obj.is('coin-surprise')) {
            gameLevel.spawn('$', obj.gridPos.sub(0, 1));
            gameLevel.spawn('}', obj.gridPos.sub(0, 0));
            destroy(obj);
        }
        
        if (obj.is('mushroom-surprise')) {
            gameLevel.spawn('#', obj.gridPos.sub(0, 1));
            gameLevel.spawn('}', obj.gridPos.sub(0, 0));
            destroy(obj);
        }
    });

    player.collides('mushroom', (m) => {
        destroy(m);
        player.biggify(6);
        
    });

    player.collides('coin', (c) => {
        destroy(c);
        scoreLabel.value++;
        scoreLabel.text = 'Score: ' + scoreLabel.value;
    });

    action('dangerous', (d) => {        
        d.move( - enemySpeed, 0);
    });

    player.collides('dangerous', (d) => {
        if (isJumping) {
            play('argh');
            destroy(d);
            console.log(player.pos.x);
            console.log(player.pos.y);
        }
        else{            
            go('lose', {score: scoreLabel.value});           
        }
    });

    player.action(() => {
        camPos(player.pos);
        if (player.pos.y >= fallDeath){
            go('lose', {score: scoreLabel.value});
        }
    });

    player.collides('pipe', () => {
        keyPress('down', () => {
            play('adivinha');
            go('game', {
                level: (level + 1) % maps.length,
                score: scoreLabel.value
            });
        });
    });

    keyDown('left', () => {
        player.move( - moveSpeed, 0);
    });
    
    keyDown('right', () => {
        player.move(moveSpeed, 0);
    });

    player.action(() => {
        if (player.grounded()) {
            isJumping = false;
        } 
    });

    keyPress('space', () => {
        if(player.grounded()) {
            isJumping = true;
            player.jump(currentJumpForce);
        }
    });
});

scene('lose', ({score}) => {
    play('pnsc');
    add([text('Se fodeu!', 35), origin('center'), pos(width()/2, (height()/2) - 20)])   ;
    add([text('Score: ' + score, 32), origin('center'), pos(width()/2, height()/2 + 50)]);
});

start("game", {level: 0, score: 0});