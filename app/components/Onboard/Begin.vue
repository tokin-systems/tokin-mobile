<template>
    <flexbox-layout height="100%" width="100%" class="flex-between column background">
        <ScrollView class="msgs" id="scroller">
            <stack-layout textWrap="true">
                <label textWrap="true" class="msg" :key="msgIndex" v-for="(msg, msgIndex) in $store.state.msgs.begin" :text="msg"></label>
            </stack-layout>
        </ScrollView>
        <stack-layout v-if="$store.state.show.begin.start" class="button-block">
            <button @tap="next1()" class="onboard">Continue</button> 
            <flexbox-layout class="flex-between">
                <button class="flex1 second-choice" @tap="$router.push('profile')">Skip</button>
                <button class="flex1 second-choice" @tap="$router.push('explore')">Explore</button>
            </flexbox-layout>
        </stack-layout>
        <stack-layout v-else-if="$store.state.show.begin.next1" class="button-block">
            <button @tap="next2()" class="onboard">Next</button> 
            <flexbox-layout class="flex-between">
                <button class="flex1 second-choice" @tap="$router.push('profile')">Skip</button>
                <button class="flex1 second-choice" @tap="$router.push('explore')">Explore</button>
            </flexbox-layout>
        </stack-layout>
        <stack-layout v-else-if="$store.state.show.begin.next2" class="button-block">
            <button @tap="next3()" class="onboard">Next</button> 
            <flexbox-layout class="flex-between">
                <button class="flex1 second-choice" @tap="$router.push('profile')">Skip</button>
                <button class="flex1 second-choice" @tap="$router.push('explore')">Explore</button>
            </flexbox-layout>
        </stack-layout>
        <stack-layout v-else-if="$store.state.show.begin.next3" class="button-block">
            <button v-if="$store.state.industry.length<1" @tap="chooseIndustry()" class="onboard">Choose Industry</button> 
        </stack-layout>
        <stack-layout v-else-if="$store.state.show.begin.next4" class="button-block">
            <button @tap="$router.push('hustles')" class="onboard">On to Hustles</button> 
        </stack-layout>
        <stack-layout v-else class="button-block">
            <label>Houston, we have an error</label>
            <button @tap="$router.push('hustles')" class="onboard">Next Hustles</button> 
        </stack-layout>
    </flexbox-layout>
    
</template>

<script>
import dialogs from 'ui/dialogs'
import firebase from 'nativescript-plugin-firebase'

export default {
    data() {
        return {}
    },
    methods: {
        chooseIndustry() {
            dialogs
                .action({
                    message: 'Choose an industry or tap "Other" to suggest one',
                    cancelButtonText: 'Cancel',
                    actions: ['Music', 'Cannabis', 'Startups', 'Other']
                })
                .then(result => {
                    console.log('result', JSON.stringify(result))
                    if (result !== 'Other') {
                        this.$store.state.industry = result.toLowerCase()
                        console.log(
                            'result',
                            JSON.stringify(this.$store.state.industry)
                        )
                        firebase.setValue(
                            'users/' +
                                this.$store.state.user.auth.uid +
                                '/industry',
                            this.$store.state.industry
                        )
                        this.$store.commit('createXey', {
                            user: 'SXAN',
                            utility: 'post',
                            privacy: 'public'
                        })
                        this.next4()
                    } else {
                        dialogs.prompt('Suggest an industry').then(r => {
                            console.log('result', JSON.stringify(r))

                            this.$store.state.industrySuggestions.push(r.text)
                            firebase.push('industrySuggestions', r.text)
                        })
                    }
                })
        },
        next1() {
            this.$store.state.show.begin.start = false
            this.$store.state.show.begin.next1 = true
            this.$store.state.msgs.begin = [
                'Use SXOINS to post content and transact with other players.'
            ]
            firebase
                .getValue('/users/' + this.$store.state.user.uid)
                .then(userResult => {
                    this.$store.state.user = userResult.value
                })
        },
        next2() {
            this.$store.state.show.begin.next1 = false
            this.$store.state.show.begin.next2 = true
            this.$store.state.msgs.begin.push(
                'XEYs allow signing, access to SXAN features, and ensure your records are private'
            )
        },
        next3() {
            this.$store.state.show.begin.next2 = false
            this.$store.state.show.begin.next3 = true
            this.$store.state.msgs.begin.push(
                'Use SXOINs and XEYs to bridge meaningful connections in your industry.'
            )
        },
        next4() {
            this.$store.state.show.begin.next3 = false
            this.$store.state.show.begin.next4 = true
            this.$store.state.msgs.begin = [
                'You earned another public XEY. This one let\'s you post. Certain hustles require certain XEYs...'
            ]
        }
    }
}
</script>
