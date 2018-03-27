<template>
    <ScrollView>
        <stack-layout>
            <label text="Exploring SXAN"></label>
            <button @tap="$router.push('start')">Go Back to Start</button>
        <!-- <menu></menu>
        <flex class="column flex-around" height="88%">
            <label class="xxlarge">Settings</label>
            <flex width="100%" class="flex-around align-center">
                <label width="50%" class="large">Sound FX</label>
                <flexbox-layout @tap="$store.state.settings.soundfx = !$store.state.settings.soundfx" class="flex-center" width="50%">
                    <label :class="{ on: $store.state.settings.soundfx }" class="large">ON</label>
                    <label class="large">/</label>
                    <label :class="{ on: !$store.state.settings.soundfx }" class="large">OFF</label>
                </flexbox-layout>
            </flex>
            <flex class="flex-around align-center">
                <label width="50%" class="large">Music</label>
                <flexbox-layout @tap="$store.state.settings.music = !$store.state.settings.music" class="flex-center" width="50%">
                    <label :class="{ on: $store.state.settings.music }" class="large">ON</label>
                    <label class="large">/</label>
                    <label :class="{ on: !$store.state.settings.music }" class="large">OFF</label>
                </flexbox-layout>
            </flex>
            <flex class="flex-around align-center">
                <label width="50%" class="large">Name</label>
                <label @tap="changeName()" width="50%" class="large name">{{$store.state.name || 'Player'}}</label>
            </flex>
            <flex class="flex-around align-center">
                <label width="50%" class="large">Avatar</label>
                <label width="50%" class="large">Coming Soon</label>
            </flex>
        </flex> -->
        </stack-layout>
    </ScrollView>
    
</template>

<script>
import menu from '../Ux/Menu.vue'
import dialogs from 'ui/dialogs'

export default {
    components: { menu },
    data() {
        return {
            name: 'John',
            age: 34,
            occupation: 'Developer'
        }
    },
    methods: {
        changeName() {
            dialogs.prompt('Change Display Name', '').then(r => {
                console.log('Dialog result: ' + r.result + ', text: ' + r.text)
                if (r.result) {
                    this.$store.dispatch('setDataAction', {
                        url: '/users/' + this.$store.state.user.uid + '/name',
                        payload: r.text,
                        type: 'changeName'
                    })
                    this.$store.dispatch(
                        'getDataAction',
                        '/users/' + this.$store.state.user.uid + '/name'
                    )
                } else {
                    dialogs.alert('Name unchanged')
                }
            })
        }
    }
}
</script>
