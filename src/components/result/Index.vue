<template>
  <div class="center">
    <img v-if="isWinner" src="@/assets/images/win.png" class="img" />
    <img v-else src="@/assets/images/lose.png" class="img" />
  </div>
</template>
<script>
export default {
  name: "Result",
  props: {
    displayUser: {
      type: Object,
      required: true
    }
  }, // 表示されているUserの情報
  computed: {
    isWinner() {
      return this.$whim.state.winner === this.displayUser.id;
    }
  }
};
</script>
<style lang="scss" scoped>
.center {
  display: flex;
  justify-content: center;
  align-items: center;
}
.img {
  max-width: 200px;
  width: 40vw;
}
</style>
