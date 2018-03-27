<template>
    <flex class="column flex-between">
        <menu></menu>
        <flex height="88%" class="flex-between">
            <flex width="45%" height="100%" class="column flex-between pad2">
                <label @tap="newCard = $store.state.debug.tests.newCard; createCard()">Create Card</label>
                <flex class="container column flex-between">
                        <text-field class="margin2" width="100%" v-model="newCard.name" hint="Name of Card"></text-field>
                    <flex class="flex-between align-center button button-white" width="100%">
                        <label width="80%" @tap="chooseEffect()">Effect: {{newCard.effect}}</label>
                        <label @tap="chooseEffect()">v</label>
                    </flex>
                    <flex class="align-center" orientation="horizontal" width="100%">
                        <button class="button-green" @tap="chooseImage()">Choose Image</button>
                    </flex>
                    <flex class="flex1" orientation="horizontal" width="100%">
                        <text-view class="flex1" hint="Write a rap" v-model="newCard.rap"></text-view>
                    </flex>
                    <flex class="flex-between align-center" width="100%">
                        <label width="70%" class="button button-white self-center" @tap="chooseCardset()" text="Cardset?"></label>
                        <button width="30%" class="flex-center align-center button button-blue" @tap="createCard()" text="Save">
                        </button>
                    </flex>
                </flex>
            </flex>

            <!-- Leaving this problem with scrollview fucking up for later. -->
            <flex width="55%" height="100%" class="column flex-between pad2">
                <label>Edit Cardsets</label>
                <flex height="88%" class="container column">
                    <flex class="align-center" height="16%">
                        <flex height="32dp" width="32dp" class="flex-center align-center button-circle button-green" text="+">
                            <button class="medium button-circle" height="100%" width="100%" >+</button>
                        </flex>
                        <label @tap="createCardset()" text="Create new cardsEt">
                    </flex>
                    <scroll height="84%">
                        <stack textWrap="true" >
                            <flex :key="cardsetIndex" v-for="(cardset, cardsetIndex) in $store.state.userAssets.cardsets" textWrap="true" class="column">
                                <flex height="40dp" class="button pad4 button-white">
                                    <label @tap="showCardset(cardset)" class="flex1 blue">
                                        {{$store.state.cardsets[cardset].name}}
                                    </label>
                                    <label @tap="showCardset(cardset)">
                                        {{show.cardset == cardsetIndex ? 'v' : '>'}}
                                    </label>
                                </flex>
                                <flex v-if="show.cardset == cardset">
                                    <label width="10%"></label>
                                    <label width="40%">Card Name</label>
                                    <label width="30%">Effect</label>
                                    <label width="20%">add cards</button>
                                    </label>
                                </flex>
                                <flex :key="cardIndex" v-if="show.cardset == cardset" v-for="(card, cardIndex) in $store.state.cardsets[cardset].cards">
                                    <label class="anon" width="10%">
                                    {{cardIndex+1}}.</label>
                                    <label textWrap="true" class="anon" width="40%">{{$store.state.index.cards[card]}}</label>
                                    <!-- <label class="anon" width="30%">{{$store.state.cards[cardIndex].effect}}</label> -->
                                    <flex width="20%" class="flex-around">
                                        <label text="edit"></label>
                                        <label text="x"></label>
                                    </flex>
                                </flex>
                            </flex>
                        </stack>
                    </scroll>
                </flex>
            </flex>
        </flex>
    </flex>
</template>

<script>
    import dialogs from "ui/dialogs"
    import * as listPickerModule from 'tns-core-modules/ui/list-picker'
    import menu from '../Ux/Menu.vue'

    export default {
        components: {menu},
        data() {
            return {
                cardsetsPrep:{},
                newCard: {
                    cardsets: [],
                    name: '',
                    effect: '',
                    image: '',
                    rap: '',
                    type:'cards'
                },
                effects: ['jail', 'school', 'stay', 'work', 'pass', 'dead'], 
                show: {
                    picker: false,
                    effects: false,
                    cardsets: false,
                    cardset: ''
                }
            }
        },
        methods: {
            debugLog(){
                for(const prop in this.cardsets){
                    console.log(prop, this.cardsets[prop])
                }
            },
            chooseCardset(){
                let cardsets = []
                this.$store.state.userAssets.cardsets.forEach((cardsetID)=>{
                    var name = this.$store.state.cardsets[cardsetID].name
                    this.cardsetsPrep[name] = cardsetID
                    cardsets.push(name)
                })
                /*for(const cardsetID in this.$store.state.userAssets.cardsets) {
                    this.cardsetsPrep[this.$store.state.cardsets[cardsetID].name] = cardsetID
                    cardsets.push(this.$store.state.cardsets[cardsetID].name)
                }*/
                var options = {
                    title: "Choose cardset to add this card to",
                    cancelButtonText: "Cancel",
                    actions: cardsets
                }
                dialogs.action(options).then((result) => { 
                    console.log('chosen cardset', this.cardsetsPrep[result])
                    return this.newCard.cardset = this.cardsetsPrep[result]
                })
            },
            chooseImage(){
                this.$store.commit('chooseImage')
            },
            chooseEffect(){
                var options = {
                    title: "What effect happens when a player gets this card?",
                    cancelButtonText: "Cancel",
                    actions: this.effects
                }
                dialogs.action(options).then((result) => { 
                    return this.newCard.effect = result
                })
            },
            createCard () {
                this.newCard.type = 'cards'
                this.$store.dispatch('postNewCard', {
                    url:'/cards/',
                    payload: this.newCard,
                })
            },
            createCardset () {
                dialogs.prompt('Create Cardset', '').then((r)=>{
                    console.log('Dialog result: ' + r.result + ', text: ' + r.text)
                    if(r.result){
                        this.$store.dispatch('postNewCardset', {
                            url:'/cardsets/',
                            payload: {
                                name: r.text,  
                                type: 'cardsets'}
                        })
                        this.$store.dispatch( 'getDataAction','/users/'+ this.$store.state.user.uid +'/cardsets')
                    } else {
                        dialogs.alert('Cardsets must be named')
                    }
                })
            },
            getCardsets: function(){
                const type = 'cardsets'
                this.$store.state.userAssets.cardsets.forEach((cardsetID)=>{
                    this.$store.dispatch('getDataAction', {
                        id: cardsetID,
                        type: type
                    })
                })
            },
            showCardset: function(id){
                console.log('cardset id', id, 'show.cardset', this.show.cardset)
                this.show.cardset = this.show.cardset !== id ? this.show.cardset = id : false
            }
        },
        mounted(){
        }
    }
</script>
