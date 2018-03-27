<template>
    <page ref="page" class="background" >
        <stack-layout height="100%">
            <menu v-if="$store.state.show.menu"></menu>
            <router-view></router-view>
        </stack-layout>
    </page>
</template>

<script>
import menu from './Ux/Menu.vue'
export default {
    components: { menu },
    mounted() {
        /*
        this.$nextTick(function(){
            this.$refs.page.nativeView.actionBarHidden = true;
            this.$refs.page.nativeView.backgroundSpanUnderStatusBar = false;
        })
            */
    }
}
</script>

<style>
* {
  font-family: AnonymousPro-Regular, Anonymous Pro;
}
.align-center {
  align-items: center;
}
.align-end {
  align-items: flex-end;
}
.align-start {
  align-items: flex-start;
}
label.anon {
  font-family: Aino-Headline, Aino Headline;
}
.auth-input {
  background-color: rgba(255, 255, 255, 0.699);
  border-radius: 8%;
  color: black;
  font-size: 32em;
  width: 98%;
  margin-bottom: 2%;
  height: 28%;
  padding: 2% 4%;
  font-weight: bold;
}
.auth-title {
  font-size: 40dp;
}
.avatar-button {
  background-image: url("res://green_bg");
  background-size: cover;
}
.background {
  height: 100%;
  width: 100%;
  color: white;
  background-image: url("res://abstract");
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  padding: 3dpi;
}
.blue {
  color: #57baf2;
}
.border-bottom {
  border-bottom-width: 1dpi;
  border-bottom-color: rgba(0, 0, 0, 0.2);
}
button,
.button {
  background-color: rgba(0, 0, 0, 0);
  font-family: Aino-Headline, Aino Headline;
  border-radius: 8%;
  border-width: 2px;
  border-color: white;
  font-size: 40dpi;
}
.button-blue {
  background-image: url("res://blue_bg");
  background-size: cover;
  background-color: #8fb7d4;
  color: #ffffff;
}
.button-circle {
  border-radius: 100%;
}
.button-green {
  background-image: url("res://green_bg");
  background-size: cover;
  background-color: #8fb7d4;
  color: #ffffff;
}
.button-white {
  background-image: url("res://white_bg");
  background-size: cover;
  background-color: #ffffff;
  color: #000000;
}
.cardsets {
  width: 100%;
}
.center {
  text-align: center;
}
.column {
  flex-direction: column;
}
.container {
  padding: 4%;
  flex: 1 1;
  background-color: white;
  color: black;
  font-size: 20;
  border-radius: 4%;
}
.facebook-button {
  background-image: url("res://white_bg");
  background-size: cover;
  background-color: #ffffff;
  color: #000000;
  width: 48%;
  height: 24%;
  font-size: 24dp;
}
.flex1 {
  flex: 1 1;
}
.flex-around {
  justify-content: space-around;
}
.flex-center {
  justify-content: center;
}
.flex-between {
  justify-content: space-between;
}
.go-button {
  background-image: url("res://blue_bg");
  background-size: cover;
  background-color: #8fb7d4;
  color: #ffffff;
  width: 20%;
  height: 24%;
  font-size: 24dp;
}
.justify {
  text-align: justify;
}
label {
  text-align: center;
  font-size: 16dpi;
  font-family: Aino-Headline, Aino Headline;
}
.large {
  font-size: 24dpi;
}
.left {
  text-align: left;
}
.margin2 {
  margin-bottom: 4%;
}
.margin4 {
  margin-bottom: 8%;
}
.margin8 {
  margin-bottom: 16%;
}
.medium {
  font-size: 20dpi;
}
.menu {
  height: 40dpi;
  font-size: 16dpi;
  background-color: rgba(255, 255, 255, 0.699);
  border-bottom-width: 1dpi;
  border-bottom-color: aliceblue;
  z-index: 9999;
}
.menu-font {
  font-size: 16dpi;
}
.name {
  color: #eff142;
}
.on {
  color: #14f086;
}
.pad2 {
  padding: 8%;
}
.pad4 {
  padding: 4%;
}
.pad12 {
  padding: 12%;
}
.right {
  text-align: right;
}
.self-center {
  align-self: center;
}
.signin-button {
  background-color: rgba(0, 0, 0, 0);
  font-size: 20dpi;
  padding: 2%;
}
.small-button {
  font-size: 16dpi;
  margin: 4%;
  background-image: url("res://blue_bg");
  background-size: cover;
}
.small {
  font-size: 16dpi;
}
.splash {
  color: white;
  background-image: url("res://splash");
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
}
.start {
  align-self: flex-start;
}
.start-button {
  height: 100%;
  width: 30%;
  font-size: 30dpi;
  background-image: url("res://green_bg");
  background-size: cover;
}
.welcome {
  font-size: 52dpi;
}
.xlarge {
  font-size: 40dpi;
}
.xxlarge {
  font-size: 48dpi;
}
</style>