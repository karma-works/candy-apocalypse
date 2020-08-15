import VueRouter, { RouteConfig } from 'vue-router'
import Vue from 'vue'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/',
    component: () => import('@/views/startup.vue'),
  },
  {
    path: '/files-listing/:parent?',
    component: () => import('@/views/files-listing.vue'),
  },
]

const router = new VueRouter({
  routes,
})

export default router
