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
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const InitData = {
  2: {
    0: {
      direction: [1, 0],
      ouPosition: [0, 2]
    },
    1: {
      direction: [-1, 0],
      ouPosition: [4, 2]
    }
  },
  3: {
    0: {
      direction: [1, 0],
      ouPosition: [0, 4]
    },
    1: {
      direction: [-1, 0],
      ouPosition: [5, 3]
    },
    2: {
      direction: [0, 1],
      ouPosition: [2, 0]
    }
  },
  4: {
    0: {
      direction: [1, 0],
      ouPosition: [0, 3]
    },
    1: {
      direction: [0, -1],
      ouPosition: [3, 5]
    },
    2: {
      direction: [-1, 0],
      ouPosition: [5, 2]
    },
    3: {
      direction: [0, 1],
      ouPosition: [2, 0]
    }
  },
  5: {
    0: {
      direction: [1, 0],
      ouPosition: [0, 1]
    },
    1: {
      direction: [1, 0],
      ouPosition: [0, 5]
    },
    2: {
      direction: [0, -1],
      ouPosition: [4, 6]
    },
    3: {
      direction: [-1, 0],
      ouPosition: [6, 3]
    },
    4: {
      direction: [0, 1],
      ouPosition: [4, 0]
    }
  },
  6: {
    0: {
      direction: [1, 0],
      ouPosition: [0, 1]
    },
    1: {
      direction: [1, 0],
      ouPosition: [0, 5]
    },
    2: {
      direction: [0, -1],
      ouPosition: [3, 6]
    },
    3: {
      direction: [-1, 0],
      ouPosition: [6, 5]
    },
    4: {
      direction: [-1, 0],
      ouPosition: [6, 1]
    },
    5: {
      direction: [0, 1],
      ouPosition: [3, 0]
    }
  },
  7: {
    0: {
      direction: [1, 0],
      ouPosition: [0, 3]
    },
    1: {
      direction: [0, -1],
      ouPosition: [1, 7]
    },
    2: {
      direction: [0, -1],
      ouPosition: [4, 7]
    },
    3: {
      direction: [-1, 0],
      ouPosition: [7, 6]
    },
    4: {
      direction: [-1, 0],
      ouPosition: [7, 3]
    },
    5: {
      direction: [0, 1],
      ouPosition: [5, 0]
    },
    6: {
      direction: [0, 1],
      ouPosition: [2, 0]
    }
  },
  8: {
    0: {
      direction: [1, 0],
      ouPosition: [0, 2]
    },
    1: {
      direction: [1, 0],
      ouPosition: [0, 5]
    },
    2: {
      direction: [0, -1],
      ouPosition: [2, 7]
    },
    3: {
      direction: [0, -1],
      ouPosition: [5, 7]
    },
    4: {
      direction: [-1, 0],
      ouPosition: [7, 5]
    },
    5: {
      direction: [-1, 0],
      ouPosition: [7, 2]
    },
    6: {
      direction: [0, 1],
      ouPosition: [5, 0]
    },
    7: {
      direction: [0, 1],
      ouPosition: [2, 0]
    }
  }
};

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
        currentTurnIndex: 0,
        turnOrder: shuffle(this.$whim.users.map(user => user.id))
      };

      state.turnOrder.forEach((userId, i) => {
        state[userId] = {
          direction: InitData[userLength][i].direction,
          pieces: [
            {
              label: "ou",
              position: InitData[userLength][i].ouPosition
            },
            {
              label: "fu",
              position: "hand"
            },
            {
              label: "fu",
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
