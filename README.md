# VR Color Circle

VR Color Circle là game giáo dục 3D/VR chạy hoàn toàn phía client, dùng A-Frame/WebXR để dạy vòng tròn màu qua thao tác kéo thả và pha màu trực tiếp trong không gian ảo. Ở trạng thái hiện tại, dự án không còn chỉ là game đặt bóng theo wheel cơ bản mà đã có thêm nhánh `Mixing Mode`, khu exhibition, HUD diegetic, leaderboard tách theo từng mode, và các script kiểm tra runtime cho tiến trình level.

## Tổng quan hiện tại

- Entry point: `index.html`
- Kiến trúc: static site, không backend, không `package.json`, không bước build bắt buộc
- Runtime chính: A-Frame 1.6.0, aframe-extras 7.6.0, Howler.js 2.2.4
- Input: chuột trên desktop và controller trong VR
- Lưu trạng thái điểm: `localStorage`
- Luồng chính trong menu:
  - `Normal Mode`: `Easy`, `Hard`
  - `Mixing Mode`: `Mix Easy`, `Mix Hard`
  - `Extra`: `Free Play`, `Leaderboard`

## Điểm nổi bật

- Một scene A-Frame duy nhất chứa đầy đủ menu, HUD, gameplay world, leaderboard, victory và game over.
- Hai kiểu chơi khác nhau:
  - `Normal Mode`: kéo bóng màu lên wheel đúng vị trí.
  - `Mixing Mode`: đưa bóng vào trạm pha màu để tạo màu mục tiêu, rồi đặt kết quả lên wheel.
- Tiến trình 5 level cho cả nhánh normal và nhánh mixing.
- Có `skip level` trong `easy` và `mix-easy`.
- Leaderboard lưu top 10 kết quả cho từng mode và hiển thị top 5 trên panel.
- Audio có cơ chế fallback bằng Web Audio tone nếu file âm thanh không tải được.
- Có script kiểm tra runtime cho progression của normal mode và mixing mode trong `tests/`.

## Công nghệ sử dụng

- `HTML5`
- `CSS3`
- `Vanilla JavaScript` theo kiểu global/IIFE
- `A-Frame`
- `aframe-extras`
- `Howler.js`
- `WebXR`

## Cấu trúc dự án

```text
CK_VR2/
├─ index.html
├─ README.md
├─ css/
│  └─ styles.css
├─ js/
│  ├─ ambient-particles.js
│  ├─ ball-respawn.js
│  ├─ color-ball.js
│  ├─ color-data.js
│  ├─ color-wheel.js
│  ├─ exhibition-room.js
│  ├─ free-play.js
│  ├─ game-manager.js
│  ├─ grabber.js
│  ├─ grid-floor.js
│  ├─ leaderboard.js
│  ├─ mixing-station.js
│  ├─ particle-pool.js
│  ├─ shelf.js
│  ├─ snap-to-slot.js
│  ├─ sound-manager.js
│  ├─ starfield-sky.js
│  ├─ timer.js
│  ├─ tooltip.js
│  ├─ ui-manager.js
│  └─ vr-button.js
├─ assets/
│  ├─ images/
│  └─ *.glb
├─ tests/
│  ├─ normal-level-check.js
│  └─ mixing-level-runtime-check.js
├─ docs/
└─ skills/
```

## Cách chạy local

Dự án là static site, nên cách chạy ổn định nhất là phục vụ repo qua localhost thay vì mở `file://` trực tiếp.

### Cách khuyến nghị

1. Mở terminal tại thư mục repo.
2. Chạy một static server bất kỳ.
3. Truy cập `http://127.0.0.1:<port>/index.html`.

Ví dụ với Python:

```powershell
python -m http.server 4173
```

Sau đó mở:

```text
http://127.0.0.1:4173/index.html
```

### Ghi chú

- Không cần cài dependency từ `npm` vì repo hiện không có `package.json`.
- Có thể dùng VS Code Live Server hoặc bất kỳ static server nào khác.
- Nếu cần test browser automation hoặc WebXR flow, nên luôn dùng localhost.

## Cách chơi

### Desktop

- Dùng chuột để kéo và thả bóng màu.
- Camera dùng `look-controls`, còn thao tác kéo thả đi qua `desktop-grabber`.

### VR

- Hai tay `left-hand` và `right-hand` dùng `laser-controls` + `grabber`.
- Các nút menu và object gameplay đều đi qua raycaster vào các entity `.interactive`.

### Mục tiêu

- Ở `Normal Mode`: đặt đúng bóng màu vào slot tương ứng trên color wheel.
- Ở `Mixing Mode`: pha ra màu cần thiết tại `mixing-station`, sau đó đặt kết quả đúng lên wheel.

## Các chế độ chơi

### Normal Mode

- `Easy`: không giới hạn thời gian, có nút skip level.
- `Hard`: có đồng hồ đếm ngược cho từng level.

### Mixing Mode

- `Mix Easy`: không giới hạn thời gian, có nút skip level.
- `Mix Hard`: có đồng hồ đếm ngược và thêm áp lực quản lý chỗ trống trên kệ.

### Free Play

- Dùng `FreePlayManager`.
- Spawn toàn bộ tập màu từ `COLOR_LIST`.
- Hiển thị wheel và HUD mà không theo tiến trình thắng thua chuẩn.

### Leaderboard

- Lưu dữ liệu theo 4 mode:
  - `easy`
  - `hard`
  - `mix-easy`
  - `mix-hard`
- Mỗi mode lưu tối đa 10 kết quả trong `localStorage`.
- Panel leaderboard hiện top 5 kết quả ngắn gọn.

## Progression level hiện tại

### Normal Mode

- Level 1: `Primary Colors + White` với 4 mục tiêu.
- Level 2: `Secondary Colors` với 3 mục tiêu.
- Level 3: `Tertiary Colors` với 6 mục tiêu.
- Level 4: `Tint Colors` với 12 mục tiêu.
- Level 5: `Full Color Wheel` với 25 mục tiêu.

### Mixing Mode

- Level 1: `Mix Primary Colors`
- Level 2: `Mix Secondary Colors`
- Level 3: `Mix Tertiary Colors`
- Level 4: `Mix Tint Colors`
- Level 5: `Master Mixer`

Logic level nằm trong `js/color-data.js` qua `LEVEL_CONFIG` và `MIX_LEVEL_CONFIG`, còn flow chuyển level/victory nằm trong `js/game-manager.js`.

## Kiến trúc chính

### `index.html`

- Khai báo toàn bộ scene A-Frame.
- Nạp script theo đúng thứ tự phụ thuộc.
- Chứa menu panel, leaderboard panel, victory panel, gameover panel, freeplay panel, HUD và gameplay world.

### `js/game-manager.js`

- State machine trung tâm cho `MENU`, `PLAYING`, `LEVEL_COMPLETE`, `VICTORY`, `TIME_UP`, `FREE_PLAY`.
- Điều phối `startGame`, `startMixingGame`, `initLevel`, `initMixingLevel`, `skipLevel`, `retryCurrentLevel`, `backToMenu`.
- Quản lý shelf slot của mixing mode và điều kiện thua khi kệ đầy.

### `js/color-data.js`

- Khai báo dữ liệu màu, recipe pha màu, tint variant, config level và các helper dùng chung.
- Đây là nguồn sự thật cho số lượng target, timer và mapping pha màu.

### `js/color-wheel.js`

- Dựng color wheel.
- Cập nhật các slot hiển thị theo level.
- Xóa/đặt màu khi người chơi hoàn thành mục tiêu.

### `js/mixing-station.js`

- Giữ bóng đầu vào, pha màu, tạo kết quả hoặc tạo `waste`.
- Hỗ trợ pha tint bằng cách thêm `white` vào màu đang có.

### `js/ui-manager.js`

- Bật/tắt panel.
- Đồng bộ HUD, timer, shelf counter, transient status message.
- Route các event UI sang `GameManager` và `FreePlayManager`.

### `js/sound-manager.js`

- Phát BGM và SFX qua Howler khi asset tồn tại.
- Nếu audio file lỗi hoặc thiếu, fallback sang tone phát bằng Web Audio API.

## Kiểm tra hiện có

Repo hiện chưa có browser e2e test đầy đủ, nhưng đã có 2 script Node để kiểm tra progression logic:

```powershell
node tests/normal-level-check.js
node tests/mixing-level-runtime-check.js
```

Hai script này kiểm tra các điểm chính:

- Số level hiện tại là 5 cho mỗi nhánh.
- Cấu hình target của từng level khớp với `color-data.js`.
- Hoàn thành level cuối sẽ đi vào `victory`.
- Skip level ở level cuối cũng đi vào `victory`.

## Checklist test thủ công nên giữ

- Mở app qua localhost và xác nhận menu hiện đủ 6 lựa chọn.
- Chơi thử `Easy`, `Hard`, `Mix Easy`, `Mix Hard`.
- Kiểm tra `skip level` chỉ hiện ở `easy` và `mix-easy`.
- Kiểm tra mixing station trả về kết quả đúng với recipe hợp lệ và `waste` với tổ hợp sai.
- Kiểm tra leaderboard cập nhật sau khi thắng ở từng mode có tính điểm.
- Kiểm tra `Free Play` vào được, reset được và quay về menu được.
- Kiểm tra tương tác desktop lẫn VR controller nếu có thiết bị.

## Hạn chế hiện tại

- Không có backend nên leaderboard chỉ cục bộ theo trình duyệt.
- Không có bước build, bundling hoặc module system hiện đại.
- Repo hiện không có thư mục `assets/sounds`; audio runtime dựa vào fallback nếu asset không hiện diện.
- Test hiện tại mới bao phủ config/runtime logic, chưa bao phủ render và tương tác browser thực tế.
- Chất lượng trải nghiệm VR vẫn phụ thuộc thiết bị WebXR và hiệu năng máy chạy.

## File nên đọc trước nếu tiếp tục phát triển

- `index.html`
- `js/game-manager.js`
- `js/color-data.js`
- `js/color-wheel.js`
- `js/mixing-station.js`
- `js/ui-manager.js`
