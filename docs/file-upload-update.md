# 文件上传功能更新

**更新时间**: 2026-03-10
**功能**: 图片和视频本地文件上传

---

## ✨ 新功能

### 本地文件上传

现在支持直接从本地选择文件上传，不再需要输入 URL！

#### 图片上传
- 点击工具栏的 📷 图片按钮
- 打开文件选择器
- 选择本地图片文件（JPG, PNG, GIF 等）
- 自动上传到 Cloudflare R2
- 上传成功后自动插入到编辑器

#### 视频上传
- 点击工具栏的 🎥 视频按钮
- 打开文件选择器
- 选择本地视频文件（MP4, MOV, WebM, AVI）
- 自动上传到 Cloudflare R2
- 上传成功后自动插入到编辑器

---

## 🎯 用户体验改进

### 之前
- ❌ 需要手动输入图片/视频 URL
- ❌ 需要先上传到其他地方获取 URL
- ❌ 操作繁琐，体验差

### 现在
- ✅ 直接选择本地文件
- ✅ 自动上传到云存储
- ✅ 一键完成，体验流畅
- ✅ 上传进度显示（加载动画）
- ✅ 成功/失败提示（Toast 通知）

---

## 🔧 技术实现

### 使用的 API

#### 图片上传
```typescript
import { uploadImage } from '@/lib/actions/upload'

const formData = new FormData()
formData.append('file', file)
const result = await uploadImage(formData, 'content-images')
```

#### 视频上传
```typescript
import { getVideoUploadUrl } from '@/lib/actions/upload-video'

// 1. 获取预签名 URL
const result = await getVideoUploadUrl(file.name, file.type)

// 2. 上传文件到 R2
await fetch(result.uploadUrl, {
  method: 'PUT',
  body: file,
  headers: { 'Content-Type': file.type },
})
```

### 文件类型限制

#### 图片
- 支持格式：JPG, PNG, GIF, WebP
- 最大大小：5MB
- 存储位置：Cloudflare R2 / content-images

#### 视频
- 支持格式：MP4, MOV, WebM, AVI
- 最大大小：根据 R2 配置
- 存储位置：Cloudflare R2 / videos

---

## 🎨 UI 改进

### 上传状态指示

#### 上传中
- 按钮显示加载动画（旋转的 Loader2 图标）
- 其他按钮禁用，防止重复操作

#### 上传成功
- Toast 提示："图片上传成功" / "视频上传成功"
- 内容自动插入到编辑器光标位置

#### 上传失败
- Toast 提示错误信息
- 用户可以重试

---

## 📝 代码变化

### 新增状态
```typescript
const [isUploadingImage, setIsUploadingImage] = useState(false)
const [isUploadingVideo, setIsUploadingVideo] = useState(false)
const imageInputRef = useRef<HTMLInputElement>(null)
const videoInputRef = useRef<HTMLInputElement>(null)
```

### 新增函数
```typescript
handleImageUpload(file: File)  // 处理图片上传
handleVideoUpload(file: File)  // 处理视频上传
handleImageButtonClick()       // 触发图片文件选择
handleVideoButtonClick()       // 触发视频文件选择
```

### 隐藏的文件输入框
```tsx
<input
  ref={imageInputRef}
  type="file"
  accept="image/*"
  className="hidden"
  onChange={(e) => {
    const file = e.target.files?.[0]
    if (file) handleImageUpload(file)
  }}
/>
```

---

## 🚀 使用方法

### 上传图片
1. 在编辑器中定位光标到想要插入图片的位置
2. 点击工具栏的 📷 图片按钮
3. 在文件选择器中选择图片
4. 等待上传完成（按钮显示加载动画）
5. 图片自动插入到编辑器

### 上传视频
1. 在编辑器中定位光标到想要插入视频的位置
2. 点击工具栏的 🎥 视频按钮
3. 在文件选择器中选择视频
4. 等待上传完成（按钮显示加载动画）
5. 视频自动插入到编辑器

---

## ⚠️ 注意事项

### 文件大小限制
- 图片：最大 5MB
- 视频：根据 R2 配置（建议不超过 100MB）

### 支持的格式
- 图片：JPG, PNG, GIF, WebP
- 视频：MP4, MOV, WebM, AVI

### 上传失败处理
如果上传失败，可能的原因：
1. 文件格式不支持
2. 文件大小超过限制
3. 网络连接问题
4. R2 配置问题

---

## 📊 性能优化

### 上传流程
1. **客户端验证** - 检查文件类型和大小
2. **服务器验证** - 二次验证（防止伪造）
3. **上传到 R2** - 使用预签名 URL（视频）或直接上传（图片）
4. **返回 URL** - 获取公开访问 URL
5. **插入编辑器** - 自动插入到光标位置

### 用户体验优化
- ✅ 上传进度指示（加载动画）
- ✅ 禁用其他操作（防止冲突）
- ✅ Toast 通知（成功/失败反馈）
- ✅ 自动聚焦编辑器

---

## 🔗 相关文件

- 主文件：`components/content/create-post-form.tsx`
- 图片上传：`lib/actions/upload.ts`
- 视频上传：`lib/actions/upload-video.ts`
- R2 配置：`lib/cloudflare/r2.ts`

---

## 📈 待优化项

### 短期
- [ ] 添加上传进度条（显示百分比）
- [ ] 支持拖拽上传
- [ ] 支持粘贴图片
- [ ] 图片压缩（减少上传大小）

### 长期
- [ ] 批量上传
- [ ] 图片编辑（裁剪、旋转）
- [ ] 视频预览
- [ ] 视频转码（统一格式）

---

**更新完成！** 🎉

现在用户可以直接从本地选择文件上传，体验更加流畅！
