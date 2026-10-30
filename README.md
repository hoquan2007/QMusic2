# QMusic — Nền tảng Streaming Âm Nhạc Trực Tuyến Bản Quyền & Nhạc Việt

QMusic là một ứng dụng web nghe nhạc hiện đại, kết nối với các nguồn âm nhạc trực tuyến phong phú gồm **Zing MP3 (Nhạc Việt Nam)**, **Audius (Nhạc Quốc Tế)**, **LRCLIB (Lời bài hát đồng bộ)** và **Jamendo**. Ứng dụng mang lại trải nghiệm streaming mượt mà, chuyên nghiệp với giao diện Dark Mode cao cấp, trình phát âm thanh liên tục xuyên suốt quá trình chuyển trang, hỗ trợ đồng bộ lời bài hát thời gian thực (LRC) và lưu trữ thư viện cá nhân mà không bắt buộc đăng nhập.

---

## 🌟 Tính năng nổi bật

### 1. Nguồn Nhạc Việt & Quốc tế phong phú
- **Tích hợp Nhạc Việt (Zing MP3):** Cập nhật liên tục bảng xếp hạng **#zingchart** Top 100 ca khúc thịnh hành nhất Việt Nam, tìm kiếm hàng triệu bài hát, nghệ sĩ V-Pop hàng đầu (Sơn Tùng M-TP, Đen Vâu, Vũ, Hoàng Thùy Linh, Nguyễn Vĩ, Quốc Thiên...).
- **Tích hợp Audius Protocol:** Khám phá hàng triệu bài hát thịnh hành (Trending), nghệ sĩ độc lập và danh sách phát quốc tế từ mạng lưới Audius.
- **Phát trực tiếp (Live Stream):** Luồng stream âm thanh chính thức với chất lượng cao (`audio/mpeg`), hỗ trợ tua và tải mượt mà.
- **Lọc theo thể loại:** Khám phá nhạc theo các danh mục: Nhạc Việt (V-Pop), Electronic, Hip-Hop/Rap, Pop, Rock, Ambient, Lo-Fi, R&B/Soul, Acoustic...
- **Tìm kiếm đa năng (Live Search):** Tìm kiếm tức thời (debounced 350ms) kết hợp cả kho nhạc Việt Nam và kho nhạc quốc tế.

### 2. Trình phát âm thanh đỉnh cao (Audio Engine)
- **Kiến trúc Singleton:** Chỉ tồn tại duy nhất một đối tượng `HTMLAudioElement` toàn cục, đảm bảo không bị ngắt quãng khi người dùng điều hướng qua các trang.
- **Điều khiển toàn diện:** Play/Pause, Next, Previous, Seekbar với tooltip xem trước thời gian, chỉnh âm lượng mượt, tắt âm (Mute).
- **Chế độ phát:** Shuffle (Ngẫu nhiên), Repeat Off, Repeat All (Lặp lại toàn bộ danh sách) và Repeat One (Lặp lại bài hiện tại).
- **Hàng đợi thông minh (Queue):** Xem danh sách phát tiếp theo, thêm bài vào hàng đợi, xóa bài và xóa toàn bộ hàng đợi.
- **Trình phát toàn màn hình (Expanded Player):** Trải nghiệm giao diện full-screen ấn tượng trên cả desktop lẫn mobile.
- **Media Session API:** Tích hợp với hệ điều hành và tai nghe/phím đa phương tiện (hiển thị ảnh bìa, tên bài hát, nghệ sĩ trên lock screen và thông báo hệ thống).
- **Phím tắt toàn cục:**
  - `Phím Cách (Space)`: Bật / Tạm dừng
  - `Mũi tên Trái / Phải`: Tua lùi / tiến 5 giây
  - `Mũi tên Lên / Xuống`: Tăng / Giảm âm lượng 5%
  - `M`: Bật / Tắt tiếng (Mute)
  - `L`: Mở / Đóng lời bài hát (Lyrics)

### 3. Đồng bộ lời bài hát (Synced Lyrics - LRCLIB)
- Tự động tìm kiếm lời bài hát từ cơ sở dữ liệu mở **LRCLIB**.
- Định dạng **LRC đồng bộ**: Đánh dấu dòng lời đang phát theo thời gian thực và tự động cuộn mượt mà vào giữa màn hình.
- Nhấn vào bất kỳ dòng lời nào để tua ngay đến đoạn nhạc tương ứng.
- Hỗ trợ fallback sang lời bài hát dạng văn bản thường nếu bài hát chưa có bản timestamp.

### 4. Thư viện cá nhân (Guest Storage & Local Persistence)
- **Hoạt động không cần đăng nhập:** Toàn bộ dữ liệu được lưu trữ an toàn trong `localStorage` với cơ chế versioning và validation dữ liệu.
- **Danh sách phát cá nhân:** Tạo mới danh sách phát, đổi tên, thêm mô tả, thêm bài hát, xóa bài hát hoặc xóa danh sách phát.
- **Bài hát yêu thích:** Thả tim nhanh từ mọi giao diện (card, row, player, detail).
- **Lịch sử nghe:** Tự động ghi lại các ca khúc đã nghe kèm mốc thời gian, hỗ trợ phát lại hoặc xóa lịch sử.

### 5. Thiết kế Premium & Responsive
- Phong cách hiện đại: Dark mode chủ đạo trên nền graphite/charcoal (`#0c0d12`), điểm xuyết sắc tím (Violet) và xanh ngọc (Cyan) tinh tế.
- Glassmorphism ở thanh phát nhạc bên dưới.
- Tương thích hoàn hảo trên Desktop, Tablet và Mobile (với Mobile Tab Navigation và Mini Player).
- Chuyển đổi linh hoạt giữa giao diện Tối (Dark), Sáng (Light) và Hệ thống (System).

---

## 🛠️ Công nghệ sử dụng

- **Frontend Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
- **Thư viện UI & Style:** React 19, Tailwind CSS, Lucide React
- **Quản lý trạng thái:** [Zustand](https://github.com/pmndrs/zustand) (Player state, Queue, Library persistence)
- **Data Fetching & Cache:** [TanStack Query v5](https://tanstack.com/query)
- **Kiểm thử tự động:** [Vitest](https://vitest.dev/), React Testing Library
- **Ngôn ngữ:** TypeScript Strict Mode

---

## 🚀 Hướng dẫn cài đặt & Khởi chạy

### 1. Yêu cầu môi trường
- Node.js version 18.18 trở lên (khuyến nghị Node 20 hoặc Node 24).
- Trình quản lý gói: `npm` hoặc `pnpm`.

### 2. Cài đặt các gói phụ thuộc
```bash
# Sử dụng pnpm
pnpm install

# Hoặc sử dụng npm
npm install
```

### 3. Cấu hình biến môi trường
Tạo file `.env.local` dựa trên file `.env.example`:
```bash
# Tên ứng dụng khai báo với Audius API
NEXT_PUBLIC_AUDIUS_APP_NAME=QMusic

# Tùy chọn: Jamendo Client ID (Chỉ cần nếu muốn bật nguồn Jamendo)
# JAMENDO_CLIENT_ID=your_client_id_here

# Tùy chọn: Supabase Configuration (Chỉ cần nếu muốn đồng bộ đám mây đa thiết bị)
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Chạy môi trường phát triển (Development)
```bash
pnpm dev
# Hoặc: npm run dev
```
Mở trình duyệt tại [http://localhost:3000](http://localhost:3000) để trải nghiệm QMusic.

### 5. Chạy kiểm thử tự động (Unit Tests)
```bash
pnpm test
# Hoặc: npm test
```

### 6. Kiểm tra Typecheck & Build Production
```bash
# Kiểm tra TypeScript
pnpm typecheck

# Đóng gói bản Production
pnpm build

# Khởi chạy server Production
pnpm start
```

---

## 🏛️ Kiến trúc Provider Abstraction

Dự án áp dụng mẫu thiết kế Provider độc lập thông qua giao diện `MusicProvider`:

```
lib/
├── api/
│   └── client.ts         # HTTP Client với retry, timeout & exponential backoff
├── providers/
│   ├── audius.ts         # AudiusProvider: Trending, Search, Tracks, Artists, Playlists, Streams
│   ├── jamendo.ts        # JamendoProvider: Hỗ trợ bổ sung giấy phép Creative Commons
│   ├── registry.ts       # Registry điều phối và chuẩn hóa dữ liệu từ các provider
│   └── QueryProvider.tsx # TanStack Query Provider wrapper
├── lyrics/
│   └── lrclib.ts         # LRCLIB API Client & Synchronized LRC Parser
└── supabase/
    ├── client.ts         # Supabase client adapter (tùy chọn)
    └── schema.sql        # RLS Database schema cho multi-device sync
```

---

## 📄 Bản quyền & Điều khoản
- Ứng dụng tuân thủ nghiêm ngặt điều khoản sử dụng API của [Audius](https://docs.audius.co/) và [LRCLIB](https://lrclib.net/).
- Tất cả các luồng âm thanh được phát trực tiếp từ các CDN phân tán hợp pháp của nghệ sĩ.
- Không chứa nội dung scraping trái phép hoặc vi phạm bản quyền.
