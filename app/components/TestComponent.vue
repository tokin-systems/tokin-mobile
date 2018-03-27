<template>
    <scrollview style="min-height: 100%;">
        <stack-layout style="min-height: 100%;">
            <label>Auth Component</label>
            <auth height="100%"></auth>
            <label>Game Components</label>
            <board></board>
            <card></card>
            <start></start>
            <label>Settings Components</label>
            <cards></cards>
            <system></system>
            <user></user>
            <label>Ux Components</label>
            <menu></menu>
            <messaging></messaging>
            <notifications></notifications>
        </stack-layout>
    </scrollview>
</template>

<script>
    /* Game */
    import board from './Game/Board.vue'
    import card from './Game/Card.vue'
    import start from './Game/Start.vue'

    /* Settings */
    import cards from './Settings/Cards.vue'
    import system from './Settings/System.vue'
    import user from './Settings/User.vue'

    /* Ux */
    import menu from './Ux/Menu.vue'
    import messaging from './Ux/Messaging.vue'
    import notifications from './Ux/Notifications.vue'

    /* Auth */
    import auth from './Auth.vue'

    export default {
        components: {
            board, card, start, cards, system, user, menu, messaging, notifications, auth
        },
        data() {
            return {
                name: 'John',
                age: 34,
                occupation: 'Developer'
            }
        }
    }
</script>

<style scoped>
    .large {
        font-size: 40;
    }
</style>