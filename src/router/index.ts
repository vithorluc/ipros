import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import InvoiceView from '../views/InvoiceView.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/invoice/:invoiceId',
      name: 'Invoice',
      component: InvoiceView
    }
  ]
})

export default router
