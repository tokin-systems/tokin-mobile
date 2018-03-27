'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var firebase$1 = _interopDefault(require('nativescript-plugin-firebase'));
var Vue = _interopDefault(require('nativescript-vue'));
var Vuex = _interopDefault(require('vuex'));
var Router = _interopDefault(require('vue-router'));
var dialogs$1 = _interopDefault(require('ui/dialogs'));
var fs = _interopDefault(require('file-system'));
var localStorage = _interopDefault(require('nativescript-localstorage'));
var imagepicker = require('nativescript-imagepicker');
var performance = _interopDefault(require('performance-now'));
var platform = _interopDefault(require('platform'));
var platform$1 = _interopDefault(require('nativescript-platform'));

console.log(dialogs$1);
var api = {
    name: function name() {
        return 'api';
    },
    cancelGame: function cancelGame(state, obj) {
        delete state.multiplayer.start[obj.payload];
        delete state.games[obj.payload];
        delete state.index.games[obj.payload];
        state.userAssets.games.splice(state.userAssets.games.indexOf(obj.payload), 1);
        firebase$1.setValue('users/' + state.user.uid + obj.url, state.userAssets.games);
        firebase$1.remove(obj.url + '/' + obj.payload);
        firebase$1.remove('index/' + obj.url + '/' + obj.payload);
        firebase$1.remove('multiplayer/start/' + obj.payload);
        localStorage.setItem('games', JSON.stringify(state.games));
        localStorage.setItem('index', JSON.stringify(state.index));
        localStorage.setItem('multiplayer', JSON.stringify(state.multiplayer));
        localStorage.setItem('userAssets', JSON.stringify(state.userAssets));
        api.init(state);
    },
    chooseImage: function chooseImage(state) {
        var context = imagepicker.create({ mode: 'single' });
        context.authorize().then(function () {
            return context.present();
        }).then(function (selection) {
            selection.forEach(function (selected) {
                state.uploadUri = selected.fileUri;
            });
            return selection;
        }).catch(function (e) {
            console.log('no image selected', e);
        });
    },
    createSxoin: function createSxoin(state, obj) {
        console.log('Creating SXOIN', 'xey: ' + obj.xey, 'user: ' + obj.user);
        var date = Date.now();
        var random = Math.floor(Math.random() * 999999);
        var timestamp = date + '-' + random + '_' + platform.device.uuid + '_' + performance();
        return firebase$1.push('sxoins', {
            time: timestamp,
            challenge: obj.xey,
            ledger: [{
                created: date
            }]
        }).then(function (result) {
            state.sxoins.push(result.key);
            firebase$1.setValue('users/' + obj.user + '/sxoins', state.sxoins);
            return result.key;
        });
    },
    createXey: function createXey(state, obj) {
        console.log('Creating XEY', 'originator: ' + obj.user || 'SXAN');
        var date = Date.now();
        var random = Math.floor(Math.random() * 999999);
        var timestamp = date + '-' + random + '_' + platform.device.uuid + '_' + performance();
        return firebase$1.push('xeys/' + (obj.privacy || 'temp'), {
            time: timestamp,
            utility: obj.utility || 'general',
            originator: obj.user || 'SXAN',
            ledger: [{
                created: date
            }]
        }).then(function (result) {
            state.xeys[obj.privacy || 'temp'].push(result.key);
            obj.user ? firebase$1.setValue('users/' + obj.user + '/xeys', state.xeys) : null;
            state.xeysTotal = state.xeys.private.length + state.xeys.public.length + state.xeys.temp.length;
            return result.key;
        });
    },
    create: function create$$1(state, obj) {
        console.log('state', JSON.stringify(state), 'payload', JSON.stringify(obj));
        firebase$1.createUser({
            email: obj.email,
            password: obj.password
        }).then(function (result) {
            firebase$1.setValue('/users/' + result.key + '/name', obj.name);
            firebase$1.setValue('/users/' + result.key + '/devices', [platform.device.uuid]);
            firebase$1.setValue('index/users/' + result.key, obj.name);
            dialogs$1.alert({
                title: 'Player created',
                message: 'Player: ' + obj.name + ' is in the app!',
                okButtonText: 'LOG IN!'
            });
            firebase$1.login({
                type: firebase$1.LoginType.PASSWORD,
                passwordOptions: {
                    email: obj.email,
                    password: obj.password
                }
            }).then(function (result) {
                result.name = obj.name;
                firebase$1.setValue('/users/' + result.uid + '/auth', result).then(function () {
                    state.user = result;
                    localStorage.setItem('user', JSON.stringify(result, null, 2));
                    console.log('login successful: ', JSON.stringify(state.user, null, 2));
                    console.log('READY DEPOSIT');
                    for (var x = 0; x < 21; x++) {
                        setTimeout(function () {
                            var sxoinObj = {
                                xey: state.xeys.temp[0],
                                user: result.uid
                            };
                            api.createSxoin(state, sxoinObj);
                        }, 10 + x);
                    }
                    console.log('SAVE XEYS');
                    firebase$1.getValue('xeys/temp/' + state.xeys.temp[0]).then(function (tempResult) {
                        tempResult.value.ledger.push({ transformed: Date.now() + '-' + result.uid });
                        firebase$1.setValue('xeys/public/' + state.xeys.temp[0], tempResult.value).then(function () {
                            state.xeys.public = [state.xeys.temp[0]];
                            firebase$1.setValue('/users/' + result.uid + '/xeys/public', state.xeys.public);
                            firebase$1.remove('xeys/temp/' + state.xeys.temp[0]);
                            state.xeys.temp = [];
                            var xeyObj = {
                                privacy: 'private',
                                utility: 'signing',
                                user: result.uid
                            };
                            api.createXey(state, xeyObj);
                        });
                    });
                });
            }, function (errorMessage) {
                console.log(errorMessage);
            });
        }, function (errorMessage) {
            dialogs$1.alert({
                title: 'No user created',
                message: errorMessage,
                okButtonText: 'OK, got it'
            });
        });
    },
    facebookLogin: function facebookLogin(state) {
        state.user = {};
        firebase$1.logout();
        firebase$1.login({
            type: firebase$1.LoginType.FACEBOOK,
            facebookOptions: {
                scope: ['public_profile', 'email']
            }
        }).then(function (result) {
            localStorage.setItem('games', JSON.stringify({}));
            firebase$1.update('/users/' + result.uid + '/auth', result);
            firebase$1.update('/users/' + result.uid + '/name', result.name);
            firebase$1.setValue('/index/users/' + result.uid, result.name);
            localStorage.setItem('user', JSON.stringify(result));
            state.user = result;
            api.init(state);
            return state.user;
        }, function (errorMessage) {
            dialogs$1.alert({
                title: 'Something went wrong',
                message: 'Try to login again',
                okButtonText: 'OK, will do'
            });
            console.log(errorMessage);
        });
    },
    getData: function getData(state, obj) {
        firebase$1.getValue(obj.type + '/' + obj.id).then(function (result) {
            state[obj.type][obj.id] = result.value;
        });
    },
    getUser: function getUser(state, router) {
        localStorage.getItem('user') ? (state.user = JSON.parse(localStorage.getItem('user')), router.push('/start')) : firebase$1.getCurrentUser().then(function (result) {
            result.uid ? router.push('/start') : (localStorage.clear(), router.push('/auth'));
            state.user = result;
        }, function (errorMessage) {
            console.log(errorMessage);
        });
    },
    init: function init(state) {
        var userUrl = 'users/' + state.user.uid + '/';
        var initArray = [{
            key: 'name',
            url: userUrl + 'name',
            default: 'Player',
            assets: false
        }, { key: 'index', url: 'index', default: {}, assets: false }, { key: 'cards', url: userUrl + 'cards', default: [], assets: true }, { key: 'cards', url: 'cards', default: [], assets: false }, {
            key: 'cardsets',
            url: userUrl + 'cardsets',
            default: [],
            assets: true
        }, { key: 'cardsets', url: 'cardsets', default: {}, assets: false }, { key: 'games', url: userUrl + 'games', default: [], assets: true }, {
            key: 'games',
            url: 'games',
            default: {},
            assets: false,
            iterate: true
        }];
        initArray.forEach(function (initObject) {
            firebase$1.getValue(initObject.url).then(function (result) {
                if (initObject.iterate) {
                    var isCreate = false;
                    var isJoin = false;
                    for (var game in result.value) {
                        result.value[game].started == false ? (result.value[game].players[0] == state.user.uid ? (state.multiplayer.createGame = game, state.multiplayer.start[game] = true, isCreate = true) : null, result.value[game].players.indexOf(state.user.uid) > 0 ? (state.multiplayer.joinGame = game, state.multiplayer.start[game] = true, isJoin = true) : null, state.multiplayer.start[game] = true) : result.value[game].players.indexOf(state.user.uid) >= 0 ? state.multiplayer.inGame = game : null;
                    }
                    isCreate || isJoin ? null : (state.multiplayer.createGame = false, state.multiplayer.joinGame = false);
                }
                result.value !== null ? localStorage.setItem(initObject.key, JSON.stringify(result.value)) : null;
                initObject.assets ? state.userAssets[initObject.key] = result.value || initObject.default : state[initObject.key] = result.value || initObject.default;
                localStorage.setItem('userAssets', JSON.stringify(state.userAssets));
                return state;
            });
        });
    },
    joinGame: function joinGame(state, obj) {
        state.multiplayer.createGame ? api.cancelGame(state, {
            url: '/games',
            payload: state.multiplayer.createGame
        }) : null;
        state.games[obj].players.length < 4 && state.games[obj].players.indexOf(state.user.uid) < 0 ? (state.games[obj].players.push(state.user.uid), state.multiplayer.joinGame = obj, firebase$1.setValue('games/' + state.multiplayer.joinGame + '/players', state.games[state.multiplayer.joinGame].players).then(function () {
            api.init(state);
        })) : null;
        console.log('players', JSON.stringify(state.games[obj].players));
    },
    login: function login(state, obj) {
        console.log('login: ', obj.name);
        firebase$1.login({
            type: firebase$1.LoginType.PASSWORD,
            passwordOptions: {
                email: obj.name,
                password: obj.password
            }
        }).then(function (result) {
            console.log('login result', JSON.stringify(result, null, 2));
            localStorage.setItem('user', JSON.stringify(result));
            firebase$1.update('/users/' + result.uid + '/auth', result);
            api.init(state);
            state.user = result;
            obj.router.push('/start');
            return state.user;
        }, function (errorMessage) {
            dialogs$1.alert({
                title: 'Something went wrong',
                message: 'Try to login again',
                okButtonText: 'OK, will do'
            });
            console.log(errorMessage);
        });
    },
    logout: function logout(state) {
        for (var x = 0; x < localStorage.length; x++) {
            localStorage.setItem(localStorage.key(x), '');
            localStorage.removeItem(localStorage.key(x));
        }
        localStorage.clear();
        console.log(localStorage.length);
        state.user = {};
        firebase$1.logout();
    },
    multiplayer: function multiplayer(state) {
        firebase$1.getValue('multiplayer/start').then(function (result) {
            console.log('multiplayer/start', JSON.stringify(result));
            var _loop = function _loop(game) {
                firebase$1.getValue('games/' + game).then(function (res) {
                    console.log('games/' + game, JSON.stringify(res));
                    state.games[game] = res.value;
                });
            };
            for (var game in result.value) {
                _loop(game);
            }
        });
    },
    pushData: function pushData(state, obj) {
        console.log('Pushing...', JSON.stringify(obj, null, 2));
        obj.payload.type == 'cardsets' ? obj.payload.cards = state.stock.cardsets.cards : null;
        firebase$1.push(obj.url, obj.payload).then(function (result) {
            obj.payload.type == 'games' ? (state.multiplayer.joinGame ? (state.games[state.multiplayer.joinGame].players.pop(state.user.uid), firebase$1.setValue('games/' + state.multiplayer.joinGame + '/players', state.games[state.multiplayer.joinGame].players), state.multiplayer.joinGame = false) : null, state.multiplayer.createGame = result.key, firebase$1.setValue('multiplayer/start/' + result.key, true), state.multiplayer.start[result.key] = true, localStorage.setItem('multiplayer', JSON.stringify(state.multiplayer))) : null;
            state.index[obj.payload.type] = state.index[obj.payload.type] || {};
            state.index[obj.payload.type][result.key] = obj.payload.name;
            state[obj.payload.type][result.key] = obj.payload;
            firebase$1.setValue('/index/' + obj.payload.type + '/' + result.key, obj.payload.name);
            console.log('why tf', JSON.stringify(state.userAssets[obj.payload.type]), JSON.stringify(result.key));
            state.userAssets[obj.payload.type].push(result.key);
            firebase$1.setValue('/users/' + state.user.uid + '/' + obj.payload.type, state.userAssets[obj.payload.type]);
            localStorage.setItem(obj.payload.type, JSON.stringify(state.userAssets[obj.payload.type]));
            localStorage.setItem('index', JSON.stringify(state.index));
            obj.payload.type == 'cards' ? (api.uploadImage(state, state.uploadUri, result.key), obj.payload.image = result.key + '.png', firebase$1.setValue('/cards/' + result.key + '/image', obj.payload.image), state.cardsets[obj.payload.cardset].cards.push(result.key), firebase$1.setValue('/cardsets/' + obj.payload.cardset + '/cards/', state.cardsets[obj.payload.cardset].cards)) : null;
        });
    },
    setData: function setData(state, obj) {
        console.log('setting data');
        firebase$1.setValue(obj.url, obj.payload);
        obj.type == 'changeName' ? firebase$1.setValue('/index/users/' + state.user.uid, obj.payload) : null;
    },
    sync: function sync(state, status) {
        var onChildEvent = function onChildEvent(result) {
            console.log('Sync State Event type: ' + result.type);
            console.log('Key: ' + result.key);
            if (result.type == 'ChildRemoved') {
                state.games[result.key] ? delete state.games[result.key] : null;
                state.index.games[result.key] ? delete state.index.games[result.key] : null;
                state.multiplayer.start[result.key] ? delete state.multiplayer.start[result.key] : null;
                state.multiplayer.start.games ? delete state.multiplayer.start.games : null;
                localStorage.setItem('games', JSON.stringify(state.games));
                localStorage.setItem('index', JSON.stringify(state.index));
                localStorage.setItem('multiplayer', JSON.stringify(state.multiplayer));
                api.init(state);
            }
            if (result.type == 'ChildAdded') {
                api.init(state);
            }
        };
        firebase$1.addChildEventListener(onChildEvent, status.url).then(function (listenerWrapper) {
            var path = listenerWrapper.path;
            var listeners = listenerWrapper.listeners;
            console.log(path, listeners);
        });
        firebase$1.keepInSync(status.url,
        status.status
        ).then(function () {
            console.log('firebase.keepInSync is ON for ' + status.url);
            api.init(state);
        }, function (error) {
            console.log('firebase.keepInSync error: ' + error);
        });
    },
    syncGames: function syncGames(state, status) {
        var onChildEvent = function onChildEvent(result) {
            console.log('Sync Games Event type: ' + result.type);
            console.log('Key: ' + result.key);
            result.type == 'ChildRemoved' && state.multiplayer.joinGame == result.key ? state.multiplayer.joinGame = false : null;
            api.init(state);
            result.value.players.indexOf(state.user.uid) >= 0 && result.value.started ? status.router.push('/game') : null;
        };
        firebase$1.addChildEventListener(onChildEvent, status.url).then(function (listenerWrapper) {
            var path = listenerWrapper.path;
            var listeners = listenerWrapper.listeners;
            console.log(path, listeners);
        });
        firebase$1.keepInSync(status.url,
        status.status
        ).then(function () {
            console.log('firebase.keepInSync is ON for ' + status.url);
            api.init(state);
        }, function (error) {
            console.log('firebase.keepInSync error: ' + error);
        });
    },
    unjoinGame: function unjoinGame(state, obj) {
        console.log('unjoinGame init', JSON.stringify(obj), JSON.stringify(state.games));
        console.log('unjoinGame players', JSON.stringify(state.games[obj.game]));
        state.games[obj.game].players.pop(state.games[obj.game].players.indexOf(obj.player));
        state.multiplayer.joinGame = false;
    },
    updateData: function updateData(state, obj) {
        firebase$1.update(obj.url, obj.payload).then(function (data) {
            return data;
        });
    },
    uploadImage: function uploadImage(state, uri, cardKey) {
        console.log('firebase upload', uri, cardKey);
        firebase$1.uploadFile({
            remoteFullPath: 'uploads/images/' + cardKey + '.png',
            localFile: fs.File.fromPath(uri),
            onProgress: function onProgress(status) {
                console.log('Uploaded fraction: ' + status.fractionCompleted);
                console.log('Percentage complete: ' + status.percentageCompleted);
                return status;
            }
        }).then(function (uploadedFile) {
            console.log('File uploaded: ' + JSON.stringify(uploadedFile, null, 2));
            return uploadedFile;
        }, function (error) {
            console.log('File upload error: ' + error);
        });
    }
};

var StoreConf = {
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
            width: platform$1.screen.widthPixels / 100,
            height: platform$1.screen.heightPixels / 100,
            unit: (platform$1.screen.widthPixels + platform$1.screen.heightPixels) / 200,
            uuid: platform$1.uuid
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
            begin: ['10 more SXOINS! SXAN is a game of hustles. You\'ve completed 2 hustles, earning 21 SXOINS and 2 XEYs'],
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
        cancelGameAction: function cancelGameAction(_ref, obj) {
            var commit = _ref.commit;
            return new Promise(function (resolve) {
                commit('cancelGame', obj);
                resolve();
            });
        },
        createGameAction: function createGameAction(_ref2, obj) {
            var commit = _ref2.commit;
            return new Promise(function (resolve) {
                commit('pushData', obj);
                resolve();
            });
        },
        getDataAction: function getDataAction(_ref3, obj) {
            var commit = _ref3.commit;
            return new Promise(function (resolve) {
                commit('getData', obj);
                resolve();
            });
        },
        getUserAction: function getUserAction(_ref4) {
            var commit = _ref4.commit;
            return new Promise(function (resolve) {
                commit('getUser');
                resolve();
            });
        },
        joinGameAction: function joinGameAction(_ref5, obj) {
            var commit = _ref5.commit;
            return new Promise(function (resolve) {
                commit('joinGame', obj);
                resolve();
            });
        },
        loginAction: function loginAction(_ref6, obj) {
            var commit = _ref6.commit;
            return new Promise(function (resolve) {
                commit('login', obj);
                resolve();
            });
        },
        facebookLoginAction: function facebookLoginAction(_ref7) {
            var commit = _ref7.commit;
            return new Promise(function (resolve) {
                commit('facebookLogin');
                resolve();
            });
        },
        initAction: function initAction(_ref8) {
            var commit = _ref8.commit;
            return new Promise(function (resolve) {
                commit('init');
                resolve();
            });
        },
        postNewCard: function postNewCard(_ref9, obj) {
            var commit = _ref9.commit;
            return new Promise(function (resolve) {
                commit('pushData', obj);
                resolve();
            });
        },
        postNewCardset: function postNewCardset(_ref10, obj) {
            var commit = _ref10.commit;
            return new Promise(function (resolve) {
                commit('pushData', obj);
                resolve();
            });
        },
        setDataAction: function setDataAction(_ref11, obj) {
            var commit = _ref11.commit;
            console.log('setting data', obj);
            return new Promise(function (resolve) {
                commit('setData', obj);
                resolve();
            });
        },
        syncAction: function syncAction(_ref12, obj) {
            var commit = _ref12.commit;
            console.log('syncing data', obj);
            return new Promise(function (resolve) {
                commit('sync', obj);
                resolve();
            });
        },
        unjoinGameAction: function unjoinGameAction(_ref13, obj) {
            var commit = _ref13.commit;
            console.log('unjoin game action');
            return new Promise(function (resolve) {
                commit('unjoinGame', obj);
                resolve();
            });
        },
        updateDataAction: function updateDataAction(_ref14, obj) {
            var commit = _ref14.commit;
            console.log('updating data', obj);
            return new Promise(function (resolve) {
                commit('updateData', obj);
                resolve();
            });
        }
    }
};

var menu = { template: "<flexbox-layout height=\"8%\" class=\"menu flex-between align-center\"> <button class=\"menu flex1\">?</button> <label class=\"menu flex1\">{{$store.state.xeysTotal}} XEYS</label> <label class=\"menu flex1\">{{$store.state.sxoins.length}} SXOINS</label> </flexbox-layout>",
    data: function data() {
        return {
            show: {
                logout: false
            }
        };
    },

    computed: {
        /*name: function(){
                return this.$store.dispatch('getDataAction', '/users/' + this.$store.state.user.uid + '/name')
            }*/
    },
    methods: {
        debug: function debug() {
            console.log('state');
            for (var prop in this.$store.state) {
                prop == 'games' ? console.log(JSON.stringify(this.$store.state[prop], null, 2)) : prop == 'multiplayer' ? console.log(JSON.stringify(this.$store.state[prop])) : null;
            }
            // console.dir(this.$store.state)
            /*console.log('localStorage')
                for(var x = 0; x<localStorage.length; x++){
                    console.log(
                        localStorage.key(x), 
                        JSON.stringify(
                            JSON.parse(
                                localStorage.getItem(
                                    localStorage.key(x)
                                )
                            )
                        )
                    )
                }*/
        },
        logout: function logout() {
            this.$store.commit('logout');
            this.$router.push('/auth');
        },
        reset: function reset() {
            console.log('TODO reset game');
        }
    },
    mounted: function mounted() {
        /*console.log('start mounted. user: ', this.$store.state.user.uid, 'route', this.$router.currentRoute.path)
            this.$store.state.name = this.$store.dispatch('getDataAction', '/users/' + this.$store.state.user.uid + '/name')*/
    }
};

var App = { template: "<page ref=\"page\" class=\"background\"> <stack-layout height=\"100%\"> <menu v-if=\"$store.state.show.menu\"></menu> <router-view></router-view> </stack-layout> </page>",
    components: { menu: menu },
    mounted: function mounted() {
        /*
        this.$nextTick(function(){
            this.$refs.page.nativeView.actionBarHidden = true;
            this.$refs.page.nativeView.backgroundSpanUnderStatusBar = false;
        })
            */
    }
};

var Auth = { template: "<stack-layout class=\"background pad4\"> <flexbox-layout width=\"100%\" height=\"100%\" class=\"column flex-around\"> <flexbox-Layout class=\"column\" margin=\"5%\"> <label class=\"auth-title\" textWrap=\"true\">Sign In</label> </flexbox-Layout> <flexbox-layout class=\"flex-between column\"> <stack-layout> <text-field keyboardType=\"email\" class=\"auth-input\" hint=\"Email\" v-model=\"login.name\"></text-field> <text-field returnKeyType=\"done\" class=\"auth-input\" secure=\"true\" hint=\"Password\" v-model=\"login.password\"></text-field> </stack-layout> <flexbox-layout class=\"column flex-between\"> <button @tap=\"loginMethod(login)\" class=\"onboard flex1\">Log in</button> <button @tap=\"$router.push('start')\" class=\"second-choice\" textWrap=\"true\">New Player?</button> </flexbox-layout> </flexbox-layout> </flexbox-layout> </stack-layout>",
    name: 'auth',
    data: function data() {
        return {
            create: {
                email: '',
                name: '',
                password: ''
            },
            login: {
                name: '',
                password: ''
            },
            show: 'login'
        };
    },

    methods: {
        keepChecking: function keepChecking() {
            var _this = this;

            setTimeout(function () {
                console.log('Promises?', _this.$store.state.user.uid);
                _this.$store.state.user.uid ? _this.$router.push('/start') : _this.keepChecking();
            }, 1000);
        },
        createMethod: function createMethod(obj) {
            this.$store.commit('create', obj);
            this.keepChecking();
        },
        facebookLoginMethod: function facebookLoginMethod() {
            var _this2 = this;

            this.$store.dispatch('facebookLoginAction').then(function (result) {
                _this2.keepChecking();
            });
        },
        loginMethod: function loginMethod(obj) {
            var _this3 = this;

            //console.log('Login:', obj.email)
            obj.router = this.$router;
            this.$store.dispatch('loginAction', obj).then(function (result) {
                _this3.keepChecking();
            });
        }
    },
    mounted: function mounted() {
        var _this4 = this;

        //console.log('Auth Component Mounted')
        setTimeout(function () {
            _this4.$store.state.user.uid ? _this4.$router.push('/start') : null;
        }, 3000);
    }
};

var Begin = { template: "<flexbox-layout height=\"100%\" width=\"100%\" class=\"flex-between column background\"> <ScrollView class=\"msgs\" id=\"scroller\"> <stack-layout textWrap=\"true\"> <label textWrap=\"true\" class=\"msg\" :key=\"msgIndex\" v-for=\"(msg, msgIndex) in $store.state.msgs.begin\" :text=\"msg\"></label> </stack-layout> </ScrollView> <stack-layout v-if=\"$store.state.show.begin.start\" class=\"button-block\"> <button @tap=\"next1()\" class=\"onboard\">Continue</button> <flexbox-layout class=\"flex-between\"> <button class=\"flex1 second-choice\" @tap=\"$router.push('profile')\">Skip</button> <button class=\"flex1 second-choice\" @tap=\"$router.push('explore')\">Explore</button> </flexbox-layout> </stack-layout> <stack-layout v-else-if=\"$store.state.show.begin.next1\" class=\"button-block\"> <button @tap=\"next2()\" class=\"onboard\">Next</button> <flexbox-layout class=\"flex-between\"> <button class=\"flex1 second-choice\" @tap=\"$router.push('profile')\">Skip</button> <button class=\"flex1 second-choice\" @tap=\"$router.push('explore')\">Explore</button> </flexbox-layout> </stack-layout> <stack-layout v-else-if=\"$store.state.show.begin.next2\" class=\"button-block\"> <button @tap=\"next3()\" class=\"onboard\">Next</button> <flexbox-layout class=\"flex-between\"> <button class=\"flex1 second-choice\" @tap=\"$router.push('profile')\">Skip</button> <button class=\"flex1 second-choice\" @tap=\"$router.push('explore')\">Explore</button> </flexbox-layout> </stack-layout> <stack-layout v-else-if=\"$store.state.show.begin.next3\" class=\"button-block\"> <button v-if=\"$store.state.industry.length<1\" @tap=\"chooseIndustry()\" class=\"onboard\">Choose Industry</button> </stack-layout> <stack-layout v-else-if=\"$store.state.show.begin.next4\" class=\"button-block\"> <button @tap=\"$router.push('hustles')\" class=\"onboard\">On to Hustles</button> </stack-layout> <stack-layout v-else class=\"button-block\"> <label>Houston, we have an error</label> <button @tap=\"$router.push('hustles')\" class=\"onboard\">Next Hustles</button> </stack-layout> </flexbox-layout>",
    data: function data() {
        return {};
    },

    methods: {
        chooseIndustry: function chooseIndustry() {
            var _this = this;

            dialogs$1.action({
                message: 'Choose an industry or tap "Other" to suggest one',
                cancelButtonText: 'Cancel',
                actions: ['Music', 'Cannabis', 'Startups', 'Other']
            }).then(function (result) {
                console.log('result', JSON.stringify(result));
                if (result !== 'Other') {
                    _this.$store.state.industry = result.toLowerCase();
                    console.log('result', JSON.stringify(_this.$store.state.industry));
                    firebase$1.setValue('users/' + _this.$store.state.user.auth.uid + '/industry', _this.$store.state.industry);
                    _this.$store.commit('createXey', {
                        user: 'SXAN',
                        utility: 'post',
                        privacy: 'public'
                    });
                    _this.next4();
                } else {
                    dialogs$1.prompt('Suggest an industry').then(function (r) {
                        console.log('result', JSON.stringify(r));

                        _this.$store.state.industrySuggestions.push(r.text);
                        firebase$1.push('industrySuggestions', r.text);
                    });
                }
            });
        },
        next1: function next1() {
            var _this2 = this;

            this.$store.state.show.begin.start = false;
            this.$store.state.show.begin.next1 = true;
            this.$store.state.msgs.begin = ['Use SXOINS to post content and transact with other players.'];
            firebase$1.getValue('/users/' + this.$store.state.user.uid).then(function (userResult) {
                _this2.$store.state.user = userResult.value;
            });
        },
        next2: function next2() {
            this.$store.state.show.begin.next1 = false;
            this.$store.state.show.begin.next2 = true;
            this.$store.state.msgs.begin.push('XEYs allow signing, access to SXAN features, and ensure your records are private');
        },
        next3: function next3() {
            this.$store.state.show.begin.next2 = false;
            this.$store.state.show.begin.next3 = true;
            this.$store.state.msgs.begin.push('Use SXOINs and XEYs to bridge meaningful connections in your industry.');
        },
        next4: function next4() {
            this.$store.state.show.begin.next3 = false;
            this.$store.state.show.begin.next4 = true;
            this.$store.state.msgs.begin = ['You earned another public XEY. This one let\'s you post. Certain hustles require certain XEYs...'];
        }
    }
};

var Board = { template: "<stack height=\"100%\" width=\"100%\"> <absolute-layout class=\"board\" width=\"100%\" height=\"100%\" v-if=\"loading == false && showCard == false && showOutcome == false && game.players.length > 1\"> <image :key=\"playerIndex\" v-for=\"(player, playerIndex) in $store.state.games[gameID].players\" :height=\"( ($store.state.games[gameID].gameState.playerTurn == player ? 8:5) * $store.state.device.unit) + 'px'\" :width=\"( ($store.state.games[gameID].gameState.playerTurn == player ? 8:5) * $store.state.device.unit) + 'px'\" :style=\"{zIndex:$store.state.games[gameID].gameState.playerTurn == player ? '1000' : '500', backgroundColor:$store.state.playerColors[playerIndex], marginLeft: spaceCoords[$store.state.games[gameID].gameState.spaces[player]][0] + '%', marginTop: spaceCoords[$store.state.games[gameID].gameState.spaces[player]][1] + '%', borderRadius: '100%', backgroundSize:'cover'}\" src=\"res://sxan\"> <dock-layout width=\"100%\" height=\"100%\" stretchLastChild=\"true\"> <flex dock=\"top\" class=\"flex-between align-start\" width=\"100%\"> <menu text=\"center\"></menu> <button v-if=\"$store.state.games[gameID].gameState.playerTurn == $store.state.user.uid\" style=\"padding-top:8%;padding-bottom:8%;\" :width=\"(20*$store.state.device.unit) + 'px'\" :height=\"(20*$store.state.device.unit) + 'px'\" class=\"button-green xxlarge\" @tap=\"gameLoop()\">{{playerRoll}}</button> <button textWrap=\"true\" v-else style=\"padding-top:8%;padding-bottom:8%;\" :width=\"(20*$store.state.device.unit) + 'px'\" :height=\"(20*$store.state.device.unit) + 'px'\">{{$store.state.index.users[game.gameState.playerTurn] || 'Player ' + $store.state.game.gameState.playerTurn}}'s Turn. </button> </flex> <flex class=\"flex-between align-end\" dock=\"bottom\" width=\"100%\"> <image src=\"res://sxan\" width=\"48%\"> <flex class=\"flex-center\" :height=\"(16*$store.state.device.unit) + 'px'\"> <stack :width=\"(12*$store.state.device.unit) + 'px'\" :height=\"(12*$store.state.device.unit) + 'px'\" :key=\"playerNameIndex\" v-for=\"(player, playerNameIndex) in game.players\" :style=\"{alignSelf:'flex-end', order: $store.state.games[gameID].gameState.playerTurn == player ? '-1' : ''}\"> <label>{{$store.state.index.users[player] || 'Player ' + player}}</label> <flex class=\"flex-center align-center\" :style=\"{backgroundColor:'white',  width:( ($store.state.games[gameID].gameState.playerTurn == player ? 12:7) * $store.state.device.unit) + 'px', height:(($store.state.games[gameID].gameState.playerTurn == player ? 12:7) * $store.state.device.unit) + 'px', borderRadius:'100%'}\"> <image :style=\"{\n                                backgroundColor:$store.state.playerColors[playerNameIndex], \n                                borderRadius:'100%', \n                                backgroundSize:'cover'}\" :width=\"( ($store.state.games[gameID].gameState.playerTurn == player ? 11:7) * $store.state.device.unit) + 'px'\" :height=\"(($store.state.games[gameID].gameState.playerTurn == player ? 11:7) * $store.state.device.unit) + 'px'\" src=\"res://sxan\"> </flex> </stack> </flex> </flex> </dock-layout> </absolute-layout> <flex v-else-if=\"loading == false && game.players.length == 1\" class=\"flex-center align-center\" height=\"100%\" width=\"100%\"> <label class=\"xxlarge\" text=\"There can be only one!\"></label> <button @tap=\"game.players.indexOf($store.state.user.uid) >= 0 ? win(game.gameState) : $router.push('/start')\">OK!</button> </flex> <flex v-else-if=\"loading == false && showCard == true\" class=\"flex-center align-center\" height=\"100%\" width=\"100%\"> <stack> <label class=\"xxlarge\" :text=\"game.gameState.card.name \"></label> <label class=\"medium anon\" :text=\"game.gameState.card.rap\"></label> <label class=\"medium\" :text=\"game.gameState.card.effect\"></label> <button @tap=\"delete game.gameState.card; showCard = false\">OK!</button> </stack> </flex> <flex v-else-if=\"loading == false && showOutcome == true\" class=\"flex-center align-center\" height=\"100%\" width=\"100%\"> <label class=\"xxlarge\" text=\"some shit happened\"></label> <button @tap=\"showOutcome = false\">OK!</button> </flex> <flex v-else class=\"flex-center align-center\" height=\"100%\" width=\"100%\"> <label text=\"loading...\" class=\"xxlarge\"></label> </flex> </stack>", _scopeId: 'data-v-0af94a16',
  components: { menu: menu },
  computed: {},
  data: function data() {
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
      /* start C */"home", 1, 2, "card", 4, 5, "card",
      /* st1st O */7, "card", 9, 10, "pass", 12, "card", 14,
      /* st2nd O */15, "card", 17, "pass", 19, 20, "card", 22,
      /* start L */23, "card", 25, 26, "card", "trap", "pass",
      /* start ? */30, 31, 32, "card", 34, 35, "trap", "win",
      /* timeout */"school", "work", "jail"],
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
    boardInit: function boardInit() {
      var _this = this;

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
        this.game.players.forEach(function (player) {
          _this.game.gameState.spaces[player] = 0;
        });
        this.$store.state.games["single_" + this.$store.state.user.uid] = this.game;
        console.log("Game init on board component", JSON.stringify(this.$store.state.game, null, 2), JSON.stringify(this.$store.state.games));
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
      if (!this.game.gameState.spaces[this.$store.state.user.uid] && this.$store.state.game.type !== "single") {
        this.game.players.forEach(function (player) {
          _this.game.gameState.spaces[player] = 0;
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
    gameLoop: function gameLoop() {
      this.gameID = this.$store.state.multiplayer.inGame || "single_" + this.$store.state.user.uid;
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
      if (gameState.spaces[gameState.playerTurn] == 40 || gameState.spaces[gameState.playerTurn] == 38 || gameState.spaces[gameState.playerTurn] == 39) {
        return this.timeout(gameState, turn);
      }

      turn.roll = this.roll();
      console.log("turn moving", JSON.stringify(turn, gameState));

      this.movePiece(turn.roll, gameState);
    },
    movePiece: function movePiece(roll, gameState) {
      var _this2 = this;

      // a recursive adventure since for-loops are crack
      this.gameID = this.$store.state.multiplayer.inGame || "single";
      this.game = this.$store.state.games[this.gameID];

      var chooseDirection = function chooseDirection(roll, gameState) {
        // simple dialog to choose direction
        roll > 0 ? dialogs$1.confirm({
          title: "You've got " + roll + " moves.",
          message: "Choose a direction",
          okButtonText: "Clockwise",
          cancelButtonText: "Counterclockwise"
        }).then(function (result) {
          // result argument is boolean
          _this2.direction = result == true ? "clockwise" : "counterclockwise";
          console.log("Dialog result: " + _this2.direction);
          _this2.movePiece(roll, gameState);
          // finishLoop(rollsLeft)
        }) : _this2.nextTurn();
      };
      var move = function move() {
        if (roll > 0) {
          if (_this2.originalSpace == 11 && gameState.spaces[gameState.playerTurn] == 11) {
            console.log("player on first pass");
            gameState.spaces[gameState.playerTurn] = 15;
            roll--;
            return _this2.movePiece(roll, gameState);
          } else if (_this2.originalSpace == 18 && gameState.spaces[gameState.playerTurn] == 18) {
            console.log("player on second pass");
            gameState.spaces[gameState.playerTurn] = 23;
            roll--;
            return _this2.movePiece(roll, gameState);
          } else if (_this2.originalSpace == 29 && gameState.spaces[gameState.playerTurn] == 29) {
            console.log("player on last pass");
            gameState.spaces[gameState.playerTurn] = 30;
            roll--;
            return _this2.movePiece(roll, gameState);
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
            return _this2.movePiece(roll, gameState);
          } else if (gameState.spaces[gameState.playerTurn] > 6 && gameState.spaces[gameState.playerTurn] < 23 && _this2.direction == false) {
            // enters loop, chooses direction

            return _this2.game.gameState.playerTurn != 2 ? chooseDirection(roll, gameState) : (_this2.direction = "clockwise", _this2.movePiece(roll, gameState));
          } else if (gameState.spaces[gameState.playerTurn] > 6 && gameState.spaces[gameState.playerTurn] < 23 && _this2.direction == "clockwise") {
            /* chose clockwise direction, rules of movement */

            // first loop
            gameState.spaces[gameState.playerTurn] >= 7 && gameState.spaces[gameState.playerTurn] < 14 ? gameState.spaces[gameState.playerTurn]++ : gameState.spaces[gameState.playerTurn] == 14 ? gameState.spaces[gameState.playerTurn] = 7 : // second loop

            gameState.spaces[gameState.playerTurn] >= 15 && gameState.spaces[gameState.playerTurn] < 22 ? gameState.spaces[gameState.playerTurn]++ : gameState.spaces[gameState.playerTurn] == 22 ? gameState.spaces[gameState.playerTurn] = 15 : null;

            roll--;
            return _this2.movePiece(roll, gameState);
          } else if (gameState.spaces[gameState.playerTurn] > 6 && gameState.spaces[gameState.playerTurn] < 23 && _this2.direction == "counterclockwise") {
            /* chose counterclockwise direction, rules of movement */

            // first loop
            gameState.spaces[gameState.playerTurn] <= 14 && gameState.spaces[gameState.playerTurn] > 7 ? gameState.spaces[gameState.playerTurn]-- : gameState.spaces[gameState.playerTurn] == 7 ? gameState.spaces[gameState.playerTurn] = 14 : // second loop
            gameState.spaces[gameState.playerTurn] <= 22 && gameState.spaces[gameState.playerTurn] > 15 ? gameState.spaces[gameState.playerTurn]-- : gameState.spaces[gameState.playerTurn] == 15 ? gameState.spaces[gameState.playerTurn] = 22 : null;

            roll--;
            return _this2.movePiece(roll, gameState);
          } else if (_this2.originalSpace < 29 && gameState.spaces[gameState.playerTurn] >= 30) {
            // overshoot L pass
            gameState.spaces[gameState.playerTurn] = 23;
            roll = 0;
            _this2.game.gameState = gameState;
            return firebase$1.setValue("games/" + _this2.gameID + "/gameState", _this2.game.gameState).then(function () {
              _this2.nextTurn();
            });
          } else if (_this2.originalSpace > 29 && _this2.originalSpace + roll > 37) {
            // overshoot win
            gameState.spaces[gameState.playerTurn] = 30;
            roll = 0;
            _this2.game.gameState = gameState;
            return firebase$1.setValue("games/" + _this2.gameID + "/gameState", _this2.game.gameState).then(function () {
              _this2.nextTurn();
            });
          } else {
            console.log("how's this even possible?");
            gameState.spaces[gameState.playerTurn]++;
            roll--;
            return _this2.movePiece(roll, gameState);
          }
        } else {
          // no moves left, tidy up
          console.log("no moves left");

          if (isNaN(_this2.spaces[gameState.spaces[gameState.playerTurn]])) {
            console.log("special case of card, pass, home, trap, or win", JSON.stringify(_this2.spaces[gameState.spaces[gameState.playerTurn]]));
            return _this2.outcome(_this2.spaces[gameState.spaces[gameState.playerTurn]], gameState);
          } else {
            console.log("nothing left, save and flip.");
            _this2.game.gameState = gameState;
            return firebase$1.setValue("games/" + _this2.gameID + "/gameState", _this2.game.gameState).then(function () {
              _this2.nextTurn();
            });
          }
          console.log("edge cases?");
          // Send player to new space
        }
      };
      //move()
      setTimeout(move, 500);
    },
    nextTurn: function nextTurn() {
      this.showOutcome = true;
      this.originalSpace = false;
      this.gameID = this.$store.state.multiplayer.inGame || "single_" + this.$store.state.user.uid;
      this.game = this.$store.state.games[this.gameID];
      console.log("next player");
      this.game.players.indexOf(this.game.gameState.playerTurn) == this.game.players.length - 1 ? this.game.gameState.playerTurn = this.game.players[0] : this.game.gameState.playerTurn = this.game.players[this.game.players.indexOf(this.game.gameState.playerTurn) + 1];
      this.game.gameState.playerTurn == 2 ? this.gameLoop() : null;
      firebase$1.setValue("games/" + this.gameID, this.game);
      // firebase.setValue('games/'+this.gameID, this.game)
    },
    outcome: function outcome(type, gameState) {
      var _this3 = this;

      console.log("how to handle outcome", type);

      if (type === "card") {
        console.log("SHOWING CARD", JSON.stringify(this.$store.state.cardsets[this.game.usesCardset]));
        gameState.card = this.$store.state.cardsets[this.game.usesCardset] ? this.$store.state.cards[Math.floor(Math.random() * this.$store.state.cardsets[this.game.usesCardset].cards.length - 1)] : this.$store.state.stock.cards[Math.floor(Math.random() * this.$store.state.stock.cardsets.cards.length - 1)];

        gameState.card = gameState.card || this.$store.state.stock.cards[0];
        console.log("WTF single player", JSON.stringify(gameState.card, null, 2));
        /*!gameState.card.name ? gameState.card = this.$store.state.stock.cards[Math.floor(Math.random() * this.$store.state.stock.cardsets.cards.length-1)] : null*/
        this.outcome(gameState.card.effect, gameState);
        this.showCard = true;
      } else if (type === "pass") {
        console.log("GO TO PASS");
        while (this.spaces[gameState.spaces[gameState.playerTurn]] !== "pass" && gameState.spaces[gameState.playerTurn] < 29) {
          gameState.spaces[gameState.playerTurn]++;
        }
        this.game.gameState = gameState;
        return firebase$1.setValue("games/" + this.gameID + "/gameState", this.game.gameState).then(function () {
          _this3.nextTurn();
        });
      } else if (type === "home" || type === "trap") {
        console.log("GO " + type);
        gameState.spaces[gameState.playerTurn] = 0;
        this.game.gameState = gameState;
        return firebase$1.setValue("games/" + this.gameID + "/gameState", this.game.gameState).then(function () {
          _this3.nextTurn();
        });
      } else if (type == "win" || this.game.players.length == 1) {
        console.log("YOU WON!");
        gameState.winner = gameState.playerTurn;
        this.game.started = false;
        this.game.ended = true;
        this.game.gameState = gameState;
        return firebase$1.setValue("games/" + this.gameID, this.game).then(function () {
          firebase$1.setValue("finishedGames/" + _this3.gameID, _this3.game).then(function () {
            firebase$1.remove("games/" + _this3.gameID);
            firebase$1.remove("index/games/" + _this3.gameID);
            _this3.$router.go("/start");
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
        return firebase$1.setValue("games/" + this.gameID, this.game).then(function () {
          _this3.nextTurn();
        });
      } else if (type == "stay") {
        this.game.gameState = gameState;
        return firebase$1.setValue("games/" + this.gameID, this.game).then(function () {
          _this3.nextTurn();
        });
      } else if (type == "dead") {
        delete gameState.spaces[gameState.playerTurn];
        this.game.gameState = gameState;
        this.game.players.pop(this.game.players.indexOf(this.game.playerTurn));
        return firebase$1.setValue("games/" + this.gameID, this.game).then(function () {
          _this3.nextTurn();
        });
      }
    },
    roll: function roll() {
      var roll = Math.floor(Math.random() * 10);
      console.log("rolled: ", roll);
      this.playerRoll = roll;
      return roll;
    },
    timeout: function timeout(gameState, turn) {
      var _this4 = this;

      console.log("player in timeout", JSON.stringify(gameState));
      console.log(JSON.stringify(gameState.timeouts));
      console.log(JSON.stringify(gameState.spaces));
      console.log(JSON.stringify(gameState.playerTurn));
      console.log(JSON.stringify(this.timeouts[gameState.spaces[gameState.playerTurn]]));

      // Time Served?
      if (gameState.timeouts[gameState.playerTurn].timeServed == this.timeouts[gameState.timeouts[gameState.playerTurn].type]) {
        console.log("time served", JSON.stringify(gameState.timeouts[gameState.spaces[gameState.playerTurn]]));
        delete gameState.timeouts[gameState.playerTurn];
        gameState.spaces[gameState.playerTurn] = 0;
        this.game.gameState = gameState;
        return firebase$1.setValue("games/" + this.gameID + "/gameState", this.game.gameState).then(function () {
          _this4.nextTurn();
        });
        // TODO remove player from timeout, continue
      } else {
        var roll = this.roll();
        dialogs$1.alert({
          title: "Roll to Escape!",
          message: "If you can roll a " + this.timeouts[gameState.timeouts[gameState.playerTurn].type],
          okButtonText: "Try"
        }).then(function () {
          console.log("Rolled a " + roll);
          if (roll == _this4.timeouts[gameState.timeouts[gameState.playerTurn].type]) {
            console.log("time served", JSON.stringify(gameState.timeouts[gameState.spaces[gameState.playerTurn]]));
            delete gameState.timeouts[gameState.playerTurn];
            gameState.spaces[gameState.playerTurn] = 0;
            _this4.game.gameState = gameState;
            return firebase$1.setValue("games/" + _this4.gameID + "/gameState", _this4.game.gameState).then(function () {
              _this4.nextTurn();
            });
          } else {
            // TODO add counter to player timeout, push turn, next player
            gameState.timeouts[gameState.playerTurn].timeServed++;
            console.log("timeout: still stuck");
            _this4.game.gameState = gameState;
            return firebase$1.setValue("games/" + _this4.gameID + "/gameState", _this4.game.gameState).then(function () {
              _this4.nextTurn();
            });
          }
        });
      }
    },
    turnChecks: function turnChecks(gameState) {},
    waiting: function waiting() {
      var _this5 = this;

      console.log("Waiting on game data from board component");

      setTimeout(function () {
        _this5.gameID && _this5.game || _this5.$store.state.game.type == "single" ? _this5.boardInit() : _this5.waiting();
      }, 1500);
    },
    win: function win(gameState, turn) {
      var _this6 = this;

      gameState.winner = gameState.playerTurn;
      // turn.outcome = 'win'
      console.log("win", JSON.stringify(turn));
      gameState.winner = gameState.playerTurn;
      this.game.started = false;
      this.game.ended = true;
      this.game.gameState = gameState;
      this.$store.state.games[this.gameID] = this.game;
      return firebase$1.setValue("games/" + this.gameID, this.game).then(function () {
        firebase$1.setValue("finishedGames/" + _this6.gameID, _this6.game).then(function () {
          firebase$1.remove("games/" + _this6.gameID);
          firebase$1.remove("index/games/" + _this6.gameID);
          _this6.$router.push("/start");
        });
      });
    }
  },
  mounted: function mounted() {
    var _this7 = this;

    setTimeout(function () {
      console.log("board mounting", JSON.stringify(_this7.$store.state.index, 2, null));
      console.log("gameID: " + _this7.$store.state.multiplayer.inGame);
      _this7.gameID = _this7.$store.state.multiplayer.inGame || "single_" + _this7.$store.state.user.uid;
      console.log("game: " + _this7.$store.state.games[_this7.gameID]);
      _this7.game = _this7.$store.state.games[_this7.gameID] || {
        type: "single",
        players: [_this7.$store.state.user.uid || "player", 2],
        started: false,
        ended: false,
        usesCardset: 0,
        public: false,
        timestamp: Date.now()
      };
      _this7.game.type == "single" ? _this7.$store.state.games["single_" + _this7.$store.state.user.uid] = _this7.game : null;
      _this7.waiting();
    }, 2000);
  }
};

var Explore = { template: "<ScrollView> <stack-layout> <label text=\"Exploring SXAN\"></label> <button @tap=\"$router.push('start')\">Go Back to Start</button> </stack-layout> </ScrollView>",
    components: { menu: menu },
    data: function data() {
        return {
            name: 'John',
            age: 34,
            occupation: 'Developer'
        };
    },

    methods: {
        changeName: function changeName() {
            var _this = this;

            dialogs$1.prompt('Change Display Name', '').then(function (r) {
                console.log('Dialog result: ' + r.result + ', text: ' + r.text);
                if (r.result) {
                    _this.$store.dispatch('setDataAction', {
                        url: '/users/' + _this.$store.state.user.uid + '/name',
                        payload: r.text,
                        type: 'changeName'
                    });
                    _this.$store.dispatch('getDataAction', '/users/' + _this.$store.state.user.uid + '/name');
                } else {
                    dialogs$1.alert('Name unchanged');
                }
            });
        }
    }
};

var Hustles = { template: "<ScrollView> <flexbox-layout class=\"flex-between\"> <label class=\"msg\">Hustles {{$store.state.industry ? 'in ' + $store.state.industry : ''}}</label> <button @tap=\"chooseIndustry()\">Change Industry</button> </flexbox-layout> <flexbox-layout class=\"column flex-around align-center\"> <flexbox-layout class=\"flex1\" :key=\"hustlesIndex\" v-for=\"(hustles, hustlesIndex) in $store.state.hustles[$store.state.industry || 'general']\"> <label class=\"msg\" :text=\"hustles\"></label> </flexbox-layout> </flexbox-layout> </ScrollView>", _scopeId: 'data-v-ab8f7d48',
    data: function data() {
        return {};
    },

    methods: {
        chooseIndustry: function chooseIndustry() {
            var _this = this;

            dialogs.action({
                message: 'Choose an industry or tap "Other" to suggest one',
                cancelButtonText: 'Cancel',
                actions: ['Music', 'Cannabis', 'Startups', 'Other']
            }).then(function (result) {
                console.log('result', JSON.stringify(result));
                if (result !== 'Other') {
                    _this.$store.state.industry = result.toLowerCase();
                    firebase.setValue('users/' + _this.$store.state.user.auth.uid + '/industry', _this.$store.state.industry);
                } else {
                    dialogs.prompt('Suggest an industry').then(function (r) {
                        _this.$store.state.industrySuggestions.push(r.text);
                        firebase.push('industrySuggestions', r.text);
                    });
                }
            });
        }
    }
};

var Rules = { template: "<stack> <menu></menu> <scroll> <stack> <label class=\"xxlarge\">RULes</label> <label class=\"anon\" textWrap=\"true\">RULES Nullam quis risus eget urna mollis ornare vel eu leo. Vestibulum id ligula porta felis euismod semper. Etiam porta sem malesuada magna mollis euismod. Donec ullamcorper nulla non metus auctor fringilla. Nullam quis risus eget urna mollis ornare vel eu leo.</label> <label class=\"medium\">Goals</label> <label class=\"anon justify\" textWrap=\"true\"> Nullam id dolor id nibh ultricies vehicula ut id elit. Curabitur blandit tempus porttitor. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Nulla vitae elit libero, a pharetra augue. Maecenas faucibus mollis interdum. Sed posuere consectetur est at lobortis. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Nulla vitae elit libero, a pharetra augue. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Nullam id dolor id nibh ultricies vehicula ut id elit. Curabitur blandit tempus porttitor. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Nulla vitae elit libero, a pharetra augue. Maecenas faucibus mollis interdum. </label><label class=\"medium\">Getting Around the board</label> <label class=\"anon justify\" textWrap=\"true\"> Nullam id dolor id nibh ultricies vehicula ut id elit. Curabitur blandit tempus porttitor. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Nulla vitae elit libero, a pharetra augue. Maecenas faucibus mollis interdum. Sed posuere consectetur est at lobortis. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Nulla vitae elit libero, a pharetra augue. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Nullam id dolor id nibh ultricies vehicula ut id elit. Curabitur blandit tempus porttitor. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Nulla vitae elit libero, a pharetra augue. Maecenas faucibus mollis interdum. </label> <label class=\"medium\">Playing Online</label> <label class=\"anon justify\" textWrap=\"true\"> Nullam id dolor id nibh ultricies vehicula ut id elit. Curabitur blandit tempus porttitor. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Nulla vitae elit libero, a pharetra augue. Maecenas faucibus mollis interdum. Sed posuere consectetur est at lobortis. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Nulla vitae elit libero, a pharetra augue. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Nullam id dolor id nibh ultricies vehicula ut id elit. Curabitur blandit tempus porttitor. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Nulla vitae elit libero, a pharetra augue. Maecenas faucibus mollis interdum. </label> </stack> </scroll> </stack>",
    components: { menu: menu },
    mounted: function mounted() {
        console.log('Rules Mounted');
    }
};

var Start = { template: "<flexbox-layout height=\"100%\" width=\"100%\" class=\"flex-between column background\"> <ScrollView class=\"msgs\" id=\"scroller\"> <stack-layout textWrap=\"true\"> <label textWrap=\"true\" class=\"msg\" :key=\"msgIndex\" v-for=\"(msg, msgIndex) in $store.state.msgs.onboarding\" :text=\"msg\"></label> </stack-layout> </ScrollView> <button v-if=\"originalButton\" @tap=\"init()\">YES</button> <stack-layout v-else-if=\"$store.state.show.onboarding.buttons\" class=\"button-block\"> <button @tap=\"$router.push('auth')\" class=\"onboard\">Continue</button> <flexbox-layout class=\"flex-between\"> <button class=\"flex1 onboard\" @tap=\"$store.state.show.onboarding.buttons = false\">?</button> <button class=\"flex1 onboard\" @tap=\"newPlayerStart()\">New Player</button> </flexbox-layout> </stack-layout> <stack-layout v-else-if=\"$store.state.show.onboarding.newPlayerButtons\" class=\"button-block\"> <button @tap=\"signup()\" class=\"onboard\">Sign Up</button> <flexbox-layout class=\"flex-between\"> <button class=\"flex1 second-choice\" @tap=\"$router.push('auth')\">Sign In</button> <button class=\"flex1 second-choice\" @tap=\"$router.push('explore')\">Explore</button> </flexbox-layout> </stack-layout> <flexbox-layout v-else-if=\"$store.state.show.onboarding.signup\" class=\"column flex-between flex1\"> <flexbox-layout width=\"100%\" class=\"column flex-center align-center flex1\"> <text-field width=\"100%\" v-model=\"email\" hint=\"email\"></text-field> </flexbox-layout> <stack-layout class=\"button-block\"> <button @tap=\"saveEmail()\" class=\"onboard\">Create Player</button> <flexbox-layout class=\"flex-between\"> <button class=\"flex1 second-choice\" @tap=\"$router.push('auth')\" text=\"Sign In\"></button> <button class=\"flex1 second-choice\" @tap=\"$router.push('explore')\">Explore</button> </flexbox-layout> </stack-layout> </flexbox-layout> <flexbox-layout v-else-if=\"$store.state.show.onboarding.password\" class=\"column flex-between flex1\"> <flexbox-layout width=\"100%\" class=\"column flex-center align-center flex1\"> <label :text=\"$store.state.create.user.email\"></label> <text-field width=\"100%\" v-model=\"$store.state.create.user.name\" hint=\"Your Name\"></text-field> <text-field width=\"100%\" secure=\"true\" v-model=\"$store.state.create.user.password\" hint=\"Password\"></text-field> </flexbox-layout> <stack-layout> <flexbox-layout class=\"flex-between\"> <button class=\"flex1 second-choice\" @tap=\"$router.push('start')\" text=\"<\"></button> <button class=\"flex1 onboard\" @tap=\"createPlayer()\">Save Progress</button> </flexbox-layout> </stack-layout> </flexbox-layout> <stack-layout v-else> <label text=\"Something went wrong\"></label> <button class=\"onboard\" @tap=\"$router.go('start')\">Restart</button> </stack-layout> </flexbox-layout>",
    components: { menu: menu },
    data: function data() {
        return {
            email: '',
            pass: '',
            originalButton: true
        };
    },

    computed: {},
    methods: {
        createPlayer: function createPlayer() {
            this.$store.commit('create', this.$store.state.create.user);
            this.keepChecking();
        },
        init: function init() {
            // const timestamp = Date.now() + '-' + performance()
            // this.$store.state.sessionTimestamp = timestamp
            this.$store.state.show.onboarding.buttons = true;
            this.originalButton = false;
            this.$store.state.show.menu = true;
            this.$store.state.msgs.onboarding.push('Use this public XEY to access SXAN.');
            this.$store.commit('createXey', {});
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

        keepChecking: function keepChecking() {
            var _this = this;

            setTimeout(function () {
                console.log('Promises?', _this.$store.state.user.uid);
                _this.$store.state.user.uid ? _this.$router.push('begin') : _this.keepChecking();
            }, 1000);
        },

        newPlayerStart: function newPlayerStart() {
            var _this2 = this;

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
            this.$store.state.show.onboarding.buttons = false;
            this.$store.state.show.onboarding.newPlayerButtons = true;

            this.$store.state.msgs.onboarding = ['You won a SXOIN.'];
            this.$store.state.xeysTotal = 1;

            setTimeout(function () {
                _this2.$store.state.msgs.onboarding.push('SXAN is a productivity exchange for humans.');
            }, 1000);
            setTimeout(function () {
                _this2.$store.state.msgs.onboarding.push('Players receive value through every engagement.');
            }, 2000);
            setTimeout(function () {
                _this2.$store.state.msgs.onboarding.push('What would you like to do next?');
            }, 3000);
        },
        saveEmail: function saveEmail() {
            var _this3 = this;

            this.$store.state.create.user.email = this.email;
            this.$store.state.msgs.onboarding = ['You won 10 more SXOINS and a private XEY'];
            this.$store.state.xeysTotal = 11;
            setTimeout(function () {
                _this3.$store.state.msgs.onboarding.push('Now, enter your name and a passphrase below. Then save your progress with the private XEY. ');
            }, 1000);
            this.$store.state.show.onboarding.signup = false;
            this.$store.state.show.onboarding.password = true;
            firebase$1.push('signups', this.email);
        },
        signup: function signup() {
            this.$store.state.msgs.onboarding = ['Enter your email to signup.'];
            this.$store.state.show.onboarding.newPlayerButtons = false;
            this.$store.state.show.onboarding.signup = true;
        }
    },
    mounted: function mounted() {}
};

var application = require('application');
console.log(application);
firebase$1.init({
    persist: true,
    iOSEmulatorFlush: true
}).then(function (instance) {
    console.log('firebase.init done', instance);
}, function (error) {
    console.log('firebase.init error: ' + error);
});
global.process = {
    env: {}
};Vue.use(Router);
var router = new Router({
    routes: [{
        path: '/auth',
        name: 'auth',
        component: Auth
    }, {
        path: '/begin',
        name: 'begin',
        component: Begin
    }, {
        path: '/onboard',
        name: 'onboard',
        component: Board
    }, {
        path: '/hustles',
        name: 'hustles',
        component: Hustles
    },
    {
        path: '/rules',
        name: 'rules',
        component: Rules
    }, {
        path: '/start',
        name: 'start',
        component: Start
    }, {
        path: '/explore',
        name: 'explore',
        component: Explore
    },
    {
        path: '*',
        redirect: '/start'
    }]
});
Vue.use(Vuex);
var store = new Vuex.Store(StoreConf);
Vue.prototype.$store = store;
Vue.component('flex', {
    template: '<flexbox-layout><slot></slot></flexbox-layout>'
});
Vue.component('stack', {
    template: '<stack-layout><slot></slot></stack-layout>'
});
Vue.component('scroll', {
    template: '<scrollview><slot></slot></scrollview>'
});
new Vue({
    pageRouting: true,
    router: router,
    render: function render(h) {
        return h('app');
    },
    components: {
        App: App,
        Auth: Auth,
        Board: Board,
        Rules: Rules,
        Start: Start
    },
    mounted: function mounted() {
        router.replace('/start');
        console.log('why the heck not?????');
        console.log('app init');
    }
}).$start();
