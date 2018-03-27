<template>
    <flexbox-layout height="100%" width="100%" class="flex-between column background">
        <ScrollView class="msgs" id="scroller">
            <stack-layout textWrap="true">
                <label textWrap="true" class="msg" :key="msgIndex" v-for="(msg, msgIndex) in $store.state.msgs.onboarding" :text="msg"></label>
            </stack-layout>
        </ScrollView>
        <button v-if="originalButton" @tap="init()">YES</button>
        
        <stack-layout v-else-if="$store.state.show.onboarding.buttons" class="button-block">
            <button @tap="$router.push('auth')" class="onboard">Continue</button> 
            <flexbox-layout class="flex-between">
                <button class="flex1 onboard" @tap="$store.state.show.onboarding.buttons = false">?</button>
                <button class="flex1 onboard" @tap="newPlayerStart()">New Player</button>
            </flexbox-layout>
            
        </stack-layout>
        
        <stack-layout v-else-if="$store.state.show.onboarding.newPlayerButtons" class="button-block">
            <button @tap="signup()" class="onboard">Sign Up</button> 
            <flexbox-layout class="flex-between">
                <button class="flex1 second-choice" @tap="$router.push('auth')">Sign In</button>
                <button class="flex1 second-choice" @tap="$router.push('explore')">Explore</button>
            </flexbox-layout>
            
        </stack-layout>

        <flexbox-layout v-else-if="$store.state.show.onboarding.signup" class="column flex-between flex1">
            <flexbox-layout width="100%" class="column flex-center align-center flex1">
                <text-field width="100%" v-model="email" hint="email"></text-field>
            </flexbox-layout>
            <stack-layout class="button-block">
                <button @tap="saveEmail()" class="onboard">Create Player</button> 
                <flexbox-layout class="flex-between">
                    <button class="flex1 second-choice" @tap="$router.push('auth')" text="Sign In"></button>
                    <button class="flex1 second-choice" @tap="$router.push('explore')">Explore</button>
                </flexbox-layout>
            </stack-layout>
        </flexbox-layout>
        <flexbox-layout v-else-if="$store.state.show.onboarding.password" class="column flex-between flex1">
            <flexbox-layout width="100%" class="column flex-center align-center flex1">
                <label :text="$store.state.create.user.email"></label>
                <text-field width="100%" v-model="$store.state.create.user.name" hint="Your Name"></text-field>
                <text-field width="100%" secure="true" v-model="$store.state.create.user.password" hint="Password"></text-field>
            </flexbox-layout>
            <stack-layout >
                <flexbox-layout class="flex-between">
                    <button class="flex1 second-choice" @tap="$router.push('start')" text="<"></button>
                    <button class="flex1 onboard" @tap="createPlayer()">Save Progress</button>
                </flexbox-layout>
            </stack-layout>
        </flexbox-layout>
        <stack-layout v-else>
            <label text="Something went wrong"></label>
            <button class="onboard" @tap="$router.go('start')">Restart</button>
        </stack-layout>
    </flexbox-layout>
</template>
<script>
import dialogs from 'ui/dialogs'
import menu from '../Ux/Menu.vue'
import firebase from 'nativescript-plugin-firebase'
import performance from 'performance-now'
export default {
    components: { menu },
    data() {
        return {
            email: '',
            pass: '',
            originalButton: true
        }
    },
    computed: {},
    methods: {
        createPlayer() {
            this.$store.commit('create', this.$store.state.create.user)
            this.keepChecking()
        },
        init() {
            // const timestamp = Date.now() + '-' + performance()
            // this.$store.state.sessionTimestamp = timestamp
            this.$store.state.show.onboarding.buttons = true
            this.originalButton = false
            this.$store.state.show.menu = true
            this.$store.state.msgs.onboarding.push(
                'Use this public XEY to access SXAN.'
            )
            this.$store.commit('createXey', {})
            /*firebase
                .push('xeys/temp', {
                    time: timestamp,
                    type: 'xey'
                })
                .then(result => {
                    console.log('xey created', result.key)
                    console.dir(JSON.stringify(result))
                    this.$store.state.xeys.temp.push(result.key)
                    console.log(
                        'this.$store.state.xeys.temp',
                        this.$store.state.xeys
                    )
                })*/
        },
        keepChecking: function() {
            setTimeout(() => {
                console.log('Promises?', this.$store.state.user.uid)
                this.$store.state.user.uid
                    ? this.$router.push('begin')
                    : this.keepChecking()
            }, 1000)
        },

        newPlayerStart() {
            /*const newPlayerTimestamp = Date.now() + '-' + performance()
            firebase.update('xeys/temp/' + this.$store.state.xeys.temp[0], {
                uses: [newPlayerTimestamp]
            })
            firebase
                .push('sxoins', {
                    time: newPlayerTimestamp,
                    challenge: this.$store.state.xeys.temp[0],
                    type: 'sxoins'
                })
                .then(sxoinResult => {
                    console.log('sxoin created', sxoinResult.key)
                    console.dir(JSON.stringify(sxoinResult))
                    this.$store.state.sxoins.push(sxoinResult.key)
                    console.log(
                        'this.$store.state.sxoins',
                        this.$store.state.sxoins
                    )
                })*/
            this.$store.state.show.onboarding.buttons = false
            this.$store.state.show.onboarding.newPlayerButtons = true

            this.$store.state.msgs.onboarding = ['You won a SXOIN.']
            this.$store.state.xeysTotal = 1

            setTimeout(() => {
                this.$store.state.msgs.onboarding.push(
                    'SXAN is a productivity exchange for humans.'
                )
            }, 1000)
            setTimeout(() => {
                this.$store.state.msgs.onboarding.push(
                    'Players receive value through every engagement.'
                )
            }, 2000)
            setTimeout(() => {
                this.$store.state.msgs.onboarding.push(
                    'What would you like to do next?'
                )
            }, 3000)
        },
        saveEmail() {
            this.$store.state.create.user.email = this.email
            this.$store.state.msgs.onboarding = [
                'You won 10 more SXOINS and a private XEY'
            ]
            this.$store.state.xeysTotal = 11
            setTimeout(() => {
                this.$store.state.msgs.onboarding.push(
                    'Now, enter your name and a passphrase below. Then save your progress with the private XEY. '
                )
            }, 1000)
            this.$store.state.show.onboarding.signup = false
            this.$store.state.show.onboarding.password = true
            firebase.push('signups', this.email)
        },
        signup() {
            this.$store.state.msgs.onboarding = ['Enter your email to signup.']
            this.$store.state.show.onboarding.newPlayerButtons = false
            this.$store.state.show.onboarding.signup = true
        }
    },
    mounted() {}
}
</script>
<style>
.button-block {
  min-height: 100dpi;
}
text-field {
  margin: 1dpi;
  font-size: 30dpi;
  color: rgb(63, 63, 63);
  border-bottom-width: 2dpi;
  border-bottom-color: rgba(0, 0, 0, 0.3);
}
.msgs {
  background-color: rgba(255, 255, 255, 0.5);
  border-width: 2dpi;
  border-color: aliceblue;
}
label.msg {
  background-color: rgba(255, 255, 255, 0.3);
  padding: 1dpi;
  color: black;
  font-size: 30dpi;
}
button.onboard {
  margin: 1dpi;
}
</style>
