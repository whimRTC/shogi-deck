<template>
  <div class="main" :class="`area-${areaLength}`">
    <div class="order">
      <div
        class="circle-0"
        :class="`active-${$whim.state.currentTurnIndex}`"
      ></div>

      <template v-for="player in this.$whim.users.length - 1">
        <a href="#" class="arrow" :key="`arrow-${player}`"></a>
        <div
          :key="player"
          :class="[
            `circle-${player}`,
            `active-${$whim.state.currentTurnIndex}`
          ]"
        ></div>
      </template>
    </div>
    <div v-for="x in xRange" :key="x" class="row" :class="`row-${x}`">
      <div
        v-for="y in yRange"
        :key="y"
        class="col"
        @drop="dropPiece($event, [x, y])"
        @dragover.prevent
        @dragenter.prevent
      >
        <Piece
          :place="transformCoordinate([x, y])"
          @dragging="setDragging"
          :dragging="dragging"
        />
      </div>
    </div>
    <div class="flex">
      <div
        class="hands"
        :class="[
          `background-${$whim.accessUser.positionNumber - 1}`,
          `active-${$whim.state.currentTurnIndex}`
        ]"
      >
        <Hand
          v-for="i in myHands"
          :key="i"
          :handIndex="i"
          @dragging="setDragging"
        ></Hand>
      </div>
      <img class="image" src="@/assets/images/deck.png" @click="drawPiece" />
    </div>
    <div class="modal" v-if="judgeNariginId">
      <div class="modal__bg"></div>
      <div class="modal__content">
        <img
          src="@/assets/images/gin.png"
          class="piece"
          @click="nariGin(false)"
        />
        <img
          src="@/assets/images/narigin.png"
          class="select-piece"
          @click="nariGin(true)"
        />
      </div>
      <!--modal__inner-->
    </div>
    <!--modal-->
  </div>
</template>

<script>
import { Howl } from "howler";

const areaLength = {
  2: 5,
  3: 6,
  4: 6,
  5: 7,
  6: 7,
  7: 8,
  8: 8
};

const NARIGOMA = {
  fu: "to",
  kyosya: "narikyo",
  keima: "narikei",
  gin: "narigin",
  kaku: "ryuma",
  hisya: "ryuo"
};

const SE_MOVE = new Howl({
  src: require("@/assets/shogi.mp3")
});

function random(a) {
  return a[Math.floor(Math.random() * a.length)];
}

const equals = (arr1, arr2) => {
  return JSON.stringify(arr1) === JSON.stringify(arr2);
};

export default {
  name: "Main",
  data() {
    return {
      dragging: null,
      judgeNariginId: null
    };
  },
  components: {
    Piece: () => import("@/components/main/Piece"),
    Hand: () => import("@/components/main/Hand")
  },
  computed: {
    areaLength() {
      return areaLength[this.$whim.users.length];
    },
    myDirection() {
      return this.$whim.state[this.$whim.accessUser.id].direction;
    },
    xRange() {
      return Array.from({ length: this.areaLength }, (v, k) => k);
    },
    yRange() {
      return Array.from({ length: this.areaLength }, (v, k) => k);
    },
    hands() {
      return (this.$whim.state.hand || {})[this.$whim.state.currentTurnIndex];
    },
    myHands() {
      console.log(this.$whim.state[this.$whim.accessUser.id].pieces);
      return this.$whim.state[this.$whim.accessUser.id].pieces?.reduce(function(
        a,
        e,
        i
      ) {
        if (e.position === "hand") a.push(i);
        return a;
      },
      []); // [0, 3, 5]
    },
    sound() {
      return this.$whim.state.sound;
    }
  },
  methods: {
    setDragging(payload) {
      this.dragging = payload;
    },

    // 相対座標から絶対座標へ
    transformCoordinate(position) {
      if (equals(this.myDirection, [1, 0])) {
        return [
          this.areaLength - 1 - position[0],
          this.areaLength - 1 - position[1]
        ];
      } else if (equals(this.myDirection, [-1, 0])) {
        return position;
      } else if (equals(this.myDirection, [0, 1])) {
        return [position[1], this.areaLength - 1 - position[0]];
      } else {
        return [this.areaLength - 1 - position[1], position[0]];
      }
    },
    drawPiece() {
      // 自分のターンではないとき
      if (
        this.$whim.users.map(user => user.id)[
          this.$whim.state.currentTurnIndex
        ] !== this.$whim.accessUser.id
      ) {
        return;
      }
      // 自分の持ち駒が5個以上のとき
      if (this.myHands.length >= 5) {
        return;
      }

      let pieces = this.$whim.state[this.$whim.accessUser.id].pieces;
      pieces.push({
        label: random([
          "fu",
          "fu",
          "fu",
          "gin",
          "hisha",
          "kaku",
          "kin",
          "kyosya"
        ]),
        position: "hand"
      });

      this.$whim.assignState({
        [this.$whim.accessUser.id]: {
          pieces
        }
      });
      this.nextTurn();
    },
    dropPiece(event, relativeTargetPlace) {
      const targetPlace = this.transformCoordinate(relativeTargetPlace);
      // 不正な位置の場合キャンセル
      if (!this.$droppable(this.dragging.position, targetPlace)) {
        this.dragging = null;
        return;
      }
      // コマをとる場合
      const targetPiace = this.$piece(targetPlace);
      if (targetPiace) {
        let targetLabel = targetPiace.label;

        // 勝利判定
        if (["ou", "gyoku"].includes(targetLabel)) {
          this.$whim.assignState({
            winner: this.$whim.accessUser.id,
            phase: "result"
          });
        }

        const narigoma = Object.entries(NARIGOMA).find(
          koma => koma[1] === targetLabel
        );
        if (narigoma) {
          targetLabel = narigoma[0];
        }

        // コマを削除
        let opponentPieces = this.$whim.state[targetPiace.userId].pieces;
        opponentPieces.splice(targetPiace.id, 1);
        this.$whim.assignState({
          [targetPiace.userId]: {
            pieces: opponentPieces
          }
        });

        // コマを追加
        let pieces = this.$whim.state[this.$whim.accessUser.id].pieces;
        pieces.push({
          label: targetLabel,
          position: "hand"
        });
        this.$whim.assignState({
          [this.$whim.accessUser.id]: {
            pieces
          }
        });
      }

      console.log(this.$whim.state);
      this.$whim.assignState({
        [this.$whim.accessUser.id]: {
          pieces: {
            [this.dragging.id]: {
              position: targetPlace
            }
          }
        }
      });
      console.log(this.$whim.state);

      // 成る場合
      if (
        ([0, 1].includes(relativeTargetPlace[0]) ||
          [0, 1].includes(
            this.transformCoordinate(this.dragging.position)[0]
          )) &&
        this.dragging.position !== "hand"
      ) {
        this.judgeNarigoma();
      } else {
        this.dragging = null;
        this.nextTurn();
      }
    },
    judgeNarigoma() {
      if (this.dragging.label === "gin") {
        this.judgeNariginId = this.dragging.id;
      } else {
        this.narigoma();
        this.nextTurn();
      }
      this.dragging = null;
    },
    nariGin(bool) {
      if (bool) {
        this.$whim.assignState({
          [this.$whim.accessUser.id]: {
            pieces: {
              [this.judgeNariginId]: {
                label: "narigin"
              }
            }
          }
        });
      }
      this.judgeNariginId = null;
      this.nextTurn();
    },
    narigoma() {
      this.$whim.assignState({
        [this.$whim.accessUser.id]: {
          pieces: {
            [this.dragging.id]: {
              label: NARIGOMA[this.dragging.label] || this.dragging.label
            }
          }
        }
      });
    },
    nextTurn() {
      let nextIndex =
        (this.$whim.state.currentTurnIndex + 1) % this.$whim.users.length;
      this.$whim.assignState({
        currentTurnIndex: nextIndex,
        sound: true
      });
    }
  },
  watch: {
    sound: function(newSound) {
      if (newSound) {
        SE_MOVE.volume(0.1);
        SE_MOVE.play();
        this.$whim.assignState({
          sound: false
        });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/colors.scss";

// マスのサイズは文字盤の大きさにより変わる
$size: (
  5: (
    width: 12vh,
    max-width: 16vw,
    height: 12vh,
    max-height: 16vw
  ),
  6: (
    width: 12vh,
    max-width: 16vw,
    height: 12vh,
    max-height: 16vw
  ),
  7: (
    width: 11vh,
    max-width: 14vw,
    height: 11vh,
    max-height: 14vw
  ),
  8: (
    width: 10vh,
    max-width: 12vw,
    height: 10vh,
    max-height: 12vw
  )
);

.main {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.col {
  border: solid 1px;
  width: 20%;
  height: 100%;
  box-sizing: border-box;
  text-align: center;
}

.order {
  background: #ffffffe0;
  display: flex;
  justify-content: center;
  padding: 3px;
  @for $i from 0 to 7 {
    .circle-#{$i} {
      position: relative;

      width: 9vw;
      max-width: 5vh;
      height: 9vw;
      max-height: 5vh;
      border-radius: 50%;
      background-color: rgba(map-get($user-colors, $i), 0.15);
      &.active-#{$i} {
        background-color: rgba(map-get($user-colors, $i), 1);
      }
    }
  }

  .arrow {
    position: relative;
    display: inline-block;
    padding: 0 0 0 16px;
    color: #000;
    vertical-align: middle;
    text-decoration: none;
    font-size: 15px;
  }
  .arrow::before,
  .arrow::after {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    margin: auto;
    content: "";
    vertical-align: middle;
  }
  .arrow::before {
    left: 2px;
    width: 7px;
    height: 3px;
    background: #000;
  }
  .arrow::after {
    left: 2px;
    width: 6px;
    height: 6px;
    border-top: 3px solid #000;
    border-right: 3px solid #000;
    -webkit-transform: rotate(45deg);
    transform: rotate(45deg);
  }
}

.flex {
  display: flex;
  justify-content: flex-start;
}

@each $key, $value in $size {
  .area-#{$key} {
    .row {
      background: #ffffffe0;
      width: calc(#{map-get($value, width)} * #{$key});
      max-width: calc(#{map-get($value, max-width)} * #{$key});
      height: map-get($value, height);
      max-height: map-get($value, max-height);
      display: flex;
      box-sizing: border-box;
      border: solid;
      border-width: 0px 2px;

      &.row-0,
      &.row-#{$key - 1} {
        border: solid 2px;
      }
    }

    .hands {
      height: calc(#{map-get($value, height)} * 3 / 4);
      max-height: calc(#{map-get($value, max-height)} * 3 / 4);
      width: calc(#{map-get($value, width)} * #{$key - 1});
      max-width: calc(#{map-get($value, max-width)} * #{$key - 1});
    }

    .image {
      margin-left: auto;
      height: calc(#{map-get($value, height)} * 3 / 4);
      max-height: calc(#{map-get($value, max-height)} * 3 / 4);
      width: calc(#{map-get($value, width)} * 3 / 4);
      max-width: calc(#{map-get($value, max-width)} * 3 / 4);
    }
  }
}

@for $i from 0 to 7 {
  .background-#{$i} {
    background-color: rgba(map-get($user-colors, $i), 0.2);
    &.active-#{$i} {
      background-color: rgba(map-get($user-colors, $i), 0.6);
    }
  }
}
.modal {
  height: 100%;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 10;
}
.modal__bg {
  background: rgba(0, 0, 0, 0.8);
  height: 100%;
  position: absolute;
  width: 100%;
}
.modal__content {
  left: 50%;
  padding: 40px;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  text-align: center;
}
.select-piece {
  width: 20%;
}
</style>