<template>
  <div class="border" :class="borderClass"></div>
</template>
<script>
export default {
  name: "Player",
  props: {
    displayUser: {
      type: Object,
      required: true
    }
  }, // 表示されているUserの情報
  computed: {
    borderClass() {
      return [
        `user-${this.displayUser.positionNumber - 1}`,
        `active-${this.$whim.state.currentTurnIndex}`
      ];
    }
  }
};
</script>
<style lang="scss" scoped>
@import "@/assets/colors.scss";

.border {
  box-sizing: border-box;
  // border: 10px solid #0f0;
  border-radius: 10px;
  margin: 0 auto;
  @for $i from 0 to 7 {
    &.user-#{$i} {
      // box-shadow: 0 0 0 10px rgba(map-get($user-colors, $i), 0.2) inset;
      border: 10px solid rgba(map-get($user-colors, $i), 0.2);
      &.active-#{$i} {
        border: 10px solid rgba(map-get($user-colors, $i), 0.9);
      }
    }
  }
}
</style>
