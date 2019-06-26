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
            <el-button @click="handleSendCode">获取验证码</el-button>
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
import '@/vendor/gt.js'

export default {
  name: 'AppLogin',
  data () {
    return {
      form: {
        mobile: '',
        code: '',
        agree: ''
      },
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
      }
    }
  },
  methods: {
    onSubmit () {
      console.log('submit!')
    },
    // 与后端第一次交互
    handleSendCode () {
      // 验证手机号是否有效
      this.$refs['form'].validateField('mobile', errorMessage => {
        if (errorMessage.trim().length > 0) {
          return
        }
        // 验证通过,初始化显示验证码
        this.showGeetest()
      })
    },
    // 验证通过,初始化显示验证码
    showGeetest () {
      const { mobile } = this.form
      axios({
        methods: 'GET',
        url: `http://ttapi.research.itcast.cn/mp/v1_0/captchas/${mobile}`
      }).then(res => {
        // 根据第一次与后端请求得到的数据-用于与极验服务器交互 -得到人机交互弹框-并得到申请短信接口的数据
        const { data } = res.data
        window.initGeetest({// 以下配置参数来自服务端 SDK
          gt: data.gt,
          challenge: data.challenge,
          offline: !data.success,
          new_captcha: data.new_captcha,
          product: 'bind'
        }, function (captchaObj) {
          // 这里可以调用验证实例 captchaObj 的实例方法
          captchaObj.onReady(function () {
            // 验证码ready之后才能调用verify方法显示验证码
            captchaObj.verify()
          }).onSuccess(function () {
            // console.log(captchaObj.getValidate())
            const { geetest_validate: validate,
              geetest_seccode: seccode,
              geetest_challenge: challenge
            } = captchaObj.getValidate()
            // 请求短信接口
            axios({
              methods: 'GET',
              url: `http://ttapi.research.itcast.cn/mp/v1_0/sms/codes/${mobile}`,
              params: {
                seccode,
                validate,
                challenge
              }
            }).then(res => {
              console.log(res.data)
            })
          }).onError(function () {
            // your code
          })
        })
      })
    },
    // 登录请求
    handleLogin () {
      this.$refs['form'].validate((valid) => {
        if (!valid) {
          return
        }
        // 表单验证通过.提交登录请求
        this.submitLogin()
      })
    },
    submitLogin () {
      axios({
        method: 'POST',
        url: 'http://toutiao.course.itcast.cn/mp/v1_0/authorizations',
        data: this.form
      })
        .then(res => {
          this.$message({
            message: '恭喜你，登录成功',
            type: 'success'
          })
          this.$router.push({
            name: 'home'
          })
        })
        .catch((e) => {
          this.$message.error('错了哦，请重新登陆')
        })
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
