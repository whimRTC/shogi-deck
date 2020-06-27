import Vue from "vue";
import App from "./App.vue";
import whimClientVue from "whim-client-vue";
import "whim-client-vue/dist/whim-client-vue.css";
import "./assets/common.scss";
import "./utils/dnd-polyfill";

Vue.config.productionTip = false;
Vue.use(whimClientVue);

// settings for debug
let recaptchaScript = document.createElement("script");
recaptchaScript.setAttribute("src", "http://localhost:8098");
document.head.appendChild(recaptchaScript);

Vue.prototype.$piece = place => {
  if (place === "hand") {
    return "hand";
  }
  const stateArray = Object.entries(Vue.prototype.$whim.state);
  let self = null;

  stateArray.forEach(value => {
    const pieceIndex = (value[1].pieces || []).findIndex(
      piece => piece.position[0] === place[0] && piece.position[1] === place[1]
    );
    const piece = (value[1].pieces || [])[pieceIndex];
    if (piece) {
      // console.log(piece);
      self = {
        id: pieceIndex,
        userId: value[0],
        direction: value[1].direction,
        label: piece.label,
        position: piece.position
      };
    }
  });

  return self;
};

Vue.prototype.$turnNumber = userId => {
  return Vue.prototype.$whim.state.turnOrder?.indexOf(userId);
};

const dot = (matrix, vector) => {
  return matrix.map(row => {
    return row[0] * vector[0] + row[1] * vector[1];
  });
};

const moveMatrix = {
  fu: [
    [
      [1, 0],
      [0, 1]
    ]
  ],
  ou: [
    [
      [1, 0],
      [0, 1]
    ],
    [
      [1, 0],
      [0, -1]
    ],
    [
      [-1, 0],
      [0, 1]
    ],
    [
      [-1, 0],
      [0, -1]
    ]
  ]
};

Vue.prototype.$droppable = (originPlace, targetPlace) => {
  const piece = Vue.prototype.$piece(originPlace);
  const targetPiece = Vue.prototype.$piece(targetPlace);
  console.log(piece);

  // コマが存在しない場合(手持ちから出す場合)
  if (piece === "hand") {
    return !targetPiece;
  }

  // 移動先に味方のコマが存在する場合
  if (targetPiece?.userId === Vue.prototype.$whim.accessUser.id) {
    return false;
  }

  const direction = piece.direction;

  const x = originPlace[0];
  const y = originPlace[1];
  let possibilityPlaces = [];
  if (piece.label === "kaku") {
    const kakuDirections = [
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1]
    ];
    kakuDirections.forEach(kakuDirection => {
      for (let i = 1; i <= 5; i++) {
        const movedPlace = [x + kakuDirection[0] * i, y + kakuDirection[1] * i];
        possibilityPlaces.push(movedPlace);
        // 他のコマは飛び越えられない
        if (Vue.prototype.$piece(movedPlace)) {
          break;
        }
      }
    });
  } else if (piece.label === "hisha") {
    const hishaDirections = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1]
    ];
    hishaDirections.forEach(hishaDirection => {
      for (let i = 1; i <= 5; i++) {
        const movedPlace = [
          x + hishaDirection[0] * i,
          y + hishaDirection[1] * i
        ];
        possibilityPlaces.push(movedPlace);
        // 他のコマは飛び越えられない
        if (Vue.prototype.$piece(movedPlace)) {
          break;
        }
      }
    });
  } else {
    possibilityPlaces = moveMatrix[piece.label].map(mm =>
      dot(mm, direction).map((value, i) => value + originPlace[i])
    );
  }
  console.log(possibilityPlaces);
  return possibilityPlaces.some(
    pp => JSON.stringify(pp) === JSON.stringify(targetPlace)
  );
};

new Vue({
  render: h => h(App)
}).$mount("#app");
