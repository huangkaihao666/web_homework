<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loading = ref(true)
const activeTab = ref('recommend')
const activeCategory = ref('all')
const postContent = ref('')
const showPostDialog = ref(false)
const currentUser = ref({
  id: 101,
  name: '当前用户',
  avatar: 'https://via.placeholder.com/40x40?text=User'
})

// 社区分类
const categories = ref([
  { id: 'all', name: '全部' },
  { id: 'experience', name: '购物体验' },
  { id: 'review', name: '商品评测' },
  { id: 'sharing', name: '好物分享' },
  { id: 'discussion', name: '热门讨论' },
  { id: 'help', name: '购物求助' }
])

// 模拟帖子数据
const posts = ref([
  {
    id: 1,
    title: '新入手的智能手表体验分享',
    content: '最近购买了一款智能手表，使用了一周后来分享一下体验。首先外观非常漂亮，金属表壳质感很好，屏幕显示清晰。功能方面，心率监测、睡眠监测都比较准确，运动模式支持多种运动类型...',
    images: ['https://via.placeholder.com/300x200?text=Smartwatch1', 'https://via.placeholder.com/300x200?text=Smartwatch2'],
    category: 'review',
    author: {
      id: 1,
      name: '科技爱好者',
      avatar: 'https://via.placeholder.com/40x40?text=Tech'
    },
    createTime: '2023-07-12 09:45',
    likes: 125,
    comments: 32,
    views: 528,
    isLiked: false,
    commentList: [
      {
        id: 101,
        content: '我也买了这款手表，续航确实不错，支持一下楼主的分享！',
        author: {
          id: 2,
          name: '数码达人',
          avatar: 'https://via.placeholder.com/40x40?text=Digi'
        },
        createTime: '2023-07-12 10:21',
        likes: 15
      },
      {
        id: 102,
        content: '请问防水性能如何？可以游泳时佩戴吗？',
        author: {
          id: 3,
          name: '运动狂人',
          avatar: 'https://via.placeholder.com/40x40?text=Sport'
        },
        createTime: '2023-07-12 11:05',
        likes: 8
      }
    ]
  },
  {
    id: 2,
    title: '有没有适合夏季的防晒霜推荐？',
    content: '最近天气越来越热，想给自己和家人买一些防晒霜。希望推荐一些不油腻、防水性好、适合敏感肌肤的产品，价格在100-200元之间最好。之前用过某某品牌的，感觉还可以但是容易泛白...',
    images: [],
    category: 'help',
    author: {
      id: 4,
      name: '肌肤护理师',
      avatar: 'https://via.placeholder.com/40x40?text=Skin'
    },
    createTime: '2023-07-11 15:32',
    likes: 87,
    comments: 45,
    views: 612,
    isLiked: true,
    commentList: [
      {
        id: 201,
        content: '推荐安耐晒，很清爽不油腻，而且防水性很好，户外活动必备。',
        author: {
          id: 5,
          name: '美妆博主',
          avatar: 'https://via.placeholder.com/40x40?text=Beauty'
        },
        createTime: '2023-07-11 16:00',
        likes: 32
      },
      {
        id: 202,
        content: '敏感肌肤的话，可以考虑薇诺娜或者理肤泉的防晒，温和不刺激。',
        author: {
          id: 6,
          name: '敏感肌专家',
          avatar: 'https://via.placeholder.com/40x40?text=Expert'
        },
        createTime: '2023-07-11 16:25',
        likes: 27
      },
      {
        id: 203,
        content: '资生堂的安热沙也挺好的，我一直在用，不过要注意卸妆。',
        author: {
          id: 7,
          name: '护肤爱好者',
          avatar: 'https://via.placeholder.com/40x40?text=Skincare'
        },
        createTime: '2023-07-11 17:10',
        likes: 19
      }
    ]
  },
  {
    id: 3,
    title: '分享一下我的厨房小家电使用心得',
    content: '作为一个烹饪爱好者，我家里有很多厨房小家电。今天想分享一下这些年用过的那些值得买和不值得买的产品。首先说空气炸锅，真的是我的必备神器，基本上天天用...',
    images: ['https://via.placeholder.com/300x200?text=Kitchen1', 'https://via.placeholder.com/300x200?text=Kitchen2', 'https://via.placeholder.com/300x200?text=Kitchen3'],
    category: 'sharing',
    author: {
      id: 8,
      name: '美食达人',
      avatar: 'https://via.placeholder.com/40x40?text=Food'
    },
    createTime: '2023-07-10 20:15',
    likes: 215,
    comments: 67,
    views: 889,
    isLiked: false,
    commentList: [
      {
        id: 301,
        content: '楼主能详细说说破壁机和普通豆浆机的区别吗？想入手一个但不知道该选哪种。',
        author: {
          id: 9,
          name: '健康生活',
          avatar: 'https://via.placeholder.com/40x40?text=Healthy'
        },
        createTime: '2023-07-10 21:03',
        likes: 12
      },
      {
        id: 302,
        content: '空气炸锅真的很好用！我用它做过鸡翅、薯条，都很成功，而且油量少很多。',
        author: {
          id: 10,
          name: '轻食主义',
          avatar: 'https://via.placeholder.com/40x40?text=LightFood'
        },
        createTime: '2023-07-11 08:23',
        likes: 18
      }
    ]
  },
  {
    id: 4,
    title: '网购家具的注意事项分享',
    content: '去年通过网购平台购买了全屋家具，经历了从挑选、下单到安装的全过程，今天想和大家分享一些经验和教训，希望能帮到准备网购家具的朋友...',
    images: ['https://via.placeholder.com/300x200?text=Furniture'],
    category: 'experience',
    author: {
      id: 11,
      name: '家居规划师',
      avatar: 'https://via.placeholder.com/40x40?text=Home'
    },
    createTime: '2023-07-09 14:20',
    likes: 178,
    comments: 53,
    views: 742,
    isLiked: false,
    commentList: [
      {
        id: 401,
        content: '非常感谢分享！正好我最近也在考虑网购家具，这些建议很有用。',
        author: {
          id: 12,
          name: '新家主人',
          avatar: 'https://via.placeholder.com/40x40?text=NewHome'
        },
        createTime: '2023-07-09 15:11',
        likes: 9
      }
    ]
  },
  {
    id: 5,
    title: '大家怎么看待某某品牌最新款手机的价格定位？',
    content: '最近某某品牌发布了新款旗舰手机，起售价格比上一代高了不少，但是硬件提升并不是特别明显。想听听大家对这个价格定位的看法，你们觉得值得购买吗？',
    images: [],
    category: 'discussion',
    author: {
      id: 13,
      name: '手机控',
      avatar: 'https://via.placeholder.com/40x40?text=Phone'
    },
    createTime: '2023-07-08 16:45',
    likes: 256,
    comments: 128,
    views: 1502,
    isLiked: true,
    commentList: [
      {
        id: 501,
        content: '我觉得不值，现在智能手机已经进入存量市场，创新越来越少，但价格却越来越高，有点过分了。',
        author: {
          id: 14,
          name: '理性消费者',
          avatar: 'https://via.placeholder.com/40x40?text=Consumer'
        },
        createTime: '2023-07-08 17:20',
        likes: 89
      },
      {
        id: 502,
        content: '作为某某品牌的忠实粉丝，我还是会支持的，毕竟生态系统用习惯了，换其他品牌成本太高。',
        author: {
          id: 15,
          name: '品牌粉丝',
          avatar: 'https://via.placeholder.com/40x40?text=Fan'
        },
        createTime: '2023-07-08 17:35',
        likes: 32
      },
      {
        id: 503,
        content: '我觉得可以再等等，新机刚发布价格肯定高，过几个月会降价的。',
        author: {
          id: 16,
          name: '数码观察者',
          avatar: 'https://via.placeholder.com/40x40?text=Observer'
        },
        createTime: '2023-07-08 18:10',
        likes: 67
      }
    ]
  }
])

// 热门话题
const hotTopics = ref([
  { id: 101, title: '夏季防晒产品推荐', posts: 128 },
  { id: 102, title: '智能家居使用体验', posts: 96 },
  { id: 103, title: '如何识别电商平台假货', posts: 85 },
  { id: 104, title: '跨境购物避坑指南', posts: 74 },
  { id: 105, title: '新手装机配置推荐', posts: 62 }
])

// 活跃用户
const activeUsers = ref([
  { id: 1, name: '科技爱好者', avatar: 'https://via.placeholder.com/40x40?text=Tech', posts: 45, followers: 120 },
  { id: 8, name: '美食达人', avatar: 'https://via.placeholder.com/40x40?text=Food', posts: 38, followers: 95 },
  { id: 5, name: '美妆博主', avatar: 'https://via.placeholder.com/40x40?text=Beauty', posts: 32, followers: 88 },
  { id: 11, name: '家居规划师', avatar: 'https://via.placeholder.com/40x40?text=Home', posts: 29, followers: 76 },
  { id: 13, name: '手机控', avatar: 'https://via.placeholder.com/40x40?text=Phone', posts: 25, followers: 65 }
])

// 过滤帖子
const filteredPosts = computed(() => {
  if (activeCategory.value === 'all') {
    return posts.value
  } else {
    return posts.value.filter(post => post.category === activeCategory.value)
  }
})

// 切换分类
const changeCategory = (categoryId) => {
  activeCategory.value = categoryId
}

// 切换选项卡
const changeTab = (tabName) => {
  activeTab.value = tabName
}

// 点赞帖子
const likePost = (post) => {
  post.isLiked = !post.isLiked
  if (post.isLiked) {
    post.likes++
    ElMessage.success('点赞成功')
  } else {
    post.likes--
    ElMessage.info('已取消点赞')
  }
}

// 发布帖子
const publishPost = () => {
  if (!postContent.value.trim()) {
    ElMessage.warning('帖子内容不能为空')
    return
  }
  
  // 模拟发布帖子
  ElMessage.success('发布成功')
  postContent.value = ''
  showPostDialog.value = false
  
  // 实际项目中这里会调用API发布帖子
}

// 查看帖子详情
const viewPostDetail = (postId) => {
  router.push(`/community/post/${postId}`)
}

// 查看用户主页
const viewUserProfile = (userId) => {
  router.push(`/community/user/${userId}`)
}

// 返回首页
const goHome = () => {
  router.push('/')
}

// 初始化
onMounted(() => {
  // 实际项目中这里会调用API获取帖子数据
  setTimeout(() => {
    loading.value = false
  }, 500)
})
</script>

<template>
  <div class="community-container container">
    <div class="page-header">
      <h1>购物社区</h1>
      <el-button @click="goHome" plain>返回首页</el-button>
    </div>
    
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="15" animated />
    </div>
    
    <div v-else class="community-content">
      <div class="content-main">
        <!-- 顶部选项卡 -->
        <div class="community-tabs">
          <div 
            class="tab-item" 
            :class="{ active: activeTab === 'recommend' }"
            @click="changeTab('recommend')"
          >
            推荐
          </div>
          <div 
            class="tab-item" 
            :class="{ active: activeTab === 'hot' }"
            @click="changeTab('hot')"
          >
            热门
          </div>
          <div 
            class="tab-item" 
            :class="{ active: activeTab === 'latest' }"
            @click="changeTab('latest')"
          >
            最新
          </div>
        </div>
        
        <!-- 分类选项卡 -->
        <div class="category-tabs">
          <div 
            v-for="category in categories" 
            :key="category.id"
            class="category-tab"
            :class="{ active: activeCategory === category.id }"
            @click="changeCategory(category.id)"
          >
            {{ category.name }}
          </div>
        </div>
        
        <!-- 发帖按钮 -->
        <div class="post-action">
          <el-button type="primary" @click="showPostDialog = true">
            <i class="el-icon-edit"></i>
            发布新帖
          </el-button>
        </div>
        
        <!-- 帖子列表 -->
        <div class="post-list">
          <div v-if="filteredPosts.length === 0" class="no-posts">
            <el-empty description="暂无相关帖子" />
          </div>
          
          <div 
            v-for="post in filteredPosts" 
            :key="post.id"
            class="post-item"
          >
            <div class="post-author" @click="viewUserProfile(post.author.id)">
              <el-avatar :src="post.author.avatar" :size="40"></el-avatar>
              <div class="author-info">
                <div class="author-name">{{ post.author.name }}</div>
                <div class="post-time">{{ post.createTime }}</div>
              </div>
            </div>
            
            <div class="post-content" @click="viewPostDetail(post.id)">
              <h3 class="post-title">{{ post.title }}</h3>
              <div class="post-text">{{ post.content }}</div>
              
              <div v-if="post.images && post.images.length > 0" class="post-images">
                <div 
                  v-for="(image, index) in post.images.slice(0, 3)" 
                  :key="index"
                  class="image-item"
                >
                  <el-image 
                    :src="image" 
                    fit="cover"
                    :preview-src-list="post.images"
                  >
                    <template #error>
                      <div class="image-placeholder">加载失败</div>
                    </template>
                  </el-image>
                </div>
                <div v-if="post.images.length > 3" class="more-images">
                  +{{ post.images.length - 3 }}
                </div>
              </div>
            </div>
            
            <div class="post-category">
              <el-tag size="small">
                {{ categories.find(c => c.id === post.category)?.name || post.category }}
              </el-tag>
            </div>
            
            <div class="post-actions">
              <div class="action-item" @click="likePost(post)">
                <i :class="post.isLiked ? 'el-icon-star-on liked' : 'el-icon-star-off'"></i>
                <span>{{ post.likes }}</span>
              </div>
              <div class="action-item" @click="viewPostDetail(post.id)">
                <i class="el-icon-chat-dot-round"></i>
                <span>{{ post.comments }}</span>
              </div>
              <div class="action-item">
                <i class="el-icon-view"></i>
                <span>{{ post.views }}</span>
              </div>
              <div class="action-item">
                <i class="el-icon-share"></i>
                <span>分享</span>
              </div>
            </div>
            
            <!-- 评论预览 -->
            <div v-if="post.commentList && post.commentList.length > 0" class="post-comments">
              <div 
                v-for="comment in post.commentList.slice(0, 2)" 
                :key="comment.id"
                class="comment-item"
              >
                <div class="comment-author" @click="viewUserProfile(comment.author.id)">
                  {{ comment.author.name }}:
                </div>
                <div class="comment-content">{{ comment.content }}</div>
              </div>
              
              <div v-if="post.comments > 2" class="more-comments" @click="viewPostDetail(post.id)">
                查看全部 {{ post.comments }} 条评论
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="content-sidebar">
        <!-- 用户信息 -->
        <div class="sidebar-card user-card">
          <el-avatar :src="currentUser.avatar" :size="50"></el-avatar>
          <div class="user-name">{{ currentUser.name }}</div>
          <div class="user-action">
            <el-button size="small" @click="router.push('/member-center')">
              个人中心
            </el-button>
          </div>
        </div>
        
        <!-- 热门话题 -->
        <div class="sidebar-card">
          <div class="card-header">
            <h3>热门话题</h3>
          </div>
          <div class="card-content">
            <div 
              v-for="topic in hotTopics" 
              :key="topic.id"
              class="topic-item"
              @click="router.push(`/community/topic/${topic.id}`)"
            >
              <div class="topic-title"># {{ topic.title }}</div>
              <div class="topic-posts">{{ topic.posts }}篇文章</div>
            </div>
          </div>
        </div>
        
        <!-- 活跃用户 -->
        <div class="sidebar-card">
          <div class="card-header">
            <h3>活跃用户</h3>
          </div>
          <div class="card-content">
            <div 
              v-for="user in activeUsers" 
              :key="user.id"
              class="user-item"
              @click="viewUserProfile(user.id)"
            >
              <el-avatar :src="user.avatar" :size="30"></el-avatar>
              <div class="user-info">
                <div class="user-name">{{ user.name }}</div>
                <div class="user-stats">
                  <span>{{ user.posts }}篇文章</span>
                  <span>{{ user.followers }}个关注</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 社区公告 -->
        <div class="sidebar-card">
          <div class="card-header">
            <h3>社区公告</h3>
          </div>
          <div class="card-content notice-content">
            <p>欢迎来到购物社区！在这里您可以分享购物经验，评测商品，寻求建议或参与讨论。</p>
            <p>请遵守社区规则，禁止发布广告、违规内容或人身攻击言论。</p>
            <p>如有疑问，请联系社区管理员。</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 发帖对话框 -->
    <el-dialog
      title="发布新帖"
      v-model="showPostDialog"
      width="600px"
    >
      <el-form>
        <el-form-item label="标题">
          <el-input v-model="postTitle" placeholder="请输入帖子标题"></el-input>
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="postCategory" placeholder="请选择分类">
            <el-option
              v-for="category in categories.filter(c => c.id !== 'all')"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="内容">
          <el-input
            v-model="postContent"
            type="textarea"
            :rows="6"
            placeholder="分享您的购物体验、商品评测或讨论话题..."
          ></el-input>
        </el-form-item>
        <el-form-item label="图片">
          <el-upload
            action="#"
            list-type="picture-card"
            :auto-upload="false"
          >
            <i class="el-icon-plus"></i>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showPostDialog = false">取消</el-button>
          <el-button type="primary" @click="publishPost">发布</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.community-container {
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

.community-content {
  display: flex;
  gap: 20px;
}

.content-main {
  flex: 1;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.content-sidebar {
  width: 300px;
}

/* 标签页样式 */
.community-tabs {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 15px;
}

.tab-item {
  cursor: pointer;
  padding: 5px 0;
  position: relative;
  font-size: 16px;
  color: #666;
}

.tab-item.active {
  color: #409EFF;
  font-weight: bold;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -15px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #409EFF;
}

/* 分类标签样式 */
.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.category-tab {
  cursor: pointer;
  padding: 4px 12px;
  border-radius: 16px;
  background-color: #f5f5f5;
  font-size: 14px;
  color: #666;
  transition: all 0.3s;
}

.category-tab:hover {
  background-color: #e6f2ff;
  color: #409EFF;
}

.category-tab.active {
  background-color: #409EFF;
  color: #fff;
}

/* 发帖按钮 */
.post-action {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

/* 帖子列表样式 */
.post-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.post-item {
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #f0f0f0;
  transition: all 0.3s;
}

.post-item:hover {
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}

.post-author {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
  cursor: pointer;
}

.author-info {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: bold;
  font-size: 14px;
  color: #333;
}

.post-time {
  font-size: 12px;
  color: #999;
}

.post-content {
  margin-bottom: 15px;
  cursor: pointer;
}

.post-title {
  font-size: 18px;
  color: #333;
  margin: 0 0 10px 0;
}

.post-text {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 15px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}

.post-images {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
  position: relative;
}

.image-item {
  width: 120px;
  height: 120px;
  overflow: hidden;
  border-radius: 4px;
}

.el-image {
  width: 100%;
  height: 100%;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  color: #999;
  font-size: 12px;
}

.more-images {
  position: absolute;
  right: 10px;
  bottom: 10px;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.post-category {
  margin-bottom: 15px;
}

.post-actions {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  color: #666;
  font-size: 14px;
}

.action-item:hover {
  color: #409EFF;
}

.action-item i.liked {
  color: #f56c6c;
}

/* 评论样式 */
.post-comments {
  background-color: #f9f9f9;
  border-radius: 4px;
  padding: 10px;
}

.comment-item {
  display: flex;
  margin-bottom: 8px;
  font-size: 13px;
}

.comment-author {
  font-weight: bold;
  color: #333;
  margin-right: 5px;
  cursor: pointer;
}

.comment-content {
  color: #666;
}

.more-comments {
  color: #409EFF;
  font-size: 13px;
  cursor: pointer;
  margin-top: 5px;
}

/* 侧边栏样式 */
.sidebar-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  overflow: hidden;
}

.user-card {
  padding: 20px;
  text-align: center;
}

.user-name {
  margin: 10px 0;
  font-weight: bold;
  font-size: 16px;
}

.user-action {
  margin-top: 10px;
}

.card-header {
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.card-content {
  padding: 15px;
}

/* 热门话题样式 */
.topic-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f9f9f9;
  cursor: pointer;
}

.topic-item:last-child {
  border-bottom: none;
}

.topic-title {
  font-size: 14px;
  color: #409EFF;
}

.topic-posts {
  font-size: 12px;
  color: #999;
}

/* 活跃用户样式 */
.user-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #f9f9f9;
  cursor: pointer;
}

.user-item:last-child {
  border-bottom: none;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 14px;
  color: #333;
  margin-bottom: 3px;
}

.user-stats {
  font-size: 12px;
  color: #999;
  display: flex;
  gap: 10px;
}

/* 社区公告样式 */
.notice-content p {
  margin: 10px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

/* 响应式布局 */
@media (max-width: 992px) {
  .community-content {
    flex-direction: column;
  }
  
  .content-sidebar {
    width: 100%;
  }
  
  .post-images .image-item {
    width: 100px;
    height: 100px;
  }
}

@media (max-width: 768px) {
  .post-images .image-item {
    width: 80px;
    height: 80px;
  }
  
  .community-tabs {
    gap: 15px;
  }
  
  .page-header h1 {
    font-size: 20px;
  }
}

@media (max-width: 576px) {
  .post-images .image-item {
    width: 70px;
    height: 70px;
  }
  
  .post-actions {
    gap: 10px;
  }
  
  .action-item {
    font-size: 12px;
  }
  
  .post-title {
    font-size: 16px;
  }
}
</style> 