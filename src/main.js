import Vue from "vue";
import App from "./App.vue";
import whimClientVue from "whim-client-vue";
import moveMatrixes from "./assets/config/moveMatrixes";
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
    const pieceIndex = (value[1]?.pieces || []).findIndex(
      piece => piece.position[0] === place[0] && piece.position[1] === place[1]
    );
    const piece = (value[1]?.pieces || [])[pieceIndex];
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
  return Vue.prototype.$whim.users.map(user => user.id).indexOf(userId);
};

const dot = (matrix, vector) => {
  return matrix.map(row => {
    return row[0] * vector[0] + row[1] * vector[1];
  });
};

const multi = (k, matrix) => {
  return matrix.map(row => row.map(column => column * k));
};

Vue.prototype.$droppable = (originPlace, targetPlace) => {
  const piece = Vue.prototype.$piece(originPlace);
  const targetPiece = Vue.prototype.$piece(targetPlace);

  // コマが存在しない場合(手持ちから出す場合)
  if (piece === "hand") {
    return !targetPiece;
  }

  // 移動先に味方のコマが存在する場合
  if (targetPiece?.userId === Vue.prototype.$whim.accessUser.id) {
    return false;
  }

  const direction = piece.direction;

  let possibilityPlaces = [];

  let pieceLabel = piece.label;
  if (pieceLabel) {
    moveMatrixes[pieceLabel].map(mm => {
      let straightLen = 1;
      if (mm.straight) {
        straightLen = 8;
      }

      for (let k = 1; k <= straightLen; k++) {
        const place = dot(multi(k, mm.matrix), direction).map(
          (value, i) => value + originPlace[i]
        );
        // 他のコマは飛び越えられない
        possibilityPlaces.push(place);
        if (Vue.prototype.$piece(place)) {
          break;
        }
      }
    });
  }

  possibilityPlaces.flat();
  console.log(possibilityPlaces);
  return possibilityPlaces.some(
    pp => JSON.stringify(pp) === JSON.stringify(targetPlace)
  );
};

new Vue({
  render: h => h(App)
}).$mount("#app");
