const application = require('application')
// import isAndroid from 'nativescript-platform'

// import localStorage from 'nativescript-localstorage'
import firebase from 'nativescript-plugin-firebase'

import Vue from 'nativescript-vue'
import Vuex from 'vuex'
import Router from 'vue-router'
import StoreConf from './store/store.js'

import App from './components/App.vue'
import Auth from './components/Auth.vue'
import Begin from './components/Onboard/Begin.vue'
import Board from './components/Game/Board.vue'
import Explore from './components/Onboard/Explore.vue'
import Hustles from './components/Game/Hustles.vue'
// import Cards from './components/Settings/Cards.vue'
// import Multiplayer from './components/Game/Multiplayer.vue'
import Rules from './components/Rules.vue'
import Start from './components/Game/Start.vue'
// import Test from './components/TestComponent.vue'

console.log(application)

firebase
    .init({
        persist: true,
        iOSEmulatorFlush: true
        //storageBucket: 'gs://sxan-89600.appspot.com/'
    })
    .then(
        function(instance) {
            console.log('firebase.init done', instance)
        },
        function(error) {
            console.log('firebase.init error: ' + error)
        }
    )

global.process = {
    env: {}
}

/* ROUTES */

Vue.use(Router)
const router = new Router({
    routes: [
        {
            path: '/auth',
            name: 'auth',
            component: Auth
        },
        {
            path: '/begin',
            name: 'begin',
            component: Begin
        },
        {
            path: '/onboard',
            name: 'onboard',
            component: Board
        },
        {
            path: '/hustles',
            name: 'hustles',
            component: Hustles
        },
        /*
        {
            path: '/cardsets',
            name: 'cardsets',
            component: Cards
        },
        {
            path: '/multiplayer',
            name: 'multiplayer',
            component: Multiplayer
        },*/
        {
            path: '/rules',
            name: 'rules',
            component: Rules
        },
        {
            path: '/start',
            name: 'start',
            component: Start
        },

        {
            path: '/explore',
            name: 'explore',
            component: Explore
        },
        /*
         {
            path: '/test',
            name: 'test',
            component: Test
        },*/
        {
            path: '*',
            redirect: '/start'
        }
    ]
})

Vue.use(Vuex)
const store = new Vuex.Store(StoreConf)
Vue.prototype.$store = store

/* COMPONENTS */
Vue.component('flex', {
    template: '<flexbox-layout><slot></slot></flexbox-layout>'
})

Vue.component('stack', {
    template: '<stack-layout><slot></slot></stack-layout>'
})

Vue.component('scroll', {
    template: '<scrollview><slot></slot></scrollview>'
})

/* DIRECTIVES */

new Vue({
    pageRouting: true,
    router,
    render: h => h('app'),
    components: {
        App,
        Auth,
        Board,
        Rules,
        Start
    },
    mounted() {
        // this.$store.commit('getUser', router)
        router.replace('/start')
        console.log('why the heck not?????')
        // !this.$store.state.user.uid
        //     ? router.replace('/auth')
        //     : router.replace('/start')
        console.log('app init')
    }
}).$start()
