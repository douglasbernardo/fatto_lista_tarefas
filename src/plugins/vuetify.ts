import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles' // Adicione isso para importar os estilos do Vuetify

export const vuetify = createVuetify({
  ssr: false,
  components,
  directives,
})
