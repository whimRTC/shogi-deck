<template>
  <div class="piece-box" :class="[{ droppable }, `background-${ownerNumber}`]">
    <img
      :src="require(`@/assets/images/${label}.png`)"
      class="piece"
      :class="[rotateClass, { dragging: myDragging }]"
      v-if="label"
      :draggable="draggable"
      @dragstart="dragPiece($event, place)"
      @dragend="dragend"
    />
  </div>
</template>

<script>
const equals = (arr1, arr2) => {
  return JSON.stringify(arr1) === JSON.stringify(arr2);
};

const dot = (matrix, vector) => {
  return matrix.map(row => {
    return row[0] * vector[0] + row[1] * vector[1];
  });
};

export default {
  data() {
    return {
      myDragging: false
    };
  },
  props: {
    place: Array,
    dragging: Object || null
  },
  computed: {
    label() {
      // 存在しない場合は undefinedを返す
      return this.piece?.label;
    },
    myDirection() {
      return this.$whim.state[this.$whim.accessUser.id].direction;
    },
    rotateClass() {
      // コマをどれだけ回転させるか
      // 行列計算
      if (
        equals(
          this.piece.direction,
          dot(
            [
              [1, 0],
              [0, 1]
            ],
            this.myDirection
          )
        )
      ) {
        return "rotate-0";
      } else if (
        equals(
          this.piece.direction,
          dot(
            [
              [0, -1],
              [1, 0]
            ],
            this.myDirection
          )
        )
      ) {
        return "rotate-90";
      } else if (
        equals(
          this.piece.direction,
          dot(
            [
              [-1, 0],
              [0, -1]
            ],
            this.myDirection
          )
        )
      ) {
        return "rotate-180";
      } else {
        return "rotate-270";
      }
    },
    piece() {
      return this.$piece(this.place);
    },
    droppable() {
      if (!this.dragging) {
        return false;
      }
      return this.$droppable(this.dragging.position, this.place);
    },
    ownerNumber() {
      return this.$turnNumber(this.piece?.userId);
    },
    draggable() {
      return (
        this.$whim.users.map(user => user.id)[
          this.$whim.state.currentTurnIndex
        ] === this.$whim.accessUser.id &&
        this.ownerNumber === this.$whim.state.currentTurnIndex &&
        this.$whim.state.phase === "play"
      );
    }
  },
  methods: {
    dragPiece(event, place) {
      this.$emit("dragging", this.piece);
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.dropEffect = "move";
      event.dataTransfer.setData("originPlaceX", place[0]);
      event.dataTransfer.setData("originPlaceY", place[1]);
      event.dataTransfer.setData("pieceLabel", this.label);
      this.myDragging = true;
    },
    dragend() {
      this.$emit("dragging", null);
      this.myDragging = false;
    }
  }
};
</script>

<style lang="scss" scoped>
@import "@/assets/colors.scss";

.piece-box {
  display: flex;
  align-items: center;
  height: 100%;
  width: 100%;
}
.piece {
  margin: auto;
  width: 60%;
}
.droppable {
  background: #00000050 !important;
}
.rotate-90 {
  transform: rotate(-90deg);
}
.rotate-180 {
  transform: rotate(-180deg);
}
.rotate-270 {
  transform: rotate(90deg);
}

@for $i from 0 to 7 {
  .background-#{$i} {
    background-color: rgba(map-get($user-colors, $i), 0.3);
  }
}

.dragging {
  height: 18vw !important;
  max-height: 12vh !important;
  width: 18vw !important;
  max-width: 12vh !important;
  visibility: hidden;
  position: absolute;
  // transform: scale(0, 0);
  transition-duration: 0.01s;
  transition-property: visibility, position;
}
</style>
