<template>
    <div>
        <transition name="fade">
            <div class="ui-mask"
                 v-show="showMask"
                 :style="backgroundColor"
                 @click="tapMask"
                 @touchmove="preventMove">
            </div>
        </transition>
    </div>
</template>

<script>

  /**
   * @file ui-mask
   * @author cuiliang
   * @since 2018-8-1
   */

  export default {
      name: "ui-mask",
      props: {
        showMask: {
          default: false,
          type: Boolean
        },
        opacity: {
          default: .7,
          type: Number
        }
      },
      computed: {
        backgroundColor() {
          return `background-color: rgba(0, 0, 0, ${this.opacity})`;
        }
      },
      methods: {
        tapMask() {
          this.$emit('tap');
        },
        preventMove(e) {
          e.preventDefault();
        }
      }
    }
</script>

<style lang="scss" scoped rel="stylesheet/scss">
  .ui-mask {
      position: fixed;
      left: 0;
      top: 0;
      bottom: 0;
      right: 0;
      z-index: 1000;
      -webkit-tap-highlight-color:transparent;
      box-sizing: border-box;
  }
  .fade-enter-active, .fade-leave-active {
      transition: opacity .1s ease-in-out;
  }
  .fade-enter, .fade-leave-to{
      opacity: 0;
  }
</style>
