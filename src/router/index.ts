import VueRouter, { RouteConfig } from 'vue-router'
import Vue from 'vue'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    component: () => import('@/views/startup.vue'),
  }
]

const router = new VueRouter({
  routes,
})

export default router
