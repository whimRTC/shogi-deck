<template>
  <img
    :src="require(`@/assets/images/${label}.png`)"
    class="piece"
    :draggable="draggable"
    :class="[
      { dragging },
      `color-filter--${$whim.accessUser.positionNumber - 1}`
    ]"
    @dragstart="dragPiece($event)"
    @dragend="dragend"
  />
</template>

<script>
export default {
  data() {
    return {
      dragging: false
    };
  },
  props: {
    handIndex: Number
  },
  computed: {
    piece() {
      const piece = this.$whim.state[this.$whim.accessUser.id].pieces[
        this.handIndex
      ];
      // piece.id = this.handIndex;
      return Object.assign(piece, { id: this.handIndex });
    },
    label() {
      return this.piece.label;
    },
    draggable() {
      return (
        this.$whim.state.currentTurnIndex ===
          this.$whim.accessUser.positionNumber - 1 &&
        this.$whim.state.phase === "play"
      );
    }
  },
  methods: {
    dragPiece(event) {
      this.dragging = true;
      this.$emit("dragging", this.piece);
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.dropEffect = "move";
    },
    dragend() {
      this.$emit("dragging", null);
      this.dragging = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.piece {
  height: 10vw;
  max-height: 7vh;
  float: left;
  z-index: 2;
}
.dragging {
  height: 18vw !important;
  max-height: 12vh !important;
  visibility: hidden;
  position: absolute;
  // transform: scale(0, 0);
  transition-duration: 0.01s;
  transition-property: visibility, position;
}
</style>
