# VR Color Circle

VR Color Circle là game giáo dục 3D/VR giúp người chơi tìm hiểu vòng tròn màu bằng thao tác kéo thả, sắp xếp và pha màu trực tiếp trong không gian triển lãm ảo.

## Chơi trực tuyến

Production: [https://ckvr.vercel.app](https://ckvr.vercel.app)

## Tính năng chính

- Chạy hoàn toàn trên trình duyệt, không cần backend.
- Hỗ trợ chuột trên desktop và controller trong WebXR.
- Hai nhánh gameplay: đặt màu trực tiếp và pha màu.
- Mỗi nhánh có 5 level với độ khó tăng dần.
- Chế độ Easy không giới hạn thời gian và cho phép bỏ qua level.
- Chế độ Hard sử dụng đồng hồ đếm ngược.
- Free Play cho phép khám phá toàn bộ bảng màu.
- Leaderboard lưu kết quả riêng cho từng chế độ bằng `localStorage`.
- HUD dạng DOM overlay cố định ở góc trên bên phải, hiển thị level, chế độ, tiến độ, thời gian và trạng thái kệ.
- Nút Back Menu luôn có trong gameplay; nút Skip Level chỉ xuất hiện ở Easy và Mix Easy.
- Âm thanh sử dụng Howler.js và có Web Audio fallback khi asset không tải được.

## Công nghệ

- HTML5, CSS3, Vanilla JavaScript
- A-Frame 1.6.0
- aframe-extras 7.6.0
- Howler.js 2.2.4
- WebXR
- Vercel

## Chế độ chơi

### Normal Mode

- `Easy`: đặt bóng màu đúng vị trí trên vòng tròn màu, không giới hạn thời gian.
- `Hard`: cùng cơ chế với Easy nhưng có thời gian giới hạn cho từng level.

### Mixing Mode

- `Mix Easy`: kết hợp bóng tại trạm pha màu, sau đó đặt màu tạo được lên wheel.
- `Mix Hard`: có đồng hồ đếm ngược và yêu cầu quản lý số chỗ trống trên kệ.
- Công thức sai tạo ra bóng `Waste` thay vì màu mục tiêu.
- Thêm màu trắng vào một màu hợp lệ sẽ tạo ra biến thể tint tương ứng.

### Free Play

Free Play mở toàn bộ tập màu để người chơi tự do thử wheel, kệ và các tương tác mà không bị ràng buộc bởi tiến trình thắng thua.

### Leaderboard

Kết quả được lưu riêng cho `easy`, `hard`, `mix-easy` và `mix-hard`. Mỗi chế độ giữ tối đa 10 kết quả, panel trong game hiển thị 5 kết quả cao nhất.

## Tiến trình level

| Level | Normal Mode | Số mục tiêu | Mixing Mode |
| --- | --- | ---: | --- |
| 1 | Primary Colors + White | 4 | Mix Primary Colors |
| 2 | Secondary Colors | 3 | Mix Secondary Colors |
| 3 | Tertiary Colors | 6 | Mix Tertiary Colors |
| 4 | Tint Colors | 12 | Mix Tint Colors |
| 5 | Full Color Wheel | 25 | Master Mixer |

Cấu hình màu, recipe, mục tiêu và thời gian nằm trong `js/color-data.js`.

## Điều khiển

### Desktop

- Di chuyển camera bằng `look-controls`.
- Nhấn và kéo bóng bằng chuột.
- Thả bóng gần slot, kệ hoặc trạm pha để kích hoạt tương tác tương ứng.
- Chọn các nút menu bằng con trỏ giữa màn hình.

### VR

- Hai tay sử dụng `laser-controls` và component `grabber`.
- Raycaster tương tác với các entity có class `.interactive`.
- Cầm, di chuyển và thả bóng bằng controller.

## Chạy local

Dự án là static site, không có `package.json` và không cần bước build.

Chạy một static server tại thư mục dự án:

```powershell
python -m http.server 4173
```

Sau đó mở:

```text
http://127.0.0.1:4173/index.html
```

Không nên mở trực tiếp bằng `file://` vì một số tài nguyên và luồng trình duyệt hoạt động ổn định hơn qua localhost.

## Cấu trúc repository

```text
CK_VR2/
├─ index.html
├─ README.md
├─ assets/
│  ├─ images/
│  └─ *.glb
├─ css/
│  └─ styles.css
└─ js/
   ├─ color-data.js
   ├─ color-wheel.js
   ├─ game-manager.js
   ├─ mixing-station.js
   ├─ shelf.js
   ├─ sound-manager.js
   ├─ ui-manager.js
   └─ ...
```

## Kiến trúc

- `index.html`: scene A-Frame, menu, gameplay world, panel kết quả và DOM HUD.
- `js/color-data.js`: nguồn dữ liệu màu, recipe pha màu và cấu hình level.
- `js/game-manager.js`: state machine và luồng Normal/Mixing Mode.
- `js/color-wheel.js`: dựng wheel, slot mục tiêu và trạng thái màu đã đặt.
- `js/mixing-station.js`: xử lý recipe, tint và kết quả pha sai.
- `js/shelf.js`: quản lý vị trí bóng và giới hạn kệ.
- `js/ui-manager.js`: đồng bộ panel, HUD, timer, tiến độ và các event UI.
- `js/sound-manager.js`: quản lý nhạc nền, hiệu ứng và audio fallback.

## Triển khai

Nhánh `main` được triển khai lên Vercel. Workflow tại `.github/workflows/vercel-deploy.yml` có thể build và deploy production khi các Vercel secrets cần thiết đã được cấu hình trong GitHub.

## Giới hạn

- Leaderboard chỉ tồn tại trong trình duyệt hiện tại vì dữ liệu được lưu bằng `localStorage`.
- Không có hệ thống tài khoản hoặc đồng bộ điểm giữa thiết bị.
- Chất lượng và hiệu năng WebXR phụ thuộc vào trình duyệt và thiết bị.
- Nếu không có file âm thanh tương ứng, game sẽ dùng tone fallback thay thế.
