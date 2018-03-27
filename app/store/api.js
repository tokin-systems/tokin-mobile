import firebase from 'nativescript-plugin-firebase'
import dialogs from 'ui/dialogs'
import fs from 'file-system'
import localStorage from 'nativescript-localstorage'
import * as imagepicker from 'nativescript-imagepicker'
import performance from 'performance-now'
import platform from 'platform'


console.log(dialogs)
const api = {
    name() {
        return 'api'
    },

    //TODO test method to cancel a created game
    cancelGame(state, obj) {
        delete state.multiplayer.start[obj.payload]
        delete state.games[obj.payload]
        delete state.index.games[obj.payload]
        state.userAssets.games.splice(
            state.userAssets.games.indexOf(obj.payload),
            1
        )
        firebase.setValue(
            'users/' + state.user.uid + obj.url,
            state.userAssets.games
        )
        firebase.remove(obj.url + '/' + obj.payload)
        firebase.remove('index/' + obj.url + '/' + obj.payload)
        firebase.remove('multiplayer/start/' + obj.payload)
        localStorage.setItem('games', JSON.stringify(state.games))
        localStorage.setItem('index', JSON.stringify(state.index))
        localStorage.setItem('multiplayer', JSON.stringify(state.multiplayer))
        localStorage.setItem('userAssets', JSON.stringify(state.userAssets))
        // state.multiplayer.createGame = false
        api.init(state)
    },
    chooseImage(state) {
        var context = imagepicker.create({ mode: 'single' })
        context
            .authorize()
            .then(function() {
                return context.present()
            })
            .then(function(selection) {
                selection.forEach(function(selected) {
                    //console.log('selected image', selected)
                    state.uploadUri = selected.fileUri
                    // process the selected image
                })
                return selection
            })
            .catch(function(e) {
                console.log('no image selected', e)
                // process error
            })
    },
    createSxoin(state, obj){
        console.log('Creating SXOIN', 'xey: ' + obj.xey, 'user: ' + obj.user)
        var date = Date.now()
        var random = Math.floor(Math.random()*999999)
        var timestamp = date + '-' + random + '_' + platform.device.uuid + '_' + performance()
        return firebase.push('sxoins', {
            time: timestamp,
            challenge: obj.xey,
            ledger: [{
                created: date
            }]
        }).then((result)=>{
            state.sxoins.push(result.key)
            firebase.setValue('users/'+obj.user+'/sxoins', state.sxoins)
            return result.key
        })
    },
    createXey(state, obj){
        console.log('Creating XEY', 'originator: ' + obj.user || 'SXAN')
        var date = Date.now()
        var random = Math.floor(Math.random()*999999)
        var timestamp = date + '-' + random + '_' + platform.device.uuid + '_' + performance()
        return firebase.push('xeys/'+ (obj.privacy || 'temp'), {
            time: timestamp,
            utility: obj.utility || 'general',
            originator: obj.user || 'SXAN',
            ledger: [{
                created: date
            }]
        }).then((result)=>{
            // obj.privacy == 'public' || 'private' || 'temp'
            state.xeys[obj.privacy || 'temp'].push(result.key)
            obj.user ? firebase.setValue('users/'+obj.user+'/xeys' , state.xeys) : null
            state.xeysTotal = state.xeys.private.length + state.xeys.public.length + state.xeys.temp.length
            return result.key
        })
    },
    // TODO rename
    create(state, obj) {
        console.log(
            'state',
            JSON.stringify(state),
            'payload',
            JSON.stringify(obj)
        )
        firebase
            .createUser({
                email: obj.email,
                password: obj.password
            })
            .then(
                result => {
                    // create user db table from UID
                    firebase.setValue('/users/' + result.key + '/name', obj.name)
                    firebase.setValue('/users/' + result.key + '/devices', [platform.device.uuid])
                    firebase.setValue('index/users/' + result.key, obj.name)
                    dialogs.alert({
                        title: 'Player created',
                        message: 'Player: ' + obj.name + ' is in the app!',
                        okButtonText: 'LOG IN!'
                    })
                    firebase
                        .login({
                            type: firebase.LoginType.PASSWORD,
                            passwordOptions: {
                                email: obj.email,
                                password: obj.password
                            }
                        })
                        .then(
                            result => {
                                result.name = obj.name
                                firebase.setValue('/users/' + result.uid + '/auth',result).then(() => {
                                    state.user = result
                                    localStorage.setItem('user', JSON.stringify(result, null, 2))
                                    console.log('login successful: ', JSON.stringify(state.user, null, 2))
                                    console.log('READY DEPOSIT')
                                    for (var x = 0; x < 21; x++) {
                                        setTimeout(() => {
                                            var sxoinObj = {
                                                xey: state.xeys.temp[0], 
                                                user: result.uid
                                            }
                                            api.createSxoin(state, sxoinObj)
                                        }, 10 + x)
                                    }
                                    console.log('SAVE XEYS')
                                    firebase.getValue('xeys/temp/'+state.xeys.temp[0]).then((tempResult)=>{
                                        tempResult.value.ledger.push({transformed:Date.now()+'-'+result.uid})
                                        firebase.setValue('xeys/public/'+state.xeys.temp[0], tempResult.value).then(()=>{
                                            state.xeys.public = [state.xeys.temp[0]]
                                            firebase.setValue('/users/' + result.uid +'/xeys/public', state.xeys.public)
                                            firebase.remove('xeys/temp/'+state.xeys.temp[0])
                                            state.xeys.temp = []
                                            var xeyObj = {
                                                privacy: 'private',
                                                utility: 'signing',
                                                user: result.uid
                                            }
                                            api.createXey(state, xeyObj)
                                        })
                                    })
                                    
                                })
                            },
                            (errorMessage) => {
                                console.log(errorMessage)
                            }
                        )
                },
                (errorMessage)=> {
                    dialogs.alert({
                        title: 'No user created',
                        message: errorMessage,
                        okButtonText: 'OK, got it'
                    })
                }
            )
    },
    facebookLogin(state) {
        state.user = {}
        firebase.logout()
        firebase
            .login({
                type: firebase.LoginType.FACEBOOK,
                // Optional
                facebookOptions: {
                    // defaults to ['public_profile', 'email']
                    scope: ['public_profile', 'email']
                }
            })
            .then(
                function(result) {
                    localStorage.setItem('games', JSON.stringify({}))
                    firebase.update('/users/' + result.uid + '/auth', result)
                    firebase.update(
                        '/users/' + result.uid + '/name',
                        result.name
                    )
                    firebase.setValue('/index/users/' + result.uid, result.name)
                    localStorage.setItem('user', JSON.stringify(result))
                    //console.log('localStorage after login', localStorage.getItem('user'))
                    state.user = result
                    api.init(state)
                    return state.user
                },
                function(errorMessage) {
                    dialogs.alert({
                        title: 'Something went wrong',
                        message: 'Try to login again',
                        okButtonText: 'OK, will do'
                    })
                    console.log(errorMessage)
                }
            )
    },
    getData(state, obj) {
        //console.log('get value at: ', obj.type + '/' + obj.id)
        firebase.getValue(obj.type + '/' + obj.id).then(result => {
            state[obj.type][obj.id] = result.value
        })
    },
    getUser(state, router) {
        localStorage.getItem('user')
            ? ((state.user = JSON.parse(localStorage.getItem('user'))),
                router.push('/start'))
            : firebase.getCurrentUser().then(
                function(result) {
                    //console.log('getUser: ', result.uid)
                    result.uid
                        ? router.push('/start')
                        : (localStorage.clear(), router.push('/auth'))
                    state.user = result
                },
                function(errorMessage) {
                    console.log(errorMessage)
                }
            )
    },
    init(state) {
        // Setup db routes to check, with flags for userAssets and further iteration
        const userUrl = 'users/' + state.user.uid + '/'
        const initArray = [
            {
                key: 'name',
                url: userUrl + 'name',
                default: 'Player',
                assets: false
            },
            { key: 'index', url: 'index', default: {}, assets: false },
            { key: 'cards', url: userUrl + 'cards', default: [], assets: true },
            { key: 'cards', url: 'cards', default: [], assets: false },
            {
                key: 'cardsets',
                url: userUrl + 'cardsets',
                default: [],
                assets: true
            },
            { key: 'cardsets', url: 'cardsets', default: {}, assets: false },
            { key: 'games', url: userUrl + 'games', default: [], assets: true },
            {
                key: 'games',
                url: 'games',
                default: {},
                assets: false,
                iterate: true
            }
        ]

        // Iterate through db
        initArray.forEach(initObject => {
            firebase.getValue(initObject.url).then(result => {
                // Iterate through games for multiplayer setup
                if (initObject.iterate) {
                    var isCreate = false
                    var isJoin = false

                    for (const game in result.value) {
                        result.value[game].started == false
                            ? (result.value[game].players[0] == state.user.uid
                                ? ((state.multiplayer.createGame = game),
                                    (state.multiplayer.start[game] = true),
                                    (isCreate = true))
                                : null,
                                result.value[game].players.indexOf(
                                    state.user.uid
                                ) > 0
                                    ? ((state.multiplayer.joinGame = game),
                                        (state.multiplayer.start[game] = true),
                                        (isJoin = true))
                                    : null,
                                (state.multiplayer.start[game] = true))
                            : result.value[game].players.indexOf(
                                state.user.uid
                            ) >= 0
                                ? (state.multiplayer.inGame = game)
                                : null
                    }
                    isCreate || isJoin
                        ? null
                        : ((state.multiplayer.createGame = false),
                            (state.multiplayer.joinGame = false))
                }

                // Drop results in localStorage
                result.value !== null
                    ? localStorage.setItem(
                        initObject.key,
                        JSON.stringify(result.value)
                    )
                    : null

                // Assign results to $store.state, including userAssets
                initObject.assets
                    ? (state.userAssets[initObject.key] =
                          result.value || initObject.default)
                    : (state[initObject.key] =
                          result.value || initObject.default)
                localStorage.setItem(
                    'userAssets',
                    JSON.stringify(state.userAssets)
                )
                return state
            })
        })
    },
    joinGame(state, obj) {
        state.multiplayer.createGame
            ? api.cancelGame(state, {
                url: '/games',
                payload: state.multiplayer.createGame
            })
            : null
        state.games[obj].players.length < 4 &&
        state.games[obj].players.indexOf(state.user.uid) < 0
            ? (state.games[obj].players.push(state.user.uid),
                (state.multiplayer.joinGame = obj),
                firebase
                    .setValue(
                        'games/' + state.multiplayer.joinGame + '/players',
                        state.games[state.multiplayer.joinGame].players
                    )
                    .then(() => {
                        api.init(state)
                    }))
            : null
        console.log('players', JSON.stringify(state.games[obj].players))
    },

    login(state, obj) {
        console.log('login: ', obj.name)
        firebase
            .login({
                type: firebase.LoginType.PASSWORD,
                passwordOptions: {
                    email: obj.name,
                    password: obj.password
                }
            })
            .then(
                result => {
                    // localStorage.setItem('games', JSON.stringify({}))
                    console.log('login result', JSON.stringify(result, null, 2))
                    localStorage.setItem('user', JSON.stringify(result))
                    firebase.update('/users/' + result.uid + '/auth', result)
                    api.init(state)
                    state.user = result
                    obj.router.push('/start')
                    return state.user
                },
                function(errorMessage) {
                    dialogs.alert({
                        title: 'Something went wrong',
                        message: 'Try to login again',
                        okButtonText: 'OK, will do'
                    })
                    console.log(errorMessage)
                }
            )
    },
    logout(state) {
        // console.log('logging out', state.user.uid)
        for (var x = 0; x < localStorage.length; x++) {
            localStorage.setItem(localStorage.key(x), '')
            localStorage.removeItem(localStorage.key(x))
        }
        localStorage.clear()
        console.log(localStorage.length)
        state.user = {}
        firebase.logout()
    },
    multiplayer(state) {
        /*
		TODO update status of multiplayer games on state, localStorage, and firebase
		obj = {action: 'join || cancel || exit || remove || invite'}
		*/
        firebase.getValue('multiplayer/start').then(result => {
            console.log('multiplayer/start', JSON.stringify(result))
            for (const game in result.value) {
                firebase.getValue('games/' + game).then(res => {
                    console.log('games/' + game, JSON.stringify(res))
                    state.games[game] = res.value
                })
            }
        })
    },
    pushData(state, obj) {
        console.log('Pushing...', JSON.stringify(obj, null, 2))

        obj.payload.type == 'cardsets'
            ? (obj.payload.cards = state.stock.cardsets.cards)
            : null

        firebase.push(obj.url, obj.payload).then(function(result) {
            obj.payload.type == 'games'
                ? (state.multiplayer.joinGame
                    ? (state.games[state.multiplayer.joinGame].players.pop(
                        state.user.uid
                    ),
                        firebase.setValue(
                            'games/' + state.multiplayer.joinGame + '/players',
                            state.games[state.multiplayer.joinGame].players
                        ),
                        (state.multiplayer.joinGame = false))
                    : null,
                    (state.multiplayer.createGame = result.key),
                    firebase.setValue('multiplayer/start/' + result.key, true),
                    (state.multiplayer.start[result.key] = true),
                    localStorage.setItem(
                        'multiplayer',
                        JSON.stringify(state.multiplayer)
                    ))
                : null

            state.index[obj.payload.type] = state.index[obj.payload.type] || {}
            state.index[obj.payload.type][result.key] = obj.payload.name
            state[obj.payload.type][result.key] = obj.payload
            firebase.setValue(
                '/index/' + obj.payload.type + '/' + result.key,
                obj.payload.name
            )
            console.log(
                'why tf',
                JSON.stringify(state.userAssets[obj.payload.type]),
                JSON.stringify(result.key)
            )
            state.userAssets[obj.payload.type].push(result.key)
            firebase.setValue(
                '/users/' + state.user.uid + '/' + obj.payload.type,
                state.userAssets[obj.payload.type]
            )
            localStorage.setItem(
                obj.payload.type,
                JSON.stringify(state.userAssets[obj.payload.type])
            )
            localStorage.setItem('index', JSON.stringify(state.index))

            obj.payload.type == 'cards'
                ? (api.uploadImage(state, state.uploadUri, result.key),
                    (obj.payload.image = result.key + '.png'),
                    firebase.setValue(
                        '/cards/' + result.key + '/image',
                        obj.payload.image
                    ),
                    state.cardsets[obj.payload.cardset].cards.push(result.key),
                    firebase.setValue(
                        '/cardsets/' + obj.payload.cardset + '/cards/',
                        state.cardsets[obj.payload.cardset].cards
                    ))
                : null

            // api.init(state)
        })
    },
    setData(state, obj) {
        console.log('setting data')
        // console.dir(obj)
        firebase.setValue(obj.url, obj.payload)
        obj.type == 'changeName'
            ? firebase.setValue('/index/users/' + state.user.uid, obj.payload)
            : null
    },
    sync(state, status) {
        var onChildEvent = function(result) {
            console.log('Sync State Event type: ' + result.type)
            console.log('Key: ' + result.key)
            // console.log('Value: ' + JSON.stringify(result.value))

            // TODO check if api.init() is good enough for all cases. sync db cheat.

            if (result.type == 'ChildRemoved') {
                state.games[result.key] ? delete state.games[result.key] : null
                state.index.games[result.key]
                    ? delete state.index.games[result.key]
                    : null
                state.multiplayer.start[result.key]
                    ? delete state.multiplayer.start[result.key]
                    : null
                state.multiplayer.start.games
                    ? delete state.multiplayer.start.games
                    : null
                localStorage.setItem('games', JSON.stringify(state.games))
                localStorage.setItem('index', JSON.stringify(state.index))
                localStorage.setItem(
                    'multiplayer',
                    JSON.stringify(state.multiplayer)
                )
                api.init(state)
            }
            if (result.type == 'ChildAdded') {
                api.init(state)
            }
        }

        // listen to changes in the /users path
        firebase
            .addChildEventListener(onChildEvent, status.url)
            .then(function(listenerWrapper) {
                var path = listenerWrapper.path
                var listeners = listenerWrapper.listeners // an Array of listeners added
                // you can store the wrapper somewhere to later call 'removeEventListeners'
                console.log(path, listeners)
            })
        firebase
            .keepInSync(
                status.url, // which path in your Firebase needs to be kept in sync?
                status.status // set to false to disable this feature again
            )
            .then(
                function() {
                    console.log('firebase.keepInSync is ON for ' + status.url)
                    api.init(state)
                },
                function(error) {
                    console.log('firebase.keepInSync error: ' + error)
                }
            )
    },
    syncGames(state, status) {
        var onChildEvent = function(result) {
            console.log('Sync Games Event type: ' + result.type)
            console.log('Key: ' + result.key)
            // console.log('Value: ' + JSON.stringify(result.value))
            result.type == 'ChildRemoved' &&
            state.multiplayer.joinGame == result.key
                ? (state.multiplayer.joinGame = false)
                : null
            api.init(state)
            result.value.players.indexOf(state.user.uid) >= 0 &&
            result.value.started
                ? status.router.push('/game')
                : null
        }

        // listen to changes in the /users path
        firebase
            .addChildEventListener(onChildEvent, status.url)
            .then(function(listenerWrapper) {
                var path = listenerWrapper.path
                var listeners = listenerWrapper.listeners // an Array of listeners added
                // you can store the wrapper somewhere to later call 'removeEventListeners'
                console.log(path, listeners)
            })
        firebase
            .keepInSync(
                status.url, // which path in your Firebase needs to be kept in sync?
                status.status // set to false to disable this feature again
            )
            .then(
                function() {
                    console.log('firebase.keepInSync is ON for ' + status.url)
                    api.init(state)
                },
                function(error) {
                    console.log('firebase.keepInSync error: ' + error)
                }
            )
    },
    /*
	syncSpaces(state, status){
		var onChildEvent = function(result) {
		    console.log('Sync Spaces Event type: ' + result.type)
		    console.log('Key: ' + result.key)
		    state.games[status.gameID].gameState.spaces = status.spaces
	    	// result.value.players.indexOf(state.user.uid) >= 0 && result.value.started ? status.router.push('/game') : null
	  	}


	  // listen to changes in the /users path
		firebase.addChildEventListener(onChildEvent, status.url).then(
		    function(listenerWrapper) {
		    	var path = listenerWrapper.path
		    	var listeners = listenerWrapper.listeners // an Array of listeners added
		      // you can store the wrapper somewhere to later call 'removeEventListeners'
		    }
		)
		firebase.keepInSync(
		    status.url, // which path in your Firebase needs to be kept in sync?
		    status.status      // set to false to disable this feature again
		).then(
		    function () {
		    	console.log('firebase.keepInSync is ON for '+ status.url)
			    state.games[status.gameID].gameState.spaces = status.spaces

		    	// state.games
		    },
		    function (error) {
		    	console.log('firebase.keepInSync error: ' + error)
		    }
		)
	},*/
    unjoinGame(state, obj) {
        console.log(
            'unjoinGame init',
            JSON.stringify(obj),
            JSON.stringify(state.games)
        )
        console.log('unjoinGame players', JSON.stringify(state.games[obj.game]))
        state.games[obj.game].players.pop(
            state.games[obj.game].players.indexOf(obj.player)
        )
        state.multiplayer.joinGame = false
    },
    updateData(state, obj) {
        // console.log('Updating', obj.url, 'with', obj.payload)
        firebase.update(obj.url, obj.payload).then(data => {
            // console.log('data updated', data.result)
            return data
        })
    },
    uploadImage(state, uri, cardKey) {
        console.log('firebase upload', uri, cardKey)
        firebase
            .uploadFile({
                remoteFullPath: 'uploads/images/' + cardKey + '.png',
                localFile: fs.File.fromPath(uri),
                onProgress: function(status) {
                    console.log(
                        'Uploaded fraction: ' + status.fractionCompleted
                    )
                    console.log(
                        'Percentage complete: ' + status.percentageCompleted
                    )
                    return status
                }
            })
            .then(
                function(uploadedFile) {
                    console.log(
                        'File uploaded: ' +
                            JSON.stringify(uploadedFile, null, 2)
                    )
                    return uploadedFile
                },
                function(error) {
                    console.log('File upload error: ' + error)
                }
            )
    }
}
export default api
