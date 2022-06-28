const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = 1024;
canvas.height = 576;

c.fillRect(0, 0, canvas.width, canvas.height);

const gravity = 0.7;

let lastkey;

const background = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  imageSrc: "./img/background.png",
});

const shop = new Sprite({
  position: {
    x: 608,
    y: 128,
  },
  imageSrc: "./img/shop.png",
  scale: 2.75,
  framesMax: 6,
});

const player = new Fighter({
  position: { x: 0, y: 0 },
  velocity: { x: 0, y: 0 },
  imageSrc: "./img/samuraiMack/Idle.png",
  framesMax: 8,
  scale: 2.5,
  offset: { x: 215, y: 157 },
  sprites: {
    idle: {
      imageSrc: "./img/samuraiMack/Idle.png",
      framesMax: 8,
    },
    run: {
      imageSrc: "./img/samuraiMack/Run.png",
      framesMax: 8,
    },
    jump: {
      imageSrc: "./img/samuraiMack/Jump.png",
      framesMax: 2,
    },
    fall: {
      imageSrc: "./img/samuraiMack/Fall.png",
      framesMax: 2,
    },
    attack1: {
      imageSrc: "./img/samuraiMack/Attack1.png",
      framesMax: 6,
    },
    takeHit: {
      imageSrc: "./img/samuraiMack/Take Hit - white silhouette.png",
      framesMax: 4,
    },
    death: {
      imageSrc: "./img/samuraiMack/Death.png",
      framesMax: 6,
    },
  },
  attackBox: {
    offset: {
      x: 100,
      y: 50,
    },
    width: 160,
    height: 50,
  },
});

const enemy = new Fighter({
  position: { x: 400, y: 100 },
  velocity: { x: 0, y: 0 },
  imageSrc: "./img/kenji/Idle.png",
  framesMax: 4,
  scale: 2.5,
  offset: { x: 215, y: 167 },
  sprites: {
    idle: {
      imageSrc: "./img/kenji/Idle.png",
      framesMax: 4,
    },
    run: {
      imageSrc: "./img/kenji/Run.png",
      framesMax: 8,
    },
    jump: {
      imageSrc: "./img/kenji/Jump.png",
      framesMax: 2,
    },
    fall: {
      imageSrc: "./img/kenji/Fall.png",
      framesMax: 2,
    },
    attack1: {
      imageSrc: "./img/kenji/Attack1.png",
      framesMax: 4,
    },
    takeHit: {
      imageSrc: "./img/kenji/Take hit.png",
      framesMax: 3,
    },
    death: {
      imageSrc: "./img/kenji/Death.png",
      framesMax: 7,
    },
  },
  attackBox: {
    offset: {
      x: -170,
      y: 50,
    },
    width: 170,
    height: 50,
  },
});

const keys = {
  d: { pressed: false },
  a: { pressed: false },
  ArrowRight: { pressed: false },
  ArrowLeft: { pressed: false },
};

decreaseTimer();

// animation loop
function gameAnimate() {
  window.requestAnimationFrame(gameAnimate);
  c.fillStyle = "black";
  c.fillRect(0, 0, canvas.width, canvas.height);
  background.update();
  shop.update();
  c.fillStyle = "rgba(255,255,255,0.15)";
  c.fillRect(0, 0, canvas.width, canvas.height);
  player.update();
  enemy.update();

  player.velocity.x = 0;
  enemy.velocity.x = 0;

  // player movment

  if (keys.d.pressed && player.lastkey === "d") {
    player.velocity.x = 5;
    player.switchSprite("run");
  } else if (keys.a.pressed && player.lastkey === "a") {
    player.velocity.x = -5;
    player.switchSprite("run");
  } else {
    player.switchSprite("idle");
  }

  // player jumping
  if (player.velocity.y < 0) {
    player.switchSprite("jump");
  } else if (player.velocity.y > 0) {
    player.switchSprite("fall");
  }

  // enemy movment
  if (keys.ArrowRight.pressed && enemy.lastkey === "ArrowRight") {
    enemy.velocity.x = 5;
    enemy.switchSprite("run");
  } else if (keys.ArrowLeft.pressed && enemy.lastkey === "ArrowLeft") {
    enemy.velocity.x = -5;
    enemy.switchSprite("run");
  } else {
    enemy.switchSprite("idle");
  }

  // enemy jumping
  if (enemy.velocity.y < 0) {
    enemy.switchSprite("jump");
  } else if (enemy.velocity.y > 0) {
    enemy.switchSprite("fall");
  }

  // detect for collison
  if (
    rectangularCollision({ rectangle1: player, rectangle2: enemy }) &&
    player.isAttacking &&
    player.frameCurrent === 4
  ) {
    enemy.takeHit();
    player.isAttacking = false;
    gsap.to("#enemyHealth", {
      width: `${enemy.health}%`,
    });
  }

  // if player missing
  if (player.isAttacking && player.frameCurrent === 4) {
    player.isAttacking = false;
  }

  if (
    rectangularCollision({ rectangle1: enemy, rectangle2: player }) &&
    enemy.isAttacking &&
    enemy.frameCurrent === 2
  ) {
    player.takeHit();
    enemy.isAttacking = false;

    gsap.to("#playerHealth", {
      width: `${player.health}%`,
    });
  }

  // if enemy missing
  if (enemy.isAttacking && enemy.frameCurrent === 2) {
    enemy.isAttacking = false;
  }

  //  end game based on health
  if (enemy.health <= 0 || player.health <= 0) {
    determineWinner({ player, enemy, timerId });
  }
}

gameAnimate();

window.addEventListener("keydown", (e) => {
  if (!player.death) {
    switch (e.key) {
      case "d":
        keys.d.pressed = true;
        player.lastkey = "d";
        break;

      case "a":
        keys.a.pressed = true;
        player.lastkey = "a";
        break;

      case "w":
        player.velocity.y = -20;
        break;

      case " ":
        player.attack();
        break;
    }
  }

    if (!enemy.death) {
      switch (e.key) {
        case "ArrowRight":
          keys.ArrowRight.pressed = true;
          enemy.lastkey = "ArrowRight";
          break;

        case "ArrowLeft":
          keys.ArrowLeft.pressed = true;
          enemy.lastkey = "ArrowLeft";
          break;

        case "ArrowUp":
          enemy.velocity.y = -20;
          break;

        case "Enter":
          enemy.attack();
          break;
      }
    }
  
});

window.addEventListener("keyup", (e) => {
  switch (e.key) {
    case "d":
      keys.d.pressed = false;
      break;

    case "a":
      keys.a.pressed = false;
      break;

    case "ArrowRight":
      keys.ArrowRight.pressed = false;
      break;

    case "ArrowLeft":
      keys.ArrowLeft.pressed = false;
      break;
  }
});
