<template>
    <stack height="100%" width="100%">
        <absolute-layout class="board" width="100%" height="100%" v-if="loading == false && showCard == false && showOutcome == false && game.players.length > 1">
                <image 
                :key="playerIndex" 
                v-for="(player, playerIndex) in $store.state.games[gameID].players" 
                :height="( ($store.state.games[gameID].gameState.playerTurn == player ? 8:5) * $store.state.device.unit) + 'px'" 
                :width="( ($store.state.games[gameID].gameState.playerTurn == player ? 8:5) * $store.state.device.unit) + 'px'"
                :style="{zIndex:$store.state.games[gameID].gameState.playerTurn == player ? '1000' : '500', backgroundColor:$store.state.playerColors[playerIndex], marginLeft: spaceCoords[$store.state.games[gameID].gameState.spaces[player]][0] + '%', marginTop: spaceCoords[$store.state.games[gameID].gameState.spaces[player]][1] + '%', borderRadius: '100%', backgroundSize:'cover'}"  src="res://sxan"/>

                <dock-layout width="100%" height="100%" stretchLastChild="true">
                    
                    <flex dock="top" class="flex-between align-start" width="100%">
                        <menu text="center"></menu>
                        <button v-if="$store.state.games[gameID].gameState.playerTurn == $store.state.user.uid" style="padding-top:8%;padding-bottom:8%;" :width="(20*$store.state.device.unit) + 'px'" :height="(20*$store.state.device.unit) + 'px'" class="button-green xxlarge" @tap="gameLoop()">{{playerRoll}}</button>
                        <button textWrap="true" v-else style="padding-top:8%;padding-bottom:8%;" :width="(20*$store.state.device.unit) + 'px'" :height="(20*$store.state.device.unit) + 'px'">{{$store.state.index.users[game.gameState.playerTurn] || 'Player ' + $store.state.game.gameState.playerTurn}}'s Turn. </button>                        
                    </flex>

                    <flex class="flex-between align-end" dock="bottom" width="100%">

                        <image src="res://sxan" width="48%"/>
                        <flex class="flex-center" :height="(16*$store.state.device.unit) + 'px'">
                            <stack :width="(12*$store.state.device.unit) + 'px'" :height="(12*$store.state.device.unit) + 'px'" :key="playerNameIndex" v-for="(player, playerNameIndex) in game.players" :style="{alignSelf:'flex-end', order: $store.state.games[gameID].gameState.playerTurn == player ? '-1' : ''}">
                                <label>{{$store.state.index.users[player] || 'Player ' + player}}</label> 
                                <flex class="flex-center align-center" :style="{backgroundColor:'white',  width:( ($store.state.games[gameID].gameState.playerTurn == player ? 12:7) * $store.state.device.unit) + 'px', height:(($store.state.games[gameID].gameState.playerTurn == player ? 12:7) * $store.state.device.unit) + 'px', borderRadius:'100%'}">
                                    <image :style="{
                                    backgroundColor:$store.state.playerColors[playerNameIndex], 
                                    borderRadius:'100%', 
                                    backgroundSize:'cover'}" :width="( ($store.state.games[gameID].gameState.playerTurn == player ? 11:7) * $store.state.device.unit) + 'px'" :height="(($store.state.games[gameID].gameState.playerTurn == player ? 11:7) * $store.state.device.unit) + 'px'" src="res://sxan"/>
                                </flex>
                            </stack>
                        </flex>
                    </flex>

                </dock-layout>

                

                <!-- <flexbox-layout width="100%" class="right" marginTop="12%" :height="(20*$store.state.device.height) + 'px'">
                          
                </flexbox-layout> -->
        </absolute-layout>
        <flex v-else-if="loading == false && game.players.length == 1" class="flex-center align-center" height="100%" width="100%">
            <label class="xxlarge" text="There can be only one!"></label>
            <button @tap="game.players.indexOf($store.state.user.uid) >= 0 ? win(game.gameState) : $router.push('/start')">OK!</button>
        </flex>
        <flex v-else-if="loading == false && showCard == true" class="flex-center align-center" height="100%" width="100%">
            <stack>
                <label class="xxlarge" :text="game.gameState.card.name "></label>
                <label class="medium anon" :text="game.gameState.card.rap"></label>
                <label class="medium" :text="game.gameState.card.effect"></label>
                <button @tap="delete game.gameState.card; showCard = false">OK!</button>
            </stack>
        </flex>
        <flex v-else-if="loading == false && showOutcome == true" class="flex-center align-center" height="100%" width="100%">
            <label class="xxlarge" text="some shit happened"></label>
            <button @tap="showOutcome = false">OK!</button>
        </flex>
        <flex v-else class="flex-center align-center" height="100%" width="100%">
            <label text="loading..." class="xxlarge"></label>
        </flex>
    </stack>
</template>

<script>
import localStorage from "nativescript-localstorage";
import dialogs from "ui/dialogs";
import menu from "../Ux/Menu.vue";
import firebase from "nativescript-plugin-firebase";

export default {
  components: { menu },
  computed: {},
  data() {
    return {
      direction: false,
      game: {},
      gameID: "",
      loading: true,
      loadCounter: 0,
      originalSpace: false,
      playerRoll: 0,
      turnState: {
        playerTurn: "",
        spaces: {},
        timeouts: {
          jail: {},
          school: {},
          work: {}
        },
        turns: [],
        winner: false
      },
      showCard: false,
      showOutcome: false,
      spaces: [
        /* start C */ "home",
        1,
        2,
        "card",
        4,
        5,
        "card",
        /* st1st O */ 7,
        "card",
        9,
        10,
        "pass",
        12,
        "card",
        14,
        /* st2nd O */ 15,
        "card",
        17,
        "pass",
        19,
        20,
        "card",
        22,
        /* start L */ 23,
        "card",
        25,
        26,
        "card",
        "trap",
        "pass",
        /* start ? */ 30,
        31,
        32,
        "card",
        34,
        35,
        "trap",
        "win",
        /* timeout */ "school",
        "work",
        "jail"
      ],
      spaceCoords: {
        0: [17, 14],
        1: [12, 15],
        2: [7, 20],
        3: [5, 30],
        4: [6, 42],
        5: [8, 51],
        6: [14, 49],
        7: [25, 43],
        8: [24, 32],
        9: [29, 29],
        10: [33, 30],
        11: [37, 35],
        12: [36, 44],
        13: [32, 48],
        14: [27, 49],
        15: [46, 37],
        16: [51, 35],
        17: [56, 35],
        18: [59, 41],
        19: [58, 51],
        20: [54, 54],
        21: [48, 55],
        22: [45, 48],
        23: [69, 32],
        24: [70, 40],
        25: [68, 46],
        26: [67, 53],
        27: [65, 63],
        28: [70, 65],
        29: [75, 64],
        30: [81, 41],
        31: [86, 39],
        32: [91, 40],
        33: [93, 47],
        34: [91, 55],
        35: [86, 56],
        36: [84, 62],
        37: [83, 73],
        38: [13, 83], // school
        39: [23, 83], // work
        40: [36, 83] // jail
      },
      timeouts: {
        jail: 4,
        school: 2,
        work: 3
      },
      turn: {
        player: "", // player ID
        roll: "",
        space: "", // space number
        outcome: "", //
        timeout: false // {type:time}, i.e. {jail:2}
      }
    };
  },
  methods: {
    boardInit() {
      this.game = this.$store.state.game;
      console.log("boardInit init");
      if (this.$store.state.game.type == "single") {
        console.log("single player game");

        this.game.gameState = {
          playerTurn: this.game.players[0],
          spaces: {},
          timeouts: {
            jail: {},
            school: {},
            work: {}
          },
          type: "single",
          turns: [],
          winner: false,
          usesCardset: 0
        };
        this.game.players.forEach(player => {
          this.game.gameState.spaces[player] = 0;
        });
        this.$store.state.games[
          "single_" + this.$store.state.user.uid
        ] = this.game;
        console.log(
          "Game init on board component",
          JSON.stringify(this.$store.state.game, null, 2),
          JSON.stringify(this.$store.state.games)
        );
      }
      if (!this.game.gameState) {
        this.game.gameState = {
          playerTurn: "",
          spaces: {},
          timeouts: {
            jail: {},
            school: {},
            work: {}
          },
          turns: [],
          winner: false
        };
      }
      if (
        !this.game.gameState.spaces[this.$store.state.user.uid] &&
        this.$store.state.game.type !== "single"
      ) {
        this.game.players.forEach(player => {
          this.game.gameState.spaces[player] = 0;
        });
      }
      if (this.game.gameState.playerTurn.length < 1) {
        this.game.gameState.playerTurn = this.game.players[0];
      }
      /*this.$watch('this.game.gameState.spaces', (i) => {
                    this.$store.commit('syncSpaces', { 
                        status: true, 
                        url: 'games/'+ this.gameID + '/gameState/spaces', 
                        type: 'spaces',
                        gameID: this.gameID,
                        spaces: this.game.gameState.spaces
                    })
                }, { immediate: true })*/
      this.loading = false;
    },
    gameLoop() {
      this.gameID =
        this.$store.state.multiplayer.inGame ||
        "single_" + this.$store.state.user.uid;
      this.game = this.$store.state.games[this.gameID];
      var gameState = this.game.gameState || this.turnState;
      this.originalSpace = gameState.spaces[gameState.playerTurn];
      this.direction = false;
      this.showOutcome = false;

      // create new turn
      var turn = this.turn;

      // set turn player
      turn.player = gameState.playerTurn;

      /* Turn Checks */

      // Win?
      if (this.originalSpace == 37 || this.game.players.length == 1) {
        return this.win(gameState, turn);
      }

      // Timeout?
      if (
        gameState.spaces[gameState.playerTurn] == 40 ||
        gameState.spaces[gameState.playerTurn] == 38 ||
        gameState.spaces[gameState.playerTurn] == 39
      ) {
        return this.timeout(gameState, turn);
      }

      turn.roll = this.roll();
      console.log("turn moving", JSON.stringify(turn, gameState));

      this.movePiece(turn.roll, gameState);
    },
    movePiece(roll, gameState) {
      // a recursive adventure since for-loops are crack
      this.gameID = this.$store.state.multiplayer.inGame || "single";
      this.game = this.$store.state.games[this.gameID];

      var chooseDirection = (roll, gameState) => {
        // simple dialog to choose direction
        roll > 0
          ? dialogs
              .confirm({
                title: "You've got " + roll + " moves.",
                message: "Choose a direction",
                okButtonText: "Clockwise",
                cancelButtonText: "Counterclockwise"
              })
              .then(result => {
                // result argument is boolean
                this.direction =
                  result == true ? "clockwise" : "counterclockwise";
                console.log("Dialog result: " + this.direction);
                this.movePiece(roll, gameState);
                // finishLoop(rollsLeft)
              })
          : this.nextTurn();
      };
      var move = () => {
        if (roll > 0) {
          if (
            this.originalSpace == 11 &&
            gameState.spaces[gameState.playerTurn] == 11
          ) {
            console.log("player on first pass");
            gameState.spaces[gameState.playerTurn] = 15;
            roll--;
            return this.movePiece(roll, gameState);
          } else if (
            this.originalSpace == 18 &&
            gameState.spaces[gameState.playerTurn] == 18
          ) {
            console.log("player on second pass");
            gameState.spaces[gameState.playerTurn] = 23;
            roll--;
            return this.movePiece(roll, gameState);
          } else if (
            this.originalSpace == 29 &&
            gameState.spaces[gameState.playerTurn] == 29
          ) {
            console.log("player on last pass");
            gameState.spaces[gameState.playerTurn] = 30;
            roll--;
            return this.movePiece(roll, gameState);
          }

          /*
                        this.originalSpace == 11 ? (gameState.spaces[gameState.playerTurn] = 15, roll--, this.movePiece(roll, gameState)) : // pass
                        this.originalSpace == 18 ? (gameState.spaces[gameState.playerTurn] = 23, roll--, this.movePiece(roll, gameState)) : // pass
                        this.originalSpace == 29 ? (gameState.spaces[gameState.playerTurn] = 30, roll--, this.movePiece(roll, gameState)) : // pass
                        null
                        */

          /* loopable? */
          if (gameState.spaces[gameState.playerTurn] < 7) {
            // under 7, moves forward 1
            gameState.spaces[gameState.playerTurn]++;
            roll--;
            return this.movePiece(roll, gameState);
          } else if (
            gameState.spaces[gameState.playerTurn] > 6 &&
            gameState.spaces[gameState.playerTurn] < 23 &&
            this.direction == false
          ) {
            // enters loop, chooses direction

            return this.game.gameState.playerTurn != 2
              ? chooseDirection(roll, gameState)
              : ((this.direction = "clockwise"),
                this.movePiece(roll, gameState));
          } else if (
            gameState.spaces[gameState.playerTurn] > 6 &&
            gameState.spaces[gameState.playerTurn] < 23 &&
            this.direction == "clockwise"
          ) {
            /* chose clockwise direction, rules of movement */

            // first loop
            gameState.spaces[gameState.playerTurn] >= 7 &&
            gameState.spaces[gameState.playerTurn] < 14
              ? gameState.spaces[gameState.playerTurn]++
              : gameState.spaces[gameState.playerTurn] == 14
                ? (gameState.spaces[gameState.playerTurn] = 7)
                : // second loop

                  gameState.spaces[gameState.playerTurn] >= 15 &&
                  gameState.spaces[gameState.playerTurn] < 22
                  ? gameState.spaces[gameState.playerTurn]++
                  : gameState.spaces[gameState.playerTurn] == 22
                    ? (gameState.spaces[gameState.playerTurn] = 15)
                    : null;

            roll--;
            return this.movePiece(roll, gameState);
          } else if (
            gameState.spaces[gameState.playerTurn] > 6 &&
            gameState.spaces[gameState.playerTurn] < 23 &&
            this.direction == "counterclockwise"
          ) {
            /* chose counterclockwise direction, rules of movement */

            // first loop
            gameState.spaces[gameState.playerTurn] <= 14 &&
            gameState.spaces[gameState.playerTurn] > 7
              ? gameState.spaces[gameState.playerTurn]--
              : gameState.spaces[gameState.playerTurn] == 7
                ? (gameState.spaces[gameState.playerTurn] = 14)
                : // second loop
                  gameState.spaces[gameState.playerTurn] <= 22 &&
                  gameState.spaces[gameState.playerTurn] > 15
                  ? gameState.spaces[gameState.playerTurn]--
                  : gameState.spaces[gameState.playerTurn] == 15
                    ? (gameState.spaces[gameState.playerTurn] = 22)
                    : null;

            roll--;
            return this.movePiece(roll, gameState);
          } else if (
            this.originalSpace < 29 &&
            gameState.spaces[gameState.playerTurn] >= 30
          ) {
            // overshoot L pass
            gameState.spaces[gameState.playerTurn] = 23;
            roll = 0;
            this.game.gameState = gameState;
            return firebase
              .setValue(
                "games/" + this.gameID + "/gameState",
                this.game.gameState
              )
              .then(() => {
                this.nextTurn();
              });
          } else if (
            this.originalSpace > 29 &&
            this.originalSpace + roll > 37
          ) {
            // overshoot win
            gameState.spaces[gameState.playerTurn] = 30;
            roll = 0;
            this.game.gameState = gameState;
            return firebase
              .setValue(
                "games/" + this.gameID + "/gameState",
                this.game.gameState
              )
              .then(() => {
                this.nextTurn();
              });
          } else {
            console.log("how's this even possible?");
            gameState.spaces[gameState.playerTurn]++;
            roll--;
            return this.movePiece(roll, gameState);
          }
        } else {
          // no moves left, tidy up
          console.log("no moves left");

          if (isNaN(this.spaces[gameState.spaces[gameState.playerTurn]])) {
            console.log(
              "special case of card, pass, home, trap, or win",
              JSON.stringify(
                this.spaces[gameState.spaces[gameState.playerTurn]]
              )
            );
            return this.outcome(
              this.spaces[gameState.spaces[gameState.playerTurn]],
              gameState
            );
          } else {
            console.log("nothing left, save and flip.");
            this.game.gameState = gameState;
            return firebase
              .setValue(
                "games/" + this.gameID + "/gameState",
                this.game.gameState
              )
              .then(() => {
                this.nextTurn();
              });
          }
          console.log("edge cases?");
          // Send player to new space
        }
      };
      //move()
      setTimeout(move, 500);
    },
    nextTurn() {
      this.showOutcome = true;
      this.originalSpace = false;
      this.gameID =
        this.$store.state.multiplayer.inGame ||
        "single_" + this.$store.state.user.uid;
      this.game = this.$store.state.games[this.gameID];
      console.log("next player");
      this.game.players.indexOf(this.game.gameState.playerTurn) ==
      this.game.players.length - 1
        ? (this.game.gameState.playerTurn = this.game.players[0])
        : (this.game.gameState.playerTurn = this.game.players[
            this.game.players.indexOf(this.game.gameState.playerTurn) + 1
          ]);
      this.game.gameState.playerTurn == 2 ? this.gameLoop() : null;
      firebase.setValue("games/" + this.gameID, this.game);
      // firebase.setValue('games/'+this.gameID, this.game)
    },
    outcome(type, gameState) {
      console.log("how to handle outcome", type);

      if (type === "card") {
        console.log(
          "SHOWING CARD",
          JSON.stringify(this.$store.state.cardsets[this.game.usesCardset])
        );
        gameState.card = this.$store.state.cardsets[this.game.usesCardset]
          ? this.$store.state.cards[
              Math.floor(
                Math.random() *
                  this.$store.state.cardsets[this.game.usesCardset].cards
                    .length -
                  1
              )
            ]
          : this.$store.state.stock.cards[
              Math.floor(
                Math.random() * this.$store.state.stock.cardsets.cards.length -
                  1
              )
            ];

        gameState.card = gameState.card || this.$store.state.stock.cards[0];
        console.log(
          "WTF single player",
          JSON.stringify(gameState.card, null, 2)
        );
        /*!gameState.card.name ? gameState.card = this.$store.state.stock.cards[Math.floor(Math.random() * this.$store.state.stock.cardsets.cards.length-1)] : null*/
        this.outcome(gameState.card.effect, gameState);
        this.showCard = true;
      } else if (type === "pass") {
        console.log("GO TO PASS");
        while (
          this.spaces[gameState.spaces[gameState.playerTurn]] !== "pass" &&
          gameState.spaces[gameState.playerTurn] < 29
        ) {
          gameState.spaces[gameState.playerTurn]++;
        }
        this.game.gameState = gameState;
        return firebase
          .setValue("games/" + this.gameID + "/gameState", this.game.gameState)
          .then(() => {
            this.nextTurn();
          });
      } else if (type === "home" || type === "trap") {
        console.log("GO " + type);
        gameState.spaces[gameState.playerTurn] = 0;
        this.game.gameState = gameState;
        return firebase
          .setValue("games/" + this.gameID + "/gameState", this.game.gameState)
          .then(() => {
            this.nextTurn();
          });
      } else if (type == "win" || this.game.players.length == 1) {
        console.log("YOU WON!");
        gameState.winner = gameState.playerTurn;
        this.game.started = false;
        this.game.ended = true;
        this.game.gameState = gameState;
        return firebase.setValue("games/" + this.gameID, this.game).then(() => {
          firebase
            .setValue("finishedGames/" + this.gameID, this.game)
            .then(() => {
              firebase.remove("games/" + this.gameID);
              firebase.remove("index/games/" + this.gameID);
              this.$router.go("/start");
            });
        });
      } else if (type == "jail" || type == "school" || type == "work") {
        gameState.spaces[gameState.playerTurn] = this.spaces.indexOf(type);
        gameState.timeouts = gameState.timeouts || {};
        gameState.timeouts[gameState.playerTurn] = {
          type: type,
          timeServed: 0
        };
        /*
                    gameState.timeouts = gameState.timeouts || {jail:{}, school:{}, work:{}}
                    gameState.timeouts[type] = gameState.timeouts[type] || {}
                    gameState.timeouts[type][gameState.playerTurn] = 1
                    */

        this.game.gameState = gameState;
        return firebase.setValue("games/" + this.gameID, this.game).then(() => {
          this.nextTurn();
        });
      } else if (type == "stay") {
        this.game.gameState = gameState;
        return firebase.setValue("games/" + this.gameID, this.game).then(() => {
          this.nextTurn();
        });
      } else if (type == "dead") {
        delete gameState.spaces[gameState.playerTurn];
        this.game.gameState = gameState;
        this.game.players.pop(this.game.players.indexOf(this.game.playerTurn));
        return firebase.setValue("games/" + this.gameID, this.game).then(() => {
          this.nextTurn();
        });
      }
    },
    roll() {
      var roll = Math.floor(Math.random() * 10);
      console.log("rolled: ", roll);
      this.playerRoll = roll;
      return roll;
    },
    timeout(gameState, turn) {
      console.log("player in timeout", JSON.stringify(gameState));
      console.log(JSON.stringify(gameState.timeouts));
      console.log(JSON.stringify(gameState.spaces));
      console.log(JSON.stringify(gameState.playerTurn));
      console.log(
        JSON.stringify(this.timeouts[gameState.spaces[gameState.playerTurn]])
      );

      // Time Served?
      if (
        gameState.timeouts[gameState.playerTurn].timeServed ==
        this.timeouts[gameState.timeouts[gameState.playerTurn].type]
      ) {
        console.log(
          "time served",
          JSON.stringify(
            gameState.timeouts[gameState.spaces[gameState.playerTurn]]
          )
        );
        delete gameState.timeouts[gameState.playerTurn];
        gameState.spaces[gameState.playerTurn] = 0;
        this.game.gameState = gameState;
        return firebase
          .setValue("games/" + this.gameID + "/gameState", this.game.gameState)
          .then(() => {
            this.nextTurn();
          });
        // TODO remove player from timeout, continue
      } else {
        var roll = this.roll();
        dialogs
          .alert({
            title: "Roll to Escape!",
            message:
              "If you can roll a " +
              this.timeouts[gameState.timeouts[gameState.playerTurn].type],
            okButtonText: "Try"
          })
          .then(() => {
            console.log("Rolled a " + roll);
            if (
              roll ==
              this.timeouts[gameState.timeouts[gameState.playerTurn].type]
            ) {
              console.log(
                "time served",
                JSON.stringify(
                  gameState.timeouts[gameState.spaces[gameState.playerTurn]]
                )
              );
              delete gameState.timeouts[gameState.playerTurn];
              gameState.spaces[gameState.playerTurn] = 0;
              this.game.gameState = gameState;
              return firebase
                .setValue(
                  "games/" + this.gameID + "/gameState",
                  this.game.gameState
                )
                .then(() => {
                  this.nextTurn();
                });
            } else {
              // TODO add counter to player timeout, push turn, next player
              gameState.timeouts[gameState.playerTurn].timeServed++;
              console.log("timeout: still stuck");
              this.game.gameState = gameState;
              return firebase
                .setValue(
                  "games/" + this.gameID + "/gameState",
                  this.game.gameState
                )
                .then(() => {
                  this.nextTurn();
                });
            }
          });
      }
    },
    turnChecks(gameState) {},
    waiting() {
      console.log("Waiting on game data from board component");

      setTimeout(() => {
        (this.gameID && this.game) || this.$store.state.game.type == "single"
          ? this.boardInit()
          : this.waiting();
      }, 1500);
    },
    win(gameState, turn) {
      gameState.winner = gameState.playerTurn;
      // turn.outcome = 'win'
      console.log("win", JSON.stringify(turn));
      gameState.winner = gameState.playerTurn;
      this.game.started = false;
      this.game.ended = true;
      this.game.gameState = gameState;
      this.$store.state.games[this.gameID] = this.game;
      return firebase.setValue("games/" + this.gameID, this.game).then(() => {
        firebase
          .setValue("finishedGames/" + this.gameID, this.game)
          .then(() => {
            firebase.remove("games/" + this.gameID);
            firebase.remove("index/games/" + this.gameID);
            this.$router.push("/start");
          });
      });
    }
  },
  mounted() {
    setTimeout(() => {
      console.log(
        "board mounting",
        JSON.stringify(this.$store.state.index, 2, null)
      );
      console.log("gameID: " + this.$store.state.multiplayer.inGame);
      this.gameID =
        this.$store.state.multiplayer.inGame ||
        "single_" + this.$store.state.user.uid;
      console.log("game: " + this.$store.state.games[this.gameID]);
      this.game = this.$store.state.games[this.gameID] || {
        type: "single",
        players: [this.$store.state.user.uid || "player", 2],
        started: false,
        ended: false,
        usesCardset: 0,
        public: false,
        timestamp: Date.now()
      };
      this.game.type == "single"
        ? (this.$store.state.games[
            "single_" + this.$store.state.user.uid
          ] = this.game)
        : null;
      this.waiting();
    }, 2000);
  }
};
</script>

<style scoped>
.board {
  background-image: url("res://sxan");
  background-size: cover;
  width: 100%;
  height: 100%;
}
</style>