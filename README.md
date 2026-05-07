# VR Color Circle

VR Color Circle là một trò chơi giáo dục tương tác chạy trên trình duyệt, được xây dựng bằng A-Frame/WebXR nhằm hỗ trợ người học làm quen với lý thuyết màu sắc thông qua thao tác trực tiếp trong không gian 3D. Người chơi sắp xếp các quả cầu màu vào đúng vị trí trên vòng tròn màu nổi để hoàn thành từng cấp độ.

Dự án được định hướng như một đồ án/capstone đại học, tập trung vào các mục tiêu chính:

- Trực quan hóa kiến thức lý thuyết màu trong môi trường 3D.
- Hỗ trợ cả desktop và VR controller.
- Giữ trải nghiệm mượt mà cho ngữ cảnh WebXR.
- Triển khai đơn giản dưới dạng static site.

## Tổng quan dự án

- Tên dự án: **VR Color Circle**
- Loại ứng dụng: **Static client-side WebXR educational game**
- Entry point: `index.html`
- Triển khai: **Vercel**
- Lưu trữ dữ liệu: **LocalStorage** cho bảng xếp hạng
- Không có backend, không có build system, không có automated tests

Trong gameplay chính, người chơi kéo/thả các quả cầu màu và đặt chúng vào đúng vị trí trên vòng tròn màu 3D. Ứng dụng tổ chức nội dung theo 3 level học màu từ cơ bản đến nâng cao: màu cơ bản, màu thứ cấp và màu bậc ba.

## Tính năng nổi bật

- Học lý thuyết màu qua tương tác trực tiếp trong không gian 3D.
- Hỗ trợ **Desktop** và **VR** trong cùng một scene A-Frame.
- 3 cấp độ học màu theo tiến trình:
  - Level 1: Primary Colors
  - Level 2: Secondary Colors
  - Level 3: Tertiary Colors
- Nhiều chế độ chơi:
  - Easy
  - Hard
  - Free Play
  - Leaderboard
- Cơ chế kéo/thả và snap vào slot gần nhất.
- Hiệu ứng âm thanh và particle để tăng phản hồi tương tác.
- Đồng hồ đếm ngược ở chế độ Hard.
- Bảng xếp hạng cục bộ bằng LocalStorage.
- Thiết kế phù hợp để chạy như một website tĩnh, dễ deploy và demo.

## Công nghệ sử dụng

### Core

- **HTML5**
- **CSS3**
- **Vanilla JavaScript** theo phong cách IIFE, tương thích ES5

### 3D / XR

- **A-Frame 1.6.0**
- **aframe-extras 7.6.0**
- **WebXR**
- **Three.js** thông qua A-Frame

### Audio

- **Howler.js 2.2.4**

### Triển khai

- **Vercel** (static hosting)

## Cấu trúc dự án

```text
CK_VR2/
├─ index.html              # Entry point, khai báo scene A-Frame và load toàn bộ script/style
├─ README.md               # Tài liệu dự án
├─ css/
│  └─ styles.css           # CSS tối giản cho trang
├─ js/
│  ├─ color-data.js        # Dữ liệu màu, config level, utility dùng chung
│  ├─ game-manager.js      # State/flow gameplay chính
│  ├─ ui-manager.js        # Điều phối panel UI và HUD
│  ├─ grabber.js           # Input cho VR controller và desktop-grabber
│  ├─ snap-to-slot.js      # Logic snap quả cầu vào vị trí hợp lệ
│  ├─ color-wheel.js       # Vòng tròn màu 3D và quản lý slot
│  ├─ color-ball.js        # Component cho từng quả cầu màu
│  ├─ sound-manager.js     # Quản lý âm thanh và fallback
│  ├─ particle-pool.js     # Pool particle để tối ưu hiệu năng
│  ├─ tooltip.js           # Tooltip kiến thức màu
│  ├─ timer.js             # Đồng hồ đếm ngược cho Hard mode
│  ├─ leaderboard.js       # Lưu/đọc bảng xếp hạng từ LocalStorage
│  ├─ free-play.js         # Chế độ khám phá tự do
│  ├─ vr-button.js         # Nút tương tác trong không gian 3D
│  ├─ shelf.js             # Kệ chứa bóng màu
│  └─ ball-respawn.js      # Đưa bóng về vị trí ban đầu khi rơi khỏi scene
├─ assets/                 # Tài nguyên như âm thanh, hình ảnh
├─ docs/                   # Tài liệu bổ sung (nếu có)
├─ output/                 # Thư mục đầu ra/phụ trợ
├─ plans/                  # Ghi chú kế hoạch nội bộ
└─ skills/                 # Tài liệu/skill của môi trường làm việc, không phải phần app
```

## Cách chạy local

Dự án không cần build. Đây là website tĩnh, có thể mở trực tiếp hoặc chạy bằng local static server.

### Cách 1: Mở trực tiếp

1. Mở file `index.html` bằng trình duyệt hiện đại.
2. Ưu tiên Chrome hoặc Firefox để có hỗ trợ WebGL/WebXR tốt hơn.

### Cách 2: Chạy bằng static server

Nếu muốn tránh một số hạn chế của trình duyệt khi mở file trực tiếp, hãy dùng một static server bất kỳ rồi truy cập vào thư mục dự án.

Ví dụ:

- VS Code Live Server
- Python simple server
- Bất kỳ static hosting local nào

Lưu ý:

- Không có bước cài đặt backend.
- Không có npm scripts bắt buộc để chạy app.
- Không có cơ sở dữ liệu hay dịch vụ server-side.

## Cách chơi

### Mục tiêu

Đặt các quả cầu màu vào đúng vị trí tương ứng trên vòng tròn màu 3D để hoàn thành level.

### Luồng cơ bản

1. Mở game và vào menu chính.
2. Chọn chế độ chơi.
3. Quan sát các quả cầu màu xuất hiện trên kệ.
4. Kéo/thả từng quả cầu vào đúng vị trí trên color wheel.
5. Nhận phản hồi qua hiệu ứng âm thanh, particle và HUD tiến độ.
6. Hoàn thành tất cả màu hợp lệ để qua level hoặc hoàn tất toàn bộ game.

### Điều khiển

#### Desktop

- Dùng chuột để kéo/thả quả cầu.
- Input desktop được xử lý qua `desktop-grabber` trong scene và logic tại `js/grabber.js`.

#### VR

- Dùng controller để trỏ, nắm và thả đối tượng.
- Input VR được xử lý qua component `grabber` gắn trên tay trái/phải.

## Chế độ chơi và cấp độ

### Chế độ chơi

#### Easy

- Chế độ luyện tập cơ bản.
- Không tập trung vào áp lực thời gian như Hard mode.
- Phù hợp cho người mới làm quen với vòng tròn màu.

#### Hard

- Có giới hạn thời gian theo từng level.
- Người chơi cần hoàn thành sắp xếp màu trước khi hết giờ.
- Tăng tính thử thách và cạnh tranh điểm số.

#### Free Play

- Chế độ khám phá tự do.
- Cho phép xem và tương tác với toàn bộ 12 màu mà không cần theo tiến trình level.

#### Leaderboard

- Hiển thị bảng xếp hạng lưu trên máy người dùng.
- Dữ liệu được lưu bằng LocalStorage.

### Cấp độ

#### Level 1 — Primary Colors

- Làm quen với các màu cơ bản.
- Mục tiêu là nhận diện và đặt đúng các màu nền tảng trên vòng tròn màu.

#### Level 2 — Secondary Colors

- Mở rộng sang nhóm màu thứ cấp.
- Tăng độ khó so với level đầu tiên.

#### Level 3 — Tertiary Colors

- Cấp độ nâng cao với nhóm màu bậc ba.
- Yêu cầu nhận diện và phân loại chính xác hơn.

## Kiến trúc chính

Dự án sử dụng mô hình kết hợp giữa **state machine** và **A-Frame component-based architecture**.

### 1. Entry point

`index.html` là điểm bắt đầu của ứng dụng. File này:

- Khởi tạo scene A-Frame.
- Load các thư viện CDN:
  - A-Frame 1.6.0
  - aframe-extras 7.6.0
  - Howler.js 2.2.4
- Load `css/styles.css`.
- Load toàn bộ file trong `js/` theo đúng thứ tự phụ thuộc.

### 2. Quản lý trạng thái gameplay

`js/game-manager.js` là thành phần trung tâm điều phối luồng game:

- Bắt đầu game theo mode.
- Khởi tạo level.
- Theo dõi tiến độ đặt màu.
- Chuyển level.
- Xử lý chiến thắng hoặc hết giờ.
- Quay lại menu hoặc chơi lại.

### 3. Cấu hình và dữ liệu màu

`js/color-data.js` chứa:

- Dữ liệu màu.
- Cấu hình level.
- Các hằng số gameplay.
- Utility function dùng chung cho nhiều module.

### 4. Tương tác input

`js/grabber.js` là lớp trừu tượng hóa input:

- Desktop: kéo/thả bằng chuột.
- VR: thao tác bằng controller.

Nhờ đó, gameplay logic phía sau có thể tái sử dụng cho cả hai môi trường.

### 5. Render và kiểm tra vị trí màu

- `js/color-wheel.js` dựng vòng tròn màu 3D và quản lý slot.
- `js/snap-to-slot.js` xử lý việc snap quả cầu vào vị trí hợp lệ.
- `js/color-ball.js` định nghĩa hành vi/hiển thị của từng quả cầu.

### 6. UI và phản hồi người chơi

- `js/ui-manager.js` quản lý panel menu, victory, game over, leaderboard và HUD.
- `js/vr-button.js` tạo các nút 3D có thể tương tác bằng raycaster.
- `js/tooltip.js` hỗ trợ hiển thị thông tin lý thuyết màu.

### 7. Hiệu năng và phản hồi đa giác quan

- `js/particle-pool.js` dùng object pooling để tránh tạo/hủy particle liên tục.
- `js/sound-manager.js` quản lý âm thanh và fallback khi tài nguyên audio gặp vấn đề.
- `js/timer.js` phục vụ countdown trong Hard mode.

## Checklist kiểm thử thủ công

Dự án hiện không có automated tests, vì vậy cần kiểm thử thủ công trước khi demo hoặc deploy.

### Desktop

- [ ] Mở được `index.html` trong trình duyệt hiện đại.
- [ ] Có thể kéo/thả quả cầu bằng chuột.
- [ ] Đặt đúng màu thì nhận phản hồi hợp lệ.
- [ ] Đặt sai vị trí thì không hoàn tất tiến độ sai lệch.
- [ ] HUD cập nhật level và tiến độ đúng.
- [ ] Easy mode hoạt động ổn định.
- [ ] Hard mode đếm thời gian và xử lý hết giờ đúng.
- [ ] Free Play hiển thị được toàn bộ màu.
- [ ] Leaderboard hiển thị và lưu dữ liệu cục bộ.

### VR

- [ ] Controller có thể trỏ, nắm và thả đối tượng.
- [ ] Có thể tương tác với UI bằng raycaster.
- [ ] Snap khoảng cách đủ thuận tiện trong VR.
- [ ] UI vẫn dễ nhìn trong không gian 3D.
- [ ] Particle và âm thanh hiển thị/phát đúng trong headset.

### Hiệu năng

- [ ] Trải nghiệm không bị giật rõ rệt khi chơi.
- [ ] Particle không gây tụt khung hình đáng kể.
- [ ] Audio không làm nghẽn tương tác.
- [ ] Chuyển panel/menu không gây lỗi hiển thị.

## Ghi chú triển khai

- Ứng dụng được thiết kế để deploy dưới dạng **static site**.
- Không yêu cầu backend hoặc API server.
- Bảng xếp hạng chỉ lưu cục bộ trên trình duyệt bằng LocalStorage.
- Có thể triển khai trực tiếp lên **Vercel** hoặc bất kỳ nền tảng static hosting nào tương đương.
- Khi deploy, cần đảm bảo toàn bộ asset tĩnh (HTML, CSS, JS, âm thanh) được phục vụ đúng đường dẫn.

## Hạn chế hiện tại

- Chưa có automated test suite.
- Không có backend nên leaderboard không đồng bộ giữa nhiều thiết bị/người dùng.
- Chưa có build pipeline, bundling hoặc minification.
- Kiến trúc JavaScript theo IIFE/ES5 phù hợp cho tính đơn giản, nhưng khó mở rộng hơn so với module hiện đại.
- Một số tinh chỉnh UX/accessibility cho desktop và VR vẫn có thể tiếp tục cải thiện.
- Việc kiểm thử VR phụ thuộc thiết bị/hệ môi trường WebXR tương thích.

## Phù hợp cho đồ án/capstone

VR Color Circle phù hợp để trình bày như một dự án capstone vì kết hợp được các yếu tố:

- Ứng dụng công nghệ WebXR/A-Frame vào giáo dục.
- Thiết kế gameplay phục vụ học tập thay vì chỉ giải trí.
- Thể hiện tư duy kiến trúc phần mềm client-side theo component và state flow.
- Quan tâm đến hiệu năng thời gian thực trong môi trường 3D/VR.
- Dễ demo trên trình duyệt và dễ triển khai công khai.

## Tài liệu tham khảo nội bộ

Khi cần tìm hiểu sâu hơn về mã nguồn, nên bắt đầu từ các file sau:

- `index.html`
- `js/game-manager.js`
- `js/color-data.js`
- `js/color-wheel.js`
- `js/grabber.js`
- `js/ui-manager.js`

---

Nếu bạn đang tiếp tục phát triển dự án, nên ưu tiên các hướng mở rộng như:

- Bổ sung automated tests hoặc ít nhất là test harness cho logic cốt lõi.
- Cải thiện accessibility và onboarding cho người chơi mới.
- Tối ưu thêm hiệu năng render trong headset VR.
- Cân nhắc module hóa hiện đại khi dự án tăng quy mô.
