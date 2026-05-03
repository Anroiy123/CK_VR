## Why

VR Color Circle hiện chỉ có 3 mode (Easy, Hard, Free Play) với cơ chế duy nhất: nhặt bóng từ shelf rồi đặt vào đúng slot trên vòng tròn màu. Việc này lặp lại và thiếu chiều sâu giải đố. Game cần một mode mới thử thách **tư duy logic và kiến thức lý thuyết màu** — người chơi phải tự pha trộn màu từ 3 primary + white để tạo ra toàn bộ bảng màu. Mode này biến trải nghiệm từ "chọn đúng slot" thành "bạn có HIỂU cách tạo ra màu đó không?"

## What Changes

- **Thêm Mixing Mode** — mode mới với cơ chế pha màu trên trạm trộn, 6 level tăng dần độ khó
- **Trạm trộn (Mixing Station)** — component A-Frame mới cho phép người chơi thả 2-3 bóng vào để merge thành màu kết quả
- **Mở rộng color-wheel** — thêm vòng trong (tints/giảm sắc độ) và tâm trắng (white center)
- **Hệ thống công thức pha màu** — dữ liệu MIXING_RECIPES định nghĩa cách tạo từng màu từ các màu nguồn
- **Shelf slot limit** — shelf giới hạn 10 slot, mix sai sẽ lãng phí slot → thêm áp lực chiến thuật
- **Nút MIX trên menu** — UI menu thêm nút mode mới
- **Hint panel** — panel gợi ý công thức ở các level đầu, ẩn dần ở level sau

## Capabilities

### New Capabilities
- `mixing-mode`: Luồng chơi mixing mode (state machine, level progression, shelf slot management)
- `mixing-station`: Trạm trộn — nhận bóng, merge theo công thức, trả bóng kết quả
- `mixing-recipes`: Dữ liệu công thức pha màu (primary→secondary→tertiary→tint)
- `color-wheel-inner-ring`: Mở rộng wheel hiện tại thêm vòng tint trong và tâm trắng

### Modified Capabilities
- `ui-panels`: Thêm nút MIX trên menu chính, panel gợi ý mixing, shelf counter
- `color-wheel`: Thêm inner ring slots + white center slot
- `shelf`: Thêm giới hạn slot counter và visual feedback khi gần full

## Impact

- `js/color-data.js` — thêm MIXING_RECIPES, TINT_VARIANTS, MIX_LEVEL_CONFIG
- `js/game-manager.js` — thêm `startMixingGame()`, shelf slot tracking
- `js/color-wheel.js` — thêm inner ring rendering, white center
- `js/ui-manager.js` — thêm nút MIX, hint panel, shelf counter display
- `js/shelf.js` — slot limit hiển thị
- `index.html` — thêm mixing-station entity, nút MIX trong menu, panel gợi ý
- `js/mixing-station.js` — file mới, component trạm trộn
