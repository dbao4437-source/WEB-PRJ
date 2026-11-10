import mongoose from "mongoose";

const enrollmentSchema = new mongoose.Schema(
  {
    // Ô số 1: Học viên đăng ký
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Phải có thông tin học viên đăng ký"],
    },

    // Ô số 2: Đăng ký lớp học
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: [true, "Phải có thông tin lớp học"],
    },

    // Ô số 3: Số tiền học phí phải đóng
    tuitionFee: {
      type: Number,
      required: [true, "Phải có mức học phí"],
      min: [0, "Học phí không được âm"],
    },

    // Ô số 4: Trạng thái duyệt đơn
    status: {
      type: String,
      enum: ["pending", "confirmed", "canceled", "completed"],
      default: "pending",
    },

    // Ô số 5: Trạng thái đóng tiền học phí
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
    },

    // Ô số 6: Ghi chú thêm của học viên
    note: {
      type: String,
      trim: true,
      default: "",
    },

    // Ô số 7: Thời điểm đóng tiền thành công
    paidAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Enrollment", enrollmentSchema);
