import VueRouter, { RouteConfig } from 'vue-router'
import Vue from 'vue'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Doom',
    component: () => import('../views/Doom.vue'),
  },
]

const router = new VueRouter({
  routes,
})

export default router
