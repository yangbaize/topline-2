import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      name: 'login',
      path: '/login',
      component: () => import('@/views/login')
    },
    {
      // name: 'layout',
      path: '/',
      component: () => import('@/views/layout'),
      children: [
        {
          name: 'home',
          path: '',
          component: () => import('@/views/home')
        },
        {
          name: 'publish',
          path: '/publish',
          component: () => import('@/views/publish')
        }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  const userInfo = window.localStorage.getItem('user_info')
  if (to.path !== '/login') {
    if (!userInfo) {
      next({ name: 'login' })
    } else {
      next()
    }
  } else {
    if (!userInfo) {
      next()
    } else {
      window.location.href = '/#/'
      // next({ name: 'home' })
      window.location.reload()
    }
  }
})
export default router
