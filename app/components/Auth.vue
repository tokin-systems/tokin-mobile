<template>
    <stack-layout class="background pad4">
        <!-- <flexbox-layout margin="4%" width="100%" class="flex-between align-center">
            <image 
            class="self-center"
            margin="0 4%" 
            width="40%" 
            src="res://sxan"/>
            <label 
            margin="0 5%" 
            width="60%" 
            class="welcome self-center">
                WELCOME!!!
            </label>
        </flexbox-layout> -->
        <!-- Login -->
        <!-- <stack-layout
        v-if="show === 'create'" 
        width="100%" height="100%"
        orientation="horizontal">
            <flexbox-Layout class="column" width="30%" margin="5%">
                <label 
                class="auth-title" 
                textWrap="true">Create Player</label>
                <button @tap="show = 'sign in'" class="signin-button">Sign In ?</button>
            </flexbox-Layout>
            <flexbox-layout class="flex-between column" width="60%">
                    <stack-layout height="60%">
                        <text-field 
                        class="auth-input" 
                        hint="Email Address" 
                        v-model="create.email"></text-field>
                        <text-field 
                        class="auth-input" 
                        hint="Player Name" 
                        v-model="create.name"></text-field>
                        <text-field 
                        class="auth-input" 
                        secure="true"
                        hint="Password" 
                        v-model="create.password"></text-field>    
                    </stack-layout>
                <flexbox-layout class="flex-between">
                    <button class="avatar-button">Avatar</button>
                </flexbox-layout>
                <flexbox-layout class="flex-between">
                    <button @tap="facebookLoginMethod()" class="facebook-button">FACEBOOK</button>
                    <button @tap="createMethod(create)" class="go-button">GO!</button>
                </flexbox-layout>
            </flexbox-layout>
        </stack-layout> -->
        <flexbox-layout
        width="100%" height="100%"
        class="column flex-around">
            <flexbox-Layout class="column" margin="5%">
                <label 
                class="auth-title"  
                textWrap="true">Sign In</label>
            </flexbox-Layout>
            <flexbox-layout class="flex-between column">
                <stack-layout>
                    <text-field keyboardType="email"
                    class="auth-input" 
                    hint="Email" 
                    v-model="login.name"></text-field>
                    <text-field returnKeyType="done"
                    class="auth-input" 
                    secure="true"
                    hint="Password" 
                    v-model="login.password"></text-field>
                </stack-layout>
                <flexbox-layout class="column flex-between">
                    <button @tap="loginMethod(login)" class="onboard flex1">Log in</button>
                    <button @tap="$router.push('start')"
                    class="second-choice" textWrap="true">New Player?</button>
                </flexbox-layout>
            </flexbox-layout>
        </flexbox-layout>
    </stack-layout>
</template>

<script>
export default {
    name: 'auth',
    data() {
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
        }
    },
    methods: {
        keepChecking: function() {
            setTimeout(() => {
                console.log('Promises?', this.$store.state.user.uid)
                this.$store.state.user.uid
                    ? this.$router.push('/start')
                    : this.keepChecking()
            }, 1000)
        },
        createMethod: function(obj) {
            this.$store.commit('create', obj)
            this.keepChecking()
        },
        facebookLoginMethod: function() {
            this.$store.dispatch('facebookLoginAction').then(result => {
                this.keepChecking()
            })
        },
        loginMethod: function(obj) {
            //console.log('Login:', obj.email)
            obj.router = this.$router
            this.$store.dispatch('loginAction', obj).then(result => {
                this.keepChecking()
            })
        }
    },
    mounted() {
        //console.log('Auth Component Mounted')
        setTimeout(() => {
            this.$store.state.user.uid ? this.$router.push('/start') : null
        }, 3000)
    }
}
</script>
<style>
.second-choice {
  border-width: 0;
  font-size: 20dpi;
}
</style>
