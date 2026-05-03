## Context

VR Color Circle hiện có 3 mode (Easy, Hard, Free Play) với cơ chế drag-and-drop: nhặt bóng từ shelf → đặt vào slot trên wheel. Game cần một mode giải đố dựa trên kiến thức pha màu. Mode này sẽ dạy người chơi cách tạo ra màu mới từ các màu cơ bản (primary) và màu trắng.

Kiến trúc hiện tại dùng pattern IIFE + A-Frame components + global managers. Mode mới sẽ theo đúng pattern này, tái dùng GameManager state machine, UIManager panel routing, và các component wheel/shelf/ball hiện có.

## Goals / Non-Goals

**Goals:**
- Mode pha màu với 6 level, timer, shelf slot limit (10)
- Trạm trộn cho phép merge 2-3 bóng theo công thức
- Wheel mở rộng: vòng ngoài (bão hòa), vòng trong (tint), tâm trắng
- Gợi ý theo level: đầy đủ → ẩn 1 phần → không gợi ý
- Tái dùng GameManager state machine, không phá vỡ mode cũ

**Non-Goals:**
- Không refactor mode Easy/Hard/Free Play
- Không thay đổi leaderboard (mix mode có leaderboard riêng hoặc dùng chung)
- Không thay đổi VR controller logic
- Không thêm animation phức tạp ngoài particle pool hiện có

## Decisions

### 1. Mixing Manager là extension của GameManager, không phải module riêng
**Chọn:** Thêm method `startMixingGame()`, `initMixingLevel()` vào GameManager, và `mixing-` prefixed helpers.
**Tại sao:** GameManager đã có state machine hoàn chỉnh (MENU→PLAYING→LEVEL_COMPLETE→VICTORY/TIME_UP). Mode nào cũng dùng state machine này. Tách riêng thành mixing-manager.js sẽ duplicate logic spawnBalls, levelComplete, backToMenu. Tuy nhiên logic đặc thù của mixing (trạm trộn, shelf slot, công thức) sẽ nằm trong mixing-station.js và color-data.js.
**Alternative:** Module mixing-mode.js riêng → duplicate code, phá pattern IIFE hiện tại.

### 2. Trạm trộn dùng 1 input slot (single-port)
**Chọn:** 1 input slot, bóng được thả tuần tự. State machine: EMPTY → HOLDING_BALL1 → RESULT_READY. Trong RESULT_READY, chỉ chấp nhận White (để tint) hoặc grab result.
**Tại sao:** Người dùng đã mô tả luồng: thả bóng 1 → hiện trên trạm → thả bóng 2 → merge → kết quả hiện → BẮT BUỘC đưa ra shelf. Source balls trả về shelf (không tiêu thụ). Đơn giản, trực quan.
**Alternative:** 2 input slots song song → phức tạp UI, khó hiểu cho người chơi mới.

### 3. Source balls không bị tiêu thụ, merge sai vẫn tạo waste ball
**Chọn:** Sau khi merge, cả 2 source balls trở về vị trí cũ trên shelf. Merge luôn tạo ra một kết quả: đúng công thức → màu đúng, sai công thức → "waste ball" (#8B7355, nâu xám). Waste ball chiếm slot shelf nhưng không đặt được lên wheel.
**Tại sao:** Player không bị phạt mất source balls — vẫn có thể thử lại với màu khác. Nhưng mỗi lần merge (dù đúng hay sai) đều tạo ra một bóng chiếm slot shelf. Sai quá nhiều → hết slot → thua. Đây là cơ chế risk/reward: player phải suy nghĩ trước khi mix.

### 4. Merge tự động khi đủ input, không cần nút bấm
**Chọn:** Khi bóng thứ 2 được thả vào input, trạm tự merge và tạo kết quả. Nếu cần tint: player thả White vào trong RESULT_READY state → kết quả chuyển thành tint.
**Tại sao:** Giảm thao tác, mượt mà. Người chơi đã quen cơ chế drag-drop.

### 5. Công thức pha màu defined trong color-data.js
**Chọn:** Object MIXING_RECIPES với key = màu kết quả, value = { inputs: ["Red", "Yellow"], type: "secondary" }.
**Tại sao:** Giữ đúng convention tập trung config vào color-data.js. Dễ mở rộng thêm công thức mới.

### 6. Inner ring tint dùng cùng góc với màu gốc
**Chọn:** Mỗi slot tint nằm ở cùng góc với slot màu bão hòa tương ứng, nhưng ở bán kính nhỏ hơn (~0.55-0.65).
**Tại sao:** Trực quan — người chơi thấy ngay mối quan hệ giữa màu gốc và tint của nó. Dễ implement vì tái dùng logic `getSlotPosition(angle, radius)`.

### 7. Shelf slot limit = 10, enforced tại GameManager
**Chọn:** GameManager theo dõi `mixingShelfUsed` counter. Khi = 10 và còn slot wheel trống → game over.
**Tại sao:** Đây là core mechanic của mixing mode. Cần check mỗi lần người chơi đưa bóng ra shelf từ trạm trộn.

## Risks / Trade-offs

- **GameManager phình to:** Thêm mixing logic vào GameManager (đã 240 dòng) có thể làm file khó đọc. → Tách helper functions vào mixing-station.js, GameManager chỉ gọi high-level API.
- **Wheel inner ring phức tạp:** color-wheel.js đã ~400 dòng, thêm inner ring có thể gây lỗi visual. → Tái dùng logic sector hiện tại, chỉ thay đổi radius và color mapping.
- **Merge chain dài:** Người chơi có thể cần mix 3+ lần để ra màu cuối (vd: R+Y→Orange, Orange+B→??). Sai ở bước cuối vẫn phí slot. → Cần hint system tốt ở level đầu để người chơi làm quen.
- **Không tương thích VR hoàn toàn:** Trạm trộn cần vị trí dễ tiếp cận, snap distance hợp lý. → Tái dùng APP_CONFIG.vrSnapDistance và test trên VR emulator.
