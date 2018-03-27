<template>
    <ScrollView>
        <flexbox-layout class="flex-between">
            <label class="msg">Hustles {{$store.state.industry ? 'in ' + $store.state.industry : ''}}</label>
            <button @tap="chooseIndustry()">Change Industry</button>
        </flexbox-layout>
        
        <flexbox-layout class="column flex-around align-center">
            <flexbox-layout class="flex1" :key="hustlesIndex" v-for="(hustles, hustlesIndex) in $store.state.hustles[$store.state.industry || 'general']">
                <label class="msg" :text="hustles"></label>
            </flexbox-layout>
        </flexbox-layout>
    </ScrollView>
</template>

<script>
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
                        firebase.setValue(
                            'users/' +
                                this.$store.state.user.auth.uid +
                                '/industry',
                            this.$store.state.industry
                        )
                    } else {
                        dialogs.prompt('Suggest an industry').then(r => {
                            this.$store.state.industrySuggestions.push(r.text)
                            firebase.push('industrySuggestions', r.text)
                        })
                    }
                })
        }
    }
}
</script>

<style scoped>
.large {
  font-size: 40;
}
</style>