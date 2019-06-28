import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './styles/index.less'
import 'nprogress/nprogress.css'
import axios from 'axios'
import { getUser } from '@/utils/auth'

import router from './router'

axios.defaults.baseURL = 'http://ttapi.research.itcast.cn/mp/v1_0/'

// axios请求拦截器
axios.interceptors.request.use(config => {
  const user = getUser()

  // 如果有 user 数据，则往本次请求中添加用户 token
  if (user) {
    config.headers.Authorization = `Bearer ${user.token}`
  }

  // return config 是允许请求发送的开关
  // 我们可以在这之前进行一些业务逻辑操作
  return config
}, error => {
  return Promise.reject(error)
})

/**
 * Axios 响应拦截器：axios 收到的响应会先经过这里
 */
axios.interceptors.response.use(response => {
  if (typeof response.data === 'object' && response.data.data) {
    return response.data.data
  } else {
    return response.data
  }
}, error => {
  return Promise.reject(error)
})

Vue.use(ElementUI)
Vue.prototype.$http = axios
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
