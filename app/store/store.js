import api from './api.js'
import platform from 'nativescript-platform'

const StoreConf = {
    state: {
        cards: {},
        cardsets: {},
        create: {
            user: {
                email: '',
                name: '',
                password: ''
            }
        },
        device: {
            width: platform.screen.widthPixels / 100,
            height: platform.screen.heightPixels / 100,
            unit:
                (platform.screen.widthPixels + platform.screen.heightPixels) /
                200,
            uuid: platform.uuid
        },
        hustles: {
            general: ['Explore', 'Post', '5 Questions'],
            cannabis: ['Explore', 'Toke\'n\'Tell', '5 Questions'],
            music: ['Explore', 'Share a song', '5 Questions'],
            startups: ['Explore', 'Connect', '5 Questions']
        },
        index: {
            users: {}
        },
        industry: '',
        industrySuggestions: [],
        loading: false,
        msgs: {
            begin: [
                '10 more SXOINS! SXAN is a game of hustles. You\'ve completed 2 hustles, earning 21 SXOINS and 2 XEYs'
            ],
            onboarding: ['Would you like to play SXAN?']
        },
        playerColors: ['#ce56e8', '#e85656', '#aae95a', '#56e6e8'],
        processingTasks: [],
        show: {
            begin: {
                start: true,
                next1: false,
                next2: false,
                next3: false,
                next4: false
            },
            onboarding: {
                buttons: false,
                newPlayerButtons: false,
                signup: false
            },
            menu: false
        },
        sxoins: [],
        uploadUri: '',
        user: {},
        xeys: { public: [], private: [], temp: [] },
        xeysTotal: 0
    },
    mutations: api,
    getters: {},
    actions: {
        cancelGameAction({ commit }, obj) {
            return new Promise(resolve => {
                commit('cancelGame', obj)
                resolve()
            })
        },
        createGameAction({ commit }, obj) {
            return new Promise(resolve => {
                commit('pushData', obj)
                resolve()
            })
        },
        getDataAction({ commit }, obj) {
            return new Promise(resolve => {
                commit('getData', obj)
                resolve()
            })
        },
        getUserAction({ commit }) {
            return new Promise(resolve => {
                commit('getUser')
                resolve()
            })
        },
        joinGameAction({ commit }, obj) {
            return new Promise(resolve => {
                commit('joinGame', obj)
                resolve()
            })
        },
        loginAction({ commit }, obj) {
            return new Promise(resolve => {
                commit('login', obj)
                resolve()
            })
        },
        facebookLoginAction({ commit }) {
            return new Promise(resolve => {
                commit('facebookLogin')
                resolve()
            })
        },
        initAction({ commit }) {
            return new Promise(resolve => {
                commit('init')
                resolve()
            })
        },
        postNewCard({ commit }, obj) {
            return new Promise(resolve => {
                commit('pushData', obj)
                resolve()
            })
        },
        postNewCardset({ commit }, obj) {
            return new Promise(resolve => {
                commit('pushData', obj)
                resolve()
            })
        },
        setDataAction({ commit }, obj) {
            console.log('setting data', obj)
            return new Promise(resolve => {
                commit('setData', obj)
                resolve()
            })
        },
        syncAction({ commit }, obj) {
            console.log('syncing data', obj)
            return new Promise(resolve => {
                commit('sync', obj)
                resolve()
            })
        },
        unjoinGameAction({ commit }, obj) {
            console.log('unjoin game action')
            return new Promise(resolve => {
                commit('unjoinGame', obj)
                resolve()
            })
        },
        updateDataAction({ commit }, obj) {
            console.log('updating data', obj)
            return new Promise(resolve => {
                commit('updateData', obj)
                resolve()
            })
        }
    }
}
export default StoreConf
