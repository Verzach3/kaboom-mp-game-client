import "./style.css";
import kaboom from "kaboom";
import { io } from "socket.io-client";

const player = confirm("Press OK to start") ? "player1" : "player2";

const k = kaboom({
  height: 600,
  width: 800,
  letterbox: true,
  stretch: true,
  background: [255, 255, 128],
});
const debugflag = false;
const socket = io(`http://${debugflag ? "localhost" : "170.187.201.233" }:7000`);
socket.on("connect", () => {
  debug.log("Connected to server");
  console.log("[SERVER] connected");
});

const pointerPos = { x: 0, y: 0 };

let scores = {
  player1: 0,
  player2: 0,
};

// add paddles

const paddle1 = k.add([
  pos(40, 5),
  rect(20, 80),
  outline(4),
  origin,
  area(),
  "paddle1",
]);

const paddle2 = k.add([
  pos(width() - 70, 5),
  rect(20, 80),
  outline(4),
  origin,
  area(),
  "paddle2",
]);

// ball
let speed = 480;

const ball = k.add([
  pos(center()),
  circle(16),
  outline(4),
  area({ width: 32, height: 32, offset: vec2(-16) }),
  { vel: dir(rand(20, -20)) },
]);

// move ball, bounce it when touche horizontal edges, respawn when touch vertical edges
if (player === "player1") {
  debug.log("setted as master for ball");
  ball.onUpdate(() => {
    ball.move(ball.vel.scale(speed));
    if (ball.pos.x < 0 || ball.pos.x > width()) {
      scores = { player1: 0, player2: 0 };
      ball.pos = center();
      ball.vel = dir(rand(-20, 20));
      speed = 320;
    }
    if (ball.pos.y < 0 || ball.pos.y > height()) {
      ball.vel.y = -ball.vel.y;
    }
    socket.emit("ball", {
      x: ball.pos.x,
      y: ball.pos.y,
    });
  });
} else {
  debug.log("setted as slave for ball");
}

// move paddles with mouse/touch
// onUpdate("paddle1", (p) => {
//   p.pos.y = pointerPos.y
// })

socket.on(
  "pos-update",
  (posUpdate: {
    player1: { x: number; y: number };
    player2: { x: number; y: number };
  }) => {
    paddle1.moveTo(paddle1.pos.x, posUpdate.player1.y);
    paddle2.moveTo(paddle2.pos.x, posUpdate.player2.y);
  }
);

socket.on("ball", (ballUpdate: { x: number; y: number }) => {
  ball.moveTo(ballUpdate.x, ballUpdate.y);
});


onMouseMove((mousePos) => {
  socket.emit(player, mousePos);
  // pointerPos.y = mousePos.y
});

onTouchMove((_id, touchPos) => {
  socket.emit(player, touchPos);
  debug.log("touch Move")
  // pointerPos.y = touchPos.y
});

// bounce when touch paddle
ball.onCollide("paddle1", (p) => {
  speed += 60;
  ball.vel = dir(ball.pos.angle(p.pos));
  scores.player1++;
});

// bounce when touch paddle
ball.onCollide("paddle2", (p) => {
  speed += 60;
  ball.vel = dir(ball.pos.angle(p.pos));
  scores.player2++;
});

const pointsPlayer1 = add([
  text(scores.player1.toString()),
  pos(0, 0),
  origin,
  z(50),
  "points1",
]);

onUpdate("points1", (p) => {
  p.text = scores.player1;
});

const pointsPlayer2 = add([
  text(scores.player2.toString()),
  pos(750, 0),
  origin,
  z(50),
  "points2",
]);

onUpdate("points2", (p) => {
  p.text = scores.player2;
});
