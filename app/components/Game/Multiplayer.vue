<template>
    <flex class="column flex-between">
        <menu></menu>
        <flex height="16%" class="align-center flex-between">
            <image class="margin2" height="40dp" src="res://cool_logo"/>
            <label class="medium name" text="multiplayer setup"></label>
        </flex>

        <flex height="68%" class="flex-between">

            <!-- Select available games -->
            <flex width="45%" height="100%" class="column flex-between pad2">
                <label class="left small" text="Find GamE"></label>

                <flex class="container column">
                    <flex class="flex-around">
                        <label width="16%"></label>
                        <label class="left" width="40%">Host</label>
                        <label class="left" width="40%">Cardset</label>
                    </flex>

                    <!-- List available games -->
                    <flex 
                        v-if="$store.state.games[gameIndex].started == false && $store.state.multiplayer.createGame !== gameIndex && $store.state.multiplayer.joinGame !== gameIndex" 
                        :key="gameIndex" 
                        v-for="(game, gameIndex) in $store.state.multiplayer.start" 
                        class="flex-between align-center">
                        <button width="16%" @tap="joinGame(gameIndex)" class="button-green">
                            GO!
                        </button>
                        <label textWrap="true" width="40%" class="anon left">
                            {{$store.state.index.users[$store.state.games[gameIndex].players[0]] || 'Not open'}}
                        </label>
                        <label textWrap="true" width="40%" class="anon left">
                            {{$store.state.index.cardsets[$store.state.games[gameIndex].usesCardset]
                             || 'Not open'}}
                        </label>
                    </flex>
                    
                    <flex class="column flex-center align-center" v-else>
                        <label textWrap="true" text="No games rn. Make one or stick around for a bit."></label>
                        <!-- <button @tap="$store.state.multiplayer.joinGame = false">Reload</button> -->
                    </flex>
                </flex>
            </flex>

            <!-- New Game -->
            <flex width="55%" height="100%" class="column flex-between pad2">

                <!-- New Game Header -->
                <flex class="flex-between align-center">
                    <label 
                        class="small left self-center" 
                        :text="$store.state.games[$store.state.multiplayer.createGame] ? $store.state.games[$store.state.multiplayer.createGame].name : $store.state.games[$store.state.multiplayer.joinGame] ? $store.state.games[$store.state.multiplayer.joinGame].name : ''"></label>
                    <label 
                        class="small anon right self-center"
                        v-if="$store.state.games[$store.state.multiplayer.joinGame]"
                        :text="$store.state.index.cardsets[$store.state.games[$store.state.multiplayer.joinGame].usesCardset]"></label> 
                    <button 
                        class="small right self-center button-green" 
                        v-else-if="$store.state.games[$store.state.multiplayer.createGame]"
                        @tap="chooseCardset()"
                        :text="$store.state.index.cardsets[$store.state.games[$store.state.multiplayer.createGame].usesCardset]">

                    </button> 
                </flex>
                
                <flex height="68%" class="container">
                    
                    <!-- If not part of a game -->
                    <button 
                    @tap="createGame()" 
                    v-if="!$store.state.games[$store.state.multiplayer.createGame] && !$store.state.games[$store.state.multiplayer.joinGame]" 
                    class="xxlarge button-blue center" 
                    height="100%" width="100%" 
                    textWrap="true"
                    text="Create New Game">
                    </button>

                    <!-- If hosting a game -->
                    <flex height="100%" width="100%" v-else-if="$store.state.multiplayer.createGame && $store.state.games[$store.state.multiplayer.createGame] && $store.state.games[$store.state.multiplayer.createGame].players.indexOf($store.state.user.uid) == 0" class="column flex-between">
                        <flex width="100%" class="flex-between align-center">
                            <button height="62%" @tap="cancelGame()">Cancel</button>
                            <button height="62%" v-if="$store.state.games[$store.state.multiplayer.createGame].players[1]" width="62%" @tap="startGame()" class="button-blue" text="Start">Start</button>
                            <flex  height="62%" width="62%" v-else class="flex-center align-center">
                                <label text="Waiting on players.."></label>    
                            </flex>
                            
                        </flex>
                        <flex class="column flex-around flex1">
                            
                            <flex width="100%" class="flex-between align-center border-bottom" >
                                <label text="Player 2"></label> 
                                <label :text="$store.state.index.users[$store.state.games[$store.state.multiplayer.createGame].players[1]] || 'Waiting...'"></label>
                                <button 
                                height="100%" class="button-green small" 
                                @tap="$store.state.games[$store.state.multiplayer.createGame].players[1] ? bootPlayer($store.state.games[$store.state.multiplayer.createGame].players[1], $store.state.multiplayer.createGame) : invitePlayer()" 
                                :text="$store.state.games[$store.state.multiplayer.createGame].players[1] ? 'boot' : 'invite' "></button>
                            </flex>
                            <flex width="100%" class="flex-between align-center border-bottom">
                                <label text="Player 3"></label> 
                                <label :text="$store.state.index.users[$store.state.games[$store.state.multiplayer.createGame].players[2]] || 'Waiting...'"></label>
                                <button 
                                height="100%" class="button-green small" 
                                @tap="$store.state.games[$store.state.multiplayer.createGame].players[2] ? bootPlayer($store.state.games[$store.state.multiplayer.createGame].players[2], $store.state.multiplayer.createGame) : invitePlayer()" 
                                :text="$store.state.games[$store.state.multiplayer.createGame].players[2] ? 'boot' : 'invite' "></button>
                            </flex>
                            <flex width="100%" class="flex-between align-center border-bottom">
                                <label text="Player 4"></label> 
                                <label :text="$store.state.index.users[$store.state.games[$store.state.multiplayer.createGame].players[3]] || 'Waiting...'"></label>
                                <button 
                                height="100%" class="button-green small" 
                                @tap="$store.state.games[$store.state.multiplayer.createGame].players[3] ? bootPlayer($store.state.games[$store.state.multiplayer.createGame].players[3], $store.state.multiplayer.createGame) : invitePlayer()" 
                                :text="$store.state.games[$store.state.multiplayer.createGame].players[3] ? 'boot' : 'invite' "></button>
                            </flex> 
                        </flex>               
                    </flex>


                    <!-- If joined a game -->
                    <flex height="100%" width="100%" v-else-if="$store.state.multiplayer.joinGame &&$store.state.games[$store.state.multiplayer.joinGame] && $store.state.games[$store.state.multiplayer.joinGame].players.indexOf($store.state.user.uid) > 0"
                    class="column">
                        <flex height="100%" class="column flex-around">
                            <button height="20%" @tap="bootPlayer($store.state.user.uid, $store.state.multiplayer.joinGame)" width="100%" class="button-blue">Leave Game</button>
                            <flex height="20%" width="100%" class="flex-between border-bottom">
                                <label text="Player 1"></label> 
                                <label :text="$store.state.index.users[$store.state.games[$store.state.multiplayer.joinGame].players[0]]"></label>
                            </flex>
                            <flex height="20%" v-if="$store.state.games[$store.state.multiplayer.joinGame].players[1] !== $store.state.user.uid" width="100%" class="flex-between align-center border-bottom" >
                                <label class="small" text="Player 2"></label> 
                                <label class="small" :text="$store.state.index.users[$store.state.games[$store.state.multiplayer.joinGame].players[1]] || 'Waiting...'"></label>
                                <button 
                                height="100%"
                                v-if="!$store.state.games[$store.state.multiplayer.joinGame].players[1]"
                                class="button-green small" 
                                @tap="invitePlayer()" 
                                text="invite"></button>
                            </flex>
                            <flex height="20%" v-if="$store.state.games[$store.state.multiplayer.joinGame].players[2] !== $store.state.user.uid" width="100%" class="flex-between align-center border-bottom">
                                <label class="small" text="Player 3"></label> 
                                <label class="small" :text="$store.state.index.users[$store.state.games[$store.state.multiplayer.joinGame].players[2]] || 'Waiting...'"></label>
                                <button 
                                height="100%"
                                v-if="!$store.state.games[$store.state.multiplayer.joinGame].players[2]"
                                class="button-green small" 
                                @tap="invitePlayer()" 
                                text="invite"></button>
                            </flex>
                            <flex height="20%" v-if="$store.state.games[$store.state.multiplayer.joinGame].players[3] !== $store.state.user.uid" width="100%" class="flex-between align-center border-bottom">
                                <label class="small" text="Player 4"></label> 
                                <label class="small" :text="$store.state.index.users[$store.state.games[$store.state.multiplayer.joinGame].players[3]] || 'Waiting...'"></label>
                                <button 
                                height="100%"
                                v-if="!$store.state.games[$store.state.multiplayer.joinGame].players[3]"
                                class="button-green small" 
                                @tap="invitePlayer()" 
                                text="invite"></button>
                            </flex>
                        </flex>
                    </flex>

                    <!-- If something's wrong -->
                    <stack v-else>
                        <label text="Errors, yo. Reset games."></label>
                        <button @tap="$store.state.multiplayer.joinGame = false">RESeT</button>
                    </stack>
                </flex>
            </flex>
        </flex>
    </flex>
</template>

<script>
    import localStorage from 'nativescript-localstorage'
    import dialogs from "ui/dialogs"
    import menu from '../Ux/Menu.vue'
    import firebase from 'nativescript-plugin-firebase'

    export default {
        components: {menu},
        data() {
            return {
                game: '',
                newGame: {
                    name:'',
                    players: [this.$store.state.user.uid],
                    started: false,
                    ended: false,
                    usesCardset: '0',
                    public: true,
                    timestamp: Date.now()
                }
            }
        },
        methods: {
            bootPlayer(playerID, gameID){
                console.log('TODO: Boot Player', playerID, 'from', this.$store.state.games[gameID].name)
                this.$store.state.games[gameID].players.pop(
                    this.$store.state.games[gameID].players.indexOf(playerID)
                )
                // this.$store.state.multiplayer.joinGame = false
                console.log(
                    'player popped?' , 
                    playerID , 
                    JSON.stringify(this.$store.state.games[gameID].players)
                )
                firebase.setValue(
                    'games/' + gameID + '/players', 
                    this.$store.state.games[gameID].players
                ).then((data)=>{
                    this.$store.dispatch('initAction')
                })
            },
            cancelGame(){
                this.$store.dispatch('cancelGameAction', {
                    url:'/games',
                    payload: this.$store.state.multiplayer.createGame
                })
            },
            chooseCardset(){
                let cardsets = []
                let cardsetsPrep = {stock: 0}
                this.$store.state.userAssets.cardsets.forEach((cardsetID)=>{
                    var name = this.$store.state.cardsets[cardsetID].name
                    cardsetsPrep[name] = cardsetID
                    cardsets.push(name)
                })

                var options = {
                    title: "Choose cardset to play with",
                    cancelButtonText: "Cancel",
                    actions: cardsets
                }
                dialogs.action(options).then((result) => { 
                    console.log('chosen cardset', JSON.stringify(cardsetsPrep[result]))
                    cardsetsPrep[result] == undefined ? cardsetsPrep[result] = 0 : null
                    return firebase.setValue(
                        'games/' + this.$store.state.multiplayer.createGame + '/usesCardset', 
                        cardsetsPrep[result]
                    ).then(()=>{
                        this.$store.state.games[this.$store.state.multiplayer.createGame].usesCardset = cardsetsPrep[result]
                    })
                    // return this.newCard.cardset = this.cardsetsPrep[result]
                })
            }, 
            createGame(){
                this.$store.state.multiplayer.joinGame ? 
                    this.bootPlayer(this.$store.state.user.uid, this.$store.state.multiplayer.joinGame) 
                : null
                this.newGame.type = 'games'
                dialogs.prompt('Name the game', '').then((r)=>{
                    if(r.result){
                        this.newGame.name = r.text
                        this.$store.dispatch('createGameAction', {
                            url:'/games',
                            payload: this.newGame
                        })
                    } else {
                        dialogs.alert('Games gotta be named')
                    }
                })
            },
            getPlayerName(playerID){
                firebase.getValue('users/'+playerID+'/name').then(function(result) {
                    console.log('result', JSON.stringify(result, null, 2))
                    this.$store.state.players[playerID] = result.value
                    return result.value
                })
            },
            invitePlayer(){
                console.log('TODO: Invite Player')
            },
            joinGame(gameID){
                console.log('Join Game: ', gameID)
                this.$store.state.multiplayer.joinGame = gameID
                this.$store.dispatch('joinGameAction', gameID)
            },
            startGame(){
                var spaces = {}
                this.$store.state.games[this.$store.state.multiplayer.createGame].players.forEach((player)=>{
                    spaces[player] = 0

                })
                this.$store.state.router = this.$router
                // console.log('TODO: Start Game', JSON.stringify(this.$store.state.games[this.$store.state.multiplayer.createGame]))
                this.$store.state.games[this.$store.state.multiplayer.createGame].gameState = {
                    playerTurn:this.$store.state.user.uid,
                    spaces: spaces, 
                    timeouts: {
                        jail: {},
                        school: {},
                        work: {}
                    },
                    turns: [],
                    winner: false
                }
                firebase.setValue('games/'+this.$store.state.multiplayer.createGame, this.$store.state.games[this.$store.state.multiplayer.createGame]).then(()=>{
                        firebase.setValue('games/'+this.$store.state.multiplayer.createGame+'/started', true).then(()=>{
                        firebase.remove('multiplayer/start/'+this.$store.state.multiplayer.createGame)
                    })
                })
                

                // TODO this game starter
            }
        },
        mounted(){
        }
    }
</script>