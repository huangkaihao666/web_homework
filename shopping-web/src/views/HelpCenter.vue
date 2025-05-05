<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loading = ref(true)
const activeCategory = ref('shopping')
const searchQuery = ref('')
const showContactForm = ref(false)

// 表单数据
const contactForm = reactive({
  name: '',
  email: '',
  phone: '',
  issue: '',
  description: '',
  orderId: ''
})

// 常见问题分类
const categories = [
  { id: 'shopping', name: '购物相关' },
  { id: 'order', name: '订单问题' },
  { id: 'payment', name: '支付与发票' },
  { id: 'delivery', name: '配送与安装' },
  { id: 'refund', name: '退款与售后' },
  { id: 'account', name: '账户问题' },
  { id: 'other', name: '其他问题' }
]

// 常见问题列表
const faqList = reactive({
  shopping: [
    { 
      id: 1, 
      question: '如何查找商品？', 
      answer: '您可以通过首页导航栏的分类浏览商品，也可以使用搜索框直接搜索商品名称、品牌或关键词。搜索结果页面还提供了多种筛选条件，帮助您快速找到所需商品。'
    },
    { 
      id: 2, 
      question: '如何查看商品评价？', 
      answer: '在商品详情页面下方，您可以找到"用户评价"选项卡。点击后可查看其他用户对该商品的评价、晒图和使用体验。您还可以按照评分高低、有无图片等条件筛选评价。'
    },
    { 
      id: 3, 
      question: '如何将商品加入购物车？', 
      answer: '在商品详情页，选择您需要的型号、颜色、数量等规格后，点击"加入购物车"按钮即可。您也可以直接点击"立即购买"按钮跳过购物车环节直接结算。'
    },
    { 
      id: 4, 
      question: '如何使用优惠券？', 
      answer: '在购物车或结算页面，您可以看到"使用优惠券"选项。点击后可查看您账户中可用的优惠券，选择适用的优惠券后系统会自动计算优惠金额。请注意查看优惠券的使用条件和有效期。'
    }
  ],
  order: [
    { 
      id: 5, 
      question: '如何查询订单状态？', 
      answer: '登录账户后，点击"我的订单"或"会员中心-订单管理"，可以查看所有订单及其状态。每个订单都会显示当前处理阶段，如待付款、待发货、待收货等。'
    },
    { 
      id: 6, 
      question: '如何取消订单？', 
      answer: '在"我的订单"页面，找到需要取消的订单，点击"取消订单"按钮。请注意，只有在订单状态为"待付款"或"待发货"时才能取消。如订单已发货，需要申请退货退款。'
    },
    { 
      id: 7, 
      question: '订单显示已发货，但未收到物流更新怎么办？', 
      answer: '物流信息通常有延迟，建议您耐心等待24小时。如超过48小时仍无更新，请通过客服联系我们，提供订单号以便我们为您查询最新物流状态。'
    }
  ],
  payment: [
    { 
      id: 8, 
      question: '支持哪些支付方式？', 
      answer: '我们支持多种支付方式，包括信用卡/借记卡支付、支付宝、微信支付、银联支付、货到付款（部分地区）等。在结算页面可以查看适用于您订单的所有可用支付方式。'
    },
    { 
      id: 9, 
      question: '如何申请发票？', 
      answer: '在下单时，结算页面有"发票信息"选项，可选择电子发票或纸质发票，并填写发票抬头、税号等信息。订单完成后，也可在"我的订单"中申请发票。电子发票将发送至您的注册邮箱。'
    },
    { 
      id: 10, 
      question: '支付成功但订单显示未支付怎么办？', 
      answer: '支付状态更新可能有延迟，建议等待10-15分钟。如仍未更新，请截图支付凭证，并联系客服提供订单号和支付信息，我们会尽快为您处理。'
    }
  ],
  delivery: [
    { 
      id: 11, 
      question: '配送范围和时间如何？', 
      answer: '我们覆盖全国大部分地区，具体配送时间取决于您的收货地址和商品发货地。一般情况下，大中城市1-3天送达，偏远地区3-7天送达。部分商品支持次日达和准时达服务。'
    },
    { 
      id: 12, 
      question: '是否提供安装服务？', 
      answer: '大型家电、家具等商品提供基础安装服务，详情请查看商品详情页的"服务"标签。部分商品的安装服务需单独购买，结算时可选择添加。'
    },
    { 
      id: 13, 
      question: '如何修改收货地址？', 
      answer: '订单支付前，可在结算页面直接修改。订单支付后：若显示"待发货"，请立即联系客服协助修改；若已发货，无法修改地址，建议与快递员联系或考虑拒收后重新购买。'
    }
  ],
  refund: [
    { 
      id: 14, 
      question: '退货政策是怎样的？', 
      answer: '我们支持7天无理由退货（部分特殊商品除外）。商品需保持原包装、配件完整，不影响二次销售。食品、定制商品、个人护理用品等特殊商品可能不支持无理由退货，请查看商品详情页说明。'
    },
    { 
      id: 15, 
      question: '如何申请退款？', 
      answer: '在"我的订单"中找到相应订单，点击"申请退款"或"退货退款"，填写退款原因和金额，上传相关凭证，提交申请后等待审核。审核通过后退款将原路返回，到账时间视支付方式而定。'
    },
    { 
      id: 16, 
      question: '收到商品破损怎么办？', 
      answer: '请第一时间拍照记录，并在收货后48小时内联系客服。提供订单号、破损照片和情况说明，我们将安排换货或退款处理。请尽量保留原包装和物流单号。'
    }
  ],
  account: [
    { 
      id: 17, 
      question: '如何修改账户信息？', 
      answer: '登录后进入"会员中心"，点击"账户设置"可修改个人信息、手机号、邮箱等。修改密码和绑定手机需要验证原手机号或邮箱。'
    },
    { 
      id: 18, 
      question: '忘记密码怎么办？', 
      answer: '在登录页面点击"忘记密码"，可通过绑定的手机号或邮箱重置密码。系统将发送验证码或重置链接，按提示完成密码重置操作。'
    },
    { 
      id: 19, 
      question: '账户被盗用怎么办？', 
      answer: '立即联系客服冻结账户，同时修改密码和支付密码。如发现账户有异常交易，请提供相关截图和订单号，我们将协助您处理并加强账户安全。'
    }
  ],
  other: [
    { 
      id: 20, 
      question: '如何成为会员？', 
      answer: '注册账户并完成首次购物后自动成为会员。会员可累积积分、参与专属活动、享受生日特权等。不同等级会员享有不同权益，详情可在"会员中心"查看。'
    },
    { 
      id: 21, 
      question: '积分如何使用？', 
      answer: '积分可在购物时抵扣金额（100积分=1元），也可兑换优惠券或参与积分兑换活动。积分有效期一般为一年，请及时使用。'
    },
    { 
      id: 22, 
      question: '如何联系人工客服？', 
      answer: '工作时间（9:00-22:00）可通过网站右下角的"在线客服"按钮联系，或拨打客服热线400-123-4567。非工作时间可留言，我们会在下一个工作日回复您。'
    }
  ]
})

// 热门问题
const hotQuestions = [
  { id: 14, question: '退货政策是怎样的？', category: 'refund' },
  { id: 8, question: '支持哪些支付方式？', category: 'payment' },
  { id: 6, question: '如何取消订单？', category: 'order' },
  { id: 15, question: '如何申请退款？', category: 'refund' },
  { id: 3, question: '如何将商品加入购物车？', category: 'shopping' }
]

// 筛选后的FAQ列表
const filteredFaqs = ref([])

// 模拟加载数据
const loadData = async () => {
  loading.value = true
  try {
    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // 初始化显示的FAQ列表
    updateFilteredFaqs()
    
    loading.value = false
  } catch (error) {
    console.error('加载帮助中心数据失败:', error)
    ElMessage.error('加载数据失败，请稍后重试')
    loading.value = false
  }
}

// 切换分类
const changeCategory = (categoryId) => {
  activeCategory.value = categoryId
  updateFilteredFaqs()
}

// 更新筛选后的FAQ列表
const updateFilteredFaqs = () => {
  if (!searchQuery.value) {
    // 无搜索条件，只按分类筛选
    filteredFaqs.value = faqList[activeCategory.value] || []
  } else {
    // 有搜索条件，从所有分类中搜索
    const query = searchQuery.value.toLowerCase()
    filteredFaqs.value = []
    
    Object.values(faqList).forEach(categoryFaqs => {
      categoryFaqs.forEach(faq => {
        if (
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query)
        ) {
          filteredFaqs.value.push(faq)
        }
      })
    })
  }
}

// 搜索问题
const searchFaqs = () => {
  updateFilteredFaqs()
}

// 跳转到指定问题
const goToQuestion = (questionId, category) => {
  activeCategory.value = category
  updateFilteredFaqs()
  
  // 使用nextTick确保DOM更新后再滚动
  setTimeout(() => {
    const element = document.getElementById(`faq-${questionId}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      // 高亮效果
      element.classList.add('highlight')
      setTimeout(() => {
        element.classList.remove('highlight')
      }, 2000)
    }
  }, 100)
}

// 提交联系表单
const submitContactForm = () => {
  // 表单验证
  if (!contactForm.name || !contactForm.email || !contactForm.issue || !contactForm.description) {
    ElMessage.warning('请填写必填项')
    return
  }
  
  // 模拟提交表单
  ElMessage.success('您的问题已提交，我们将尽快联系您')
  showContactForm.value = false
  
  // 重置表单
  Object.keys(contactForm).forEach(key => {
    contactForm[key] = ''
  })
}

// 返回首页
const goHome = () => {
  router.push('/')
}

// 页面加载时获取数据
onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="help-center container">
    <div class="page-header">
      <h1>帮助中心</h1>
      <el-button @click="goHome" plain>返回首页</el-button>
    </div>
    
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>
    
    <div v-else class="help-content">
      <!-- 搜索框 -->
      <div class="search-section">
        <div class="search-wrapper">
          <el-input
            v-model="searchQuery"
            placeholder="请输入问题关键词"
            @keyup.enter="searchFaqs"
            clearable
          >
            <template #append>
              <el-button @click="searchFaqs">
                <i class="el-icon-search"></i>
                搜索
              </el-button>
            </template>
          </el-input>
        </div>
        <p class="search-tip">热门搜索: "退货", "配送", "支付方式", "优惠券"</p>
      </div>
      
      <!-- 联系我们按钮 -->
      <div class="contact-action">
        <el-button type="primary" @click="showContactForm = true">
          <i class="el-icon-message"></i>
          联系客服
        </el-button>
      </div>
      
      <div class="help-main">
        <!-- 分类导航 -->
        <div class="category-nav">
          <div class="nav-title">问题分类</div>
          <ul class="category-list">
            <li 
              v-for="category in categories" 
              :key="category.id"
              :class="{ active: activeCategory === category.id }"
              @click="changeCategory(category.id)"
            >
              <span>{{ category.name }}</span>
            </li>
          </ul>
          
          <!-- 热门问题 -->
          <div class="hot-questions">
            <div class="nav-title">热门问题</div>
            <ul class="hot-list">
              <li 
                v-for="question in hotQuestions" 
                :key="question.id"
                @click="goToQuestion(question.id, question.category)"
              >
                <span>{{ question.question }}</span>
              </li>
            </ul>
          </div>
          
          <!-- 客服联系方式 -->
          <div class="contact-info">
            <div class="nav-title">联系方式</div>
            <p>客服热线: 400-123-4567</p>
            <p>工作时间: 9:00-22:00</p>
            <p>客服邮箱: help@example.com</p>
          </div>
        </div>
        
        <!-- FAQ内容 -->
        <div class="faq-content">
          <div v-if="searchQuery" class="search-result-title">
            搜索结果: {{ filteredFaqs.length }} 条匹配的问题
          </div>
          <div v-else class="category-title">
            {{ categories.find(c => c.id === activeCategory)?.name || '常见问题' }}
          </div>
          
          <div v-if="filteredFaqs.length === 0" class="no-result">
            <el-empty description="未找到相关问题" />
            <p class="no-result-tip">
              您可以尝试更换关键词，或
              <span class="link" @click="showContactForm = true">联系客服</span>
              获取帮助
            </p>
          </div>
          
          <div v-else class="faq-list">
            <el-collapse>
              <el-collapse-item 
                v-for="faq in filteredFaqs" 
                :key="faq.id"
                :name="faq.id"
                :id="`faq-${faq.id}`"
              >
                <template #title>
                  <span class="faq-question">{{ faq.question }}</span>
                </template>
                <div class="faq-answer">
                  {{ faq.answer }}
                </div>
                <div class="faq-footer">
                  <div class="feedback">
                    <span>这个回答是否有帮助？</span>
                    <el-button size="small" plain>有帮助</el-button>
                    <el-button size="small" plain>没帮助</el-button>
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 联系表单对话框 -->
    <el-dialog
      title="联系客服"
      v-model="showContactForm"
      width="600px"
    >
      <el-form label-position="top">
        <el-form-item label="姓名 *">
          <el-input v-model="contactForm.name" placeholder="请输入您的姓名"></el-input>
        </el-form-item>
        <el-form-item label="邮箱 *">
          <el-input v-model="contactForm.email" placeholder="请输入您的邮箱"></el-input>
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="contactForm.phone" placeholder="请输入您的联系电话"></el-input>
        </el-form-item>
        <el-form-item label="订单号">
          <el-input v-model="contactForm.orderId" placeholder="如涉及订单问题请填写"></el-input>
        </el-form-item>
        <el-form-item label="问题类型 *">
          <el-select v-model="contactForm.issue" placeholder="请选择问题类型" style="width: 100%">
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.name"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="问题描述 *">
          <el-input
            v-model="contactForm.description"
            type="textarea"
            :rows="6"
            placeholder="请详细描述您遇到的问题，以便我们更好地为您服务"
          ></el-input>
        </el-form-item>
      </el-form>
      <div class="form-tips">
        <p>* 标记为必填项</p>
        <p>我们将在1-2个工作日内回复您</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showContactForm = false">取消</el-button>
          <el-button type="primary" @click="submitContactForm">提交</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.help-center {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.page-header h1 {
  font-size: 24px;
  color: #333;
  margin: 0;
}

.loading-container {
  margin: 40px 0;
}

/* 搜索部分 */
.search-section {
  margin-bottom: 30px;
  text-align: center;
}

.search-wrapper {
  max-width: 600px;
  margin: 0 auto;
}

.search-tip {
  margin-top: 10px;
  font-size: 13px;
  color: #999;
}

/* 联系我们按钮 */
.contact-action {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

/* 主内容区域 */
.help-main {
  display: flex;
  gap: 20px;
}

/* 分类导航 */
.category-nav {
  width: 250px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 15px;
}

.nav-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.category-list {
  list-style: none;
  padding: 0;
  margin: 0 0 30px 0;
}

.category-list li, .hot-list li {
  padding: 10px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;
  margin-bottom: 5px;
}

.category-list li:hover, .hot-list li:hover {
  background-color: #f5f5f5;
  color: #409EFF;
}

.category-list li.active {
  background-color: #ecf5ff;
  color: #409EFF;
}

.hot-questions {
  margin-bottom: 30px;
}

.hot-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.hot-list li {
  font-size: 13px;
  color: #666;
  padding: 8px 10px;
}

.contact-info {
  font-size: 13px;
  color: #666;
}

.contact-info p {
  margin: 10px 0;
}

/* FAQ内容区域 */
.faq-content {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.category-title, .search-result-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.faq-question {
  font-weight: bold;
  color: #333;
}

.faq-answer {
  line-height: 1.6;
  color: #666;
  padding: 10px 0;
}

.faq-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 10px;
  margin-top: 10px;
  border-top: 1px dashed #f0f0f0;
  font-size: 13px;
}

.feedback {
  display: flex;
  align-items: center;
  gap: 10px;
}

.feedback span {
  color: #999;
}

/* 无搜索结果 */
.no-result {
  text-align: center;
  padding: 40px 0;
}

.no-result-tip {
  margin-top: 20px;
  color: #999;
}

.link {
  color: #409EFF;
  cursor: pointer;
}

.link:hover {
  text-decoration: underline;
}

/* 表单提示 */
.form-tips {
  font-size: 13px;
  color: #999;
  margin-top: 20px;
}

.form-tips p {
  margin: 5px 0;
}

/* 高亮效果 */
#faq-item.highlight {
  background-color: #ecf5ff;
  transition: background-color 0.5s;
}

/* 响应式布局 */
@media (max-width: 992px) {
  .help-main {
    flex-direction: column;
  }
  
  .category-nav {
    width: 100%;
    margin-bottom: 20px;
  }
  
  .category-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 20px;
  }
  
  .category-list li {
    margin-bottom: 0;
  }
}

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 20px;
  }
  
  .search-section {
    margin-bottom: 20px;
  }
}

@media (max-width: 576px) {
  .feedback {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .contact-action {
    justify-content: center;
  }
}
</style> 