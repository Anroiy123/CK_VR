Luồng chơi :

Bắt đầu:
Shelf: 3 Primary (R,Y,B) + 1 White = 4 bóng khởi đầu, 10 slot tổng
Wheel: TẤT CẢ slot trống (vòng ngoài, vòng trong, tâm trắng)
Trạm trộn: sẵn sàng

Người chơi phải:

1. Mix Primary+Primary → Secondary (vd: R+Y → Orange)
2. Mix Primary+Secondary → Tertiary
3. Mix màu bất kỳ + White → Tint (màu giảm sắc, đặt vòng trong)
4. Đặt White vào tâm
5. Đặt bóng đã mix vào đúng vị trí trên wheel

Ràng buộc:

- Shelf tối đa 10 bóng — phải quản lý không gian
- Bóng nguồn KHÔNG bị tiêu thụ khi mix (vẫn cần để mix các màu khác)
- Win = hoàn thành toàn bộ bảng màu trên wheel

Khi người chơi thả bóng 1 vào ô mix thì bóng đó sẽ hiện ở trên ô mix đó , tiếp tục người chơi chọn bóng thứ 2 để vào ô mix thì bóng mix màu giữa 2 màu đó sẽ hiện ở trên ô mix đó , tiếp tục nếu cần màu giảm sắc độ thì người chơi sẽ tiếp tục đặt bóng màu trắng vào ô mix và bóng màu Tertiary hiện ra ở trên ô mix đó sau đó người chơi sẽ bắt buộc phải đưa quả bóng đã mix đó ra shelf (cho dù màu đã đúng hay sai) . Đúng thì người chơi sẽ tiếp tục nhặt bóng từ shelf đó và để vào vòng tròn màu , sai thì người chơi bị mất 1 slot trong shelf giữ bóng (quá 10 lần sẽ không thể mix màu thêm nữa )

Trạm trộn có 1 input slot duy nhất:

Bước 1: Thả bóng 1 vào input → bóng hiện phía trên trạm (giữ state)
Bước 2: Thả bóng 2 vào input → 2 bóng merge, bóng KẾT QUẢ hiện trên trạm
(nếu cần tint) Bước 2b: Thả White → kết quả thành tint
Bước 3: BẮT BUỘC kéo bóng kết quả ra shelf - Đúng màu → đặt được lên wheel - Sai màu → vẫn nằm trên shelf, chiếm 1 slot - Hết 10 slot (tính cả primary gốc + bóng sai) → không mix thêm được → thua
