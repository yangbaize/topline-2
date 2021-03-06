<template>
  <div class="login-wrap">
    <!-- 给组件加 class，会把这个 class 作用到组件的根元素上 -->
    <div class="form-wrap">
      <div class="form-head">
        <img
          src="./logo_index.png"
          alt="黑马头条号"
        >
      </div>
      <el-form
        class="form-content"
        ref="form"
        :model="form"
        :rules="rules"
      >
        <el-form-item prop="mobile">
          <el-input
            v-model="form.mobile"
            placeholder="手机号"
          ></el-input>
        </el-form-item>
        <el-form-item prop="code">
          <!-- el-col 栅格布局，一共 24 列，:span 用来指定占用的大小，:offset 用来指定偏移量 -->
          <el-col :span="14">
            <el-input
              v-model="form.code"
              placeholder="验证码"
            ></el-input>
          </el-col>

          <el-col
            :offset="1"
            :span="9"
          >
            <el-button
              @click="handleSendCode"
              :disabled="!!codeTimer"
            >{{ codeTimer ? `剩余${codeTimeSeconds}秒` : '获取验证码' }}</el-button>
          </el-col>
        </el-form-item>
        <el-form-item prop="agree">
          <el-checkbox
            class="agree-checkbox"
            v-model="form.agree"
          ></el-checkbox>
          <span class="agree-text">我已阅读并同意<a href="#">用户协议</a>和<a href="#">隐私条款</a></span>
        </el-form-item>
        <el-form-item>
          <el-button
            class="btn-login"
            type="primary"
            @click="handleLogin"
          >登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
// import '@/vendor/gt.js'
import { saveUser } from '@/utils/auth'
import initGeetest from '@/utils/init-geetest'

const initCodeTimerSeconds = 60

export default {
  name: 'AppLogin',
  data () {
    return {
      form: {
        mobile: '',
        code: '',
        agree: ''
      },
      // 失焦验证的规则
      rules: {
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /\d{11}/, message: '长度11个字符', trigger: 'blur' }
        ],
        code: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { pattern: /\d{6}/, message: '长度6个字符', trigger: 'blur' }
        ],
        agree: [
          { required: true, message: '请同意用户协议' },
          { pattern: /true/, message: '请同意用户协议' }
        ]
      },
      codeTimer: null, // 倒计时定时器
      codeTimeSeconds: initCodeTimerSeconds // 倒计时时间
    }
  },
  methods: {
    // 零, 显示表单页面组件的方法
    onSubmit () {
      console.log('submit!')
    },

    // 一, 验证手机号 (点击验证码--直接验证手机号)
    handleSendCode () {
      // 使用 form 组件的 validate 方法
      this.$refs['form'].validateField('mobile', errorMessage => {
        if (errorMessage.trim().length > 0) {
          return
        }
        // 验证通过,初始化显示验证码
        this.showGeetest()
      })
    },

    // 二, 验证通过,初始化显示验证码
    async showGeetest () {
      // 发送请求,获取初始化验证码的参数
      const { mobile } = this.form
      const data = await this.$http({
        methods: 'GET',
        url: `/captchas/${mobile}`
      })
      // 根据第一次与后端请求得到的参数-用于与极验服务器交互 -得到人机交互弹框-并得到申请短信接口的数据
      const captchaObj = await initGeetest({// 以下配置参数来自服务端 SDK
        gt: data.gt,
        challenge: data.challenge,
        offline: !data.success,
        new_captcha: data.new_captcha,
        product: 'bind' // 验证码人机验证效果弹框
      })
      captchaObj.onReady(() => {
        // 验证码ready之后才能调用verify方法显示验证码
        captchaObj.verify()
      }).onSuccess(async () => {
        // console.log(captchaObj.getValidate())  改名--为了的到下面的名字
        const { geetest_validate: validate,
          geetest_seccode: seccode,
          geetest_challenge: challenge
        } = captchaObj.getValidate()
        // 请求短信接口 发送短信了
        await axios({
          methods: 'GET',
          url: `/sms/codes/${mobile}`,
          params: {
            seccode,
            validate,
            challenge
          }
        })
        // 发送短信成功发送倒计时
        this.codeCountDown()
      })
    },

    // 三, 定时器
    codeCountDown () {
      this.codeTimer = window.setInterval(() => {
        this.codeTimeSeconds--
        if (this.codeTimeSeconds <= 0) {
          window.clearInterval(this.codeTimer)
          this.codeTimeSeconds = initCodeTimerSeconds
          this.codeTimer = null
        }
      }, 1000)
    },

    // 四, 登录请求-表单验证
    handleLogin () {
      // 使用JS,强制校验表单(直接点击登录,校验代码--之前是光标失去焦点才校验的)
      this.$refs['form'].validate((valid) => {
        if (!valid) {
          return
        }
        // 表单验证通过.提交登录请求
        this.submitLogin()
      })
    },

    // 五, 表单验证通过,发起登录请求
    async submitLogin () {
      try {
        const userInfo = await this.$http({
          method: 'POST',
          // url: 'http://toutiao.course.itcast.cn/mp/v1_0/authorizations',
          url: '/authorizations',
          data: this.form
        })
        // const userInfo = res.data.data
        // window.localStorage.setItem('user_info', JSON.stringify(userInfo))
        saveUser(userInfo)
        this.$message({
          message: '恭喜你，登录成功',
          type: 'success'
        })
        this.$router.push({
          name: 'home'
        })
      } catch (err) {
        this.$message.error('错了哦，请重新登陆')
      }
    }
  }
}
</script>

<style lang="less" scoped>
.login-wrap {
  height: 100%;
  background-image: url("./login_bg.jpg");
  display: flex;
  justify-content: center;
  align-items: center;
  .form-head {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 10px;
    img {
      width: 200px;
    }
  }
  .form-wrap {
    width: 400px;
    background-color: #fff;
    padding: 20px;
    border-radius: 10px;
    .btn-login {
      width: 100%;
    }
  }
}
</style>
