<template>
    
    <flexbox-layout height="8%" class="menu flex-between align-center">
        <button class="menu flex1">?</button>
        <label class="menu flex1">{{$store.state.xeysTotal}} XEYS</label>
        <label class="menu flex1">{{$store.state.sxoins.length}} SXOINS</label>
        

    </flexbox-layout>
</template>

<script>
export default {
    data() {
        return {
            show: {
                logout: false
            }
        }
    },
    computed: {
        /*name: function(){
                return this.$store.dispatch('getDataAction', '/users/' + this.$store.state.user.uid + '/name')
            }*/
    },
    methods: {
        debug() {
            console.log('state')
            for (const prop in this.$store.state) {
                prop == 'games'
                    ? console.log(
                        JSON.stringify(this.$store.state[prop], null, 2)
                    )
                    : prop == 'multiplayer'
                        ? console.log(JSON.stringify(this.$store.state[prop]))
                        : null
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
        logout() {
            this.$store.commit('logout')
            this.$router.push('/auth')
        },
        reset() {
            console.log('TODO reset game')
        }
    },
    mounted() {
        /*console.log('start mounted. user: ', this.$store.state.user.uid, 'route', this.$router.currentRoute.path)
            this.$store.state.name = this.$store.dispatch('getDataAction', '/users/' + this.$store.state.user.uid + '/name')*/
    }
}
</script>
<style>
label.menu,
button.menu {
  color: black;
}
</style>

