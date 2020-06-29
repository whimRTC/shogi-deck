<template>
  <div id="app" v-if="$whim.state.phase">
    <Main class="main" />
    <Player
      v-for="user in $whim.users"
      :key="user.id"
      :class="whimUserWindowClass(user)"
      :displayUser="user"
    />
    <div v-if="$whim.state.phase === 'result'" class="result">
      <Result
        v-for="user in $whim.users"
        :key="user.id"
        :class="whimUserWindowClass(user)"
        :displayUser="user"
        class="result"
      />
    </div>
  </div>
</template>

<script>
import InitOu from "@/assets/config/initOu";

export default {
  name: "App",
  components: {
    Main: () => import("@/components/main/Index"),
    Player: () => import("@/components/player/Index"),
    Result: () => import("@/components/result/Index")
  },
  mounted() {
    setTimeout(() => {
      if (this.$whim.state.phase === "play") {
        return;
      }
      const userLength = this.$whim.users.length;

      let state = {
        phase: "play",
        currentTurnIndex: 0
      };

      this.$whim.users
        .map(user => user.id)
        .forEach((userId, i) => {
          state[userId] = {
            direction: InitOu[userLength][i].direction,
            pieces: [
              {
                label: "ou",
                position: InitOu[userLength][i].ouPosition
              },
              {
                label: "kyosya",
                position: "hand"
              },
              {
                label: "kin",
                position: "hand"
              }
            ]
          };
        });
      this.$whim.resetState(state);
    }, 500);
  }
};
</script>
<style lang="scss" scoped>
.main {
  position: relative;
  z-index: 1;
}
.result {
  z-index: 2;
}
</style>
