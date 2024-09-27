import { createVuetify } from 'vuetify'
import '@mdi/font/css/materialdesignicons.css';
import * as components from 'vuetify/components'
import * as labsComponents from 'vuetify/labs/components'
import 'vuetify/styles'

export default createVuetify({
  components: {
    ...components,
    ...labsComponents,
  },
})
