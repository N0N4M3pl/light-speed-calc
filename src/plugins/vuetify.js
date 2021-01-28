import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import colors from 'vuetify/lib/util/colors';

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    themes: {
      light: {
        primary: colors.grey.darken4,
        secondary: colors.grey.lighten5,
        accent: colors.blueGrey.base,
        error: colors.red.base,
        warning: colors.orange.base,
        info: colors.blueGrey.base,
        success: colors.grey.base
      }
    }
  }
});
