<template>
  <div class="main" :class="`area-${areaLength}`">
    <div class="order">
      <div class="circle-0" :class="`active-${$whim.state.currentTurnIndex}`">
        <div v-if="wasKnockOut(0)" class="knock-out"></div>
      </div>

      <template v-for="player in $whim.state.turnOrder.length - 1">
        <a href="#" class="arrow" :key="`arrow-${player}`"></a>
        <div
          :key="player"
          :class="[
            `circle-${player}`,
            `active-${$whim.state.currentTurnIndex}`
          ]"
        >
          <div v-if="wasKnockOut(player)" class="knock-out"></div>
        </div>
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
        v-for="player in players"
        class="hands"
        :key="`player-${player}`"
        :class="[
          `background-${player}`,
          `active-${$whim.state.currentTurnIndex}`
        ]"
      >
        <Hand
          v-for="i in myHands"
          :key="i"
          :handIndex="i"
          @dragging="setDragging"
          :player="player"
        ></Hand>
      </div>
      <img class="image" src="@/assets/deck.png" @click="drawPiece" />
    </div>
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

const SE_MOVE = new Howl({
  src: require("@/assets/shogi.mp3")
});

function getAllIndexes(arr, val) {
  let indexes = [];
  for (let i = 0; i < arr.length; i++) if (arr[i] === val) indexes.push(i);
  return indexes;
}

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
      dragging: null
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
    players() {
      return getAllIndexes(
        this.$whim.state.turnOrder,
        this.$whim.accessUser.id
      );
    },
    wasKnockOut() {
      return player => {
        const userId = this.$whim.state.turnOrder[player];
        return !this.$whim.state[userId].pieces;
      };
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
    isKnockOut(player, targetPlace) {
      for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 5; j++) {
          if (i === targetPlace[0] && j === targetPlace[1]) {
            continue;
          }
          if ((this.$whim.state.board[i] || {})[j]?.owner === player) {
            return false;
          }
        }
      }
      console.log("t1");
      const player_hand = (this.$whim.state.hand || {})[player] || [];
      if (player_hand.length === 0) {
        return true;
      }
      return false;
    },
    drawPiece() {
      let pieces = this.$whim.state[this.$whim.accessUser.id].pieces;
      pieces.push({
        label: random(["fu", "fu", "fu", "gin", "hisha", "kaku", "kin"]),
        position: "hand"
      });

      this.$whim.assignState({
        [this.$whim.accessUser.id]: {
          pieces
        }
      });
      this.nextTurn();
    },
    nextTurn() {
      let nextIndex =
        (this.$whim.state.currentTurnIndex + 1) %
        this.$whim.state.turnOrder.length;
      this.$whim.assignState({
        currentTurnIndex: nextIndex,
        sound: true
      });
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

        // とを取ったら歩兵に戻す
        if (targetLabel === "to") {
          targetLabel = "fu";
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

        // 戦闘不能判定
        // const owner = this.$piece(targetPlace).owner;
        // if (this.isKnockOut(owner, targetPlace)) {
        //   this.$whim.assignState({
        //     knockOut: (this.$whim.state.knockOut || []).concat(owner)
        //   });
        // }
      }

      let pieces = this.$whim.state[this.$whim.accessUser.id].pieces;
      pieces[this.dragging.id].position = targetPlace;

      // 成る場合
      if (
        this.dragging.label === "fu" &&
        0 === relativeTargetPlace[0] &&
        this.dragging.position !== "hand"
      ) {
        pieces[this.dragging.id].label = "to";
      }

      this.$whim.assignState({
        [this.$whim.accessUser.id]: {
          pieces
        }
      });

      this.dragging = null;
      this.nextTurn();
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

// 箱のサイズは文字盤の大きさにより変わる
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

.knock-out {
  display: inline-block;
  position: absolute;
  z-index: 1;
  padding: 0;
  width: 4px;
  height: 20px;
  background: #000;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(45deg);
}
.knock-out:before {
  display: block;
  content: "";
  position: absolute;
  top: 50%;
  left: -8px;
  width: 20px;
  height: 4px;
  margin-top: -2px;
  background: #000;
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
</style>
