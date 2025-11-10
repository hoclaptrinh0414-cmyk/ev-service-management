// Thông tin về các trang trong ứng dụng
const ROUTES_INFO = [
  {
    path: "/dashboard",
    description: "Trang tổng quan, xem thông tin xe",
  },
  {
    path: "/services",
    description: "Xem và đặt lịch các dịch vụ",
  },
  {
    path: "/profile",
    description: "Trang thông tin cá nhân",
  },
  {
    path: "/my-appointments",
    description: "Quản lý và xem lịch hẹn sắp tới",
  },
  {
    path: "/products",
    description: "Danh sách sản phẩm và phụ kiện",
  },
  {
    path: "/schedule-service",
    description: "Đăng ký lịch hẹn dịch vụ",
  },
  {
    path: "/register-vehicle",
    description: "Đăng ký thông tin xe",
  },
  {
    path: "/records",
    description: "Xem lịch sử thanh toán và quản lý chi phí",
  },
];

// Hàm chuyển text có dấu thành không dấu
function removeAccents(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

// Hàm chính để xử lý chat
export async function chatWithAI(message) {
  // Giả lập delay để tạo cảm giác chat thật
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Chuyển message thành chữ thường và bỏ dấu để so sánh
  const msg = removeAccents(message.toLowerCase());

  // Xử lý đăng ký lịch hẹn (Đặt lịch)
  if (
    msg === "schedule service" ||
    msg === "schedule" ||
    msg.includes("dat lich") ||
    msg.includes("dang ky lich") ||
    msg.includes("dang ki lich") ||
    msg.includes("book service") ||
    msg.includes("hen lich") ||
    msg.includes("make appointment") ||
    msg.includes("booking") ||
    msg.includes("sch") ||
    msg.includes("sched")
  ) {
    return {
      type: "navigation",
      route: "/schedule-service",
      message: "Mình sẽ đưa bạn đến trang đăng ký lịch hẹn dịch vụ ngay",
    };
  }

  // Xử lý xem lịch hẹn sắp tới
  if (
    msg.includes("lich sap toi") ||
    msg.includes("lich da dat") ||
    msg.includes("xem lich hen") ||
    msg.includes("check appointment") ||
    msg.includes("my appointment") ||
    msg.includes("view schedule") ||
    msg.includes("upcoming") ||
    msg === "appointments" ||
    msg === "appointment" ||
    msg.includes("lich cua toi") ||
    msg.includes("appt") ||
    msg.includes("apmt") ||
    msg.includes("appts")
  ) {
    return {
      type: "navigation",
      route: "/my-appointments",
      message: "Mình sẽ đưa bạn đến trang xem lịch hẹn của bạn ngay",
    };
  }

  // Xử lý xem lịch hẹn (thêm điều kiện mới)
  if (msg === "appointment" || msg.includes("lich hen")) {
    return {
      type: "navigation",
      route: "/my-appointments",
      message: "Mình sẽ đưa bạn đến trang xem lịch hẹn của bạn ngay",
    };
  }

  // Trường hợp từ ngắn/viết tắt mơ hồ: "lich", "lh", hoặc người dùng chỉ gõ "schedule" nhưng không đủ ngữ cảnh
  // Yêu cầu người dùng làm rõ để tránh điều hướng sai
  if (msg === "lich" || msg === "lh" || msg === "lich.") {
    return {
      type: "message",
      message:
        "Bạn muốn (1) đặt lịch dịch vụ hay (2) xem lịch hẹn của bạn? Hãy trả lời '1' hoặc '2' hoặc viết rõ hơn.",
    };
  }

  // Xử lý xem lịch sử thanh toán và chi phí
  if (
    msg.includes("lich su") ||
    msg.includes("lich su thanh toan") ||
    msg.includes("record") ||
    msg.includes("chi phi") ||
    msg.includes("cost") ||
    msg.includes("hoa don") ||
    msg.includes("payment") ||
    msg.includes("tien") ||
    msg.includes("da chi") ||
    msg.includes("manage record")||
    msg.includes("history")
  ) {
    return {
      type: "navigation",
      route: "/records",
      message:
        "Mình sẽ đưa bạn đến trang xem lịch sử thanh toán và quản lý chi phí",
    };
  }

  // Xử lý đăng ký xe
  if (
    msg.includes("dang ky xe") ||
    msg.includes("dang ki xe") ||
    msg.includes("them xe") ||
    msg.includes("register vehicle") ||
    msg.includes("new vehicle") ||
    msg.includes("add vehicle")
  ) {
    return {
      type: "navigation",
      route: "/register-vehicle",
      message: "Mình sẽ đưa bạn đến trang đăng ký thông tin xe ngay",
    };
  }

  // Xử lý xem sản phẩm
  if (
    msg.includes("san pham") ||
    msg.includes("phu kien") ||
    msg.includes("mua") ||
    msg.includes("product") ||
    msg.includes("accessory") ||
    msg.includes("buy") ||
    msg === "shop" ||
    msg === "products"
  ) {
    return {
      type: "navigation",
      route: "/products",
      message: "Mình sẽ đưa bạn đến trang xem danh sách sản phẩm và phụ kiện",
    };
  }

  // Xử lý xem dịch vụ
  if (
    msg.includes("dich vu") ||
    msg === "service" ||
    msg.includes("services") ||
    msg.includes("maintain") ||
    msg.includes("maintenance") ||
    msg === "services"
  ) {
    return {
      type: "navigation",
      route: "/services",
      message: "Mình sẽ đưa bạn đến trang xem và đặt lịch các dịch vụ",
    };
  }

  // Xử lý xem thông tin xe
  if (
    msg.includes("xe") ||
    msg.includes("dashboard") ||
    msg.includes("car") ||
    msg.includes("vehicle") ||
    msg.includes("overview")
  ) {
    return {
      type: "navigation",
      route: "/dashboard",
      message: "Mình sẽ đưa bạn đến trang tổng quan để xem thông tin xe",
    };
  }

  // Xử lý thông tin cá nhân
  if (
    msg.includes("ca nhan") ||
    msg.includes("thong tin") ||
    msg.includes("profile") ||
    msg.includes("account") ||
    msg.includes("personal") ||
    msg.includes("my info")
  ) {
    return {
      type: "navigation",
      route: "/profile",
      message: "Mình sẽ đưa bạn đến trang thông tin cá nhân",
    };
  }

  if (msg.includes("xin chao") || msg.includes("hi") || msg.includes("hello")) {
    return {
      type: "message",
      message: "Xin chào! Mình có thể giúp gì cho bạn?",
    };
  }

  if (msg.includes("cam on") || msg.includes("thank")) {
    return {
      type: "message",
      message:
        "Rất vui khi được giúp đỡ bạn! Bạn cần mình hỗ trợ gì thêm không?",
    };
  }

  if (
    msg.includes("giup") ||
    msg.includes("huong dan") ||
    msg.includes("help")
  ) {
    return {
      type: "message",
      message:
        "Mình có thể giúp bạn:\n" +
        "- Đăng ký xe mới (Register vehicle)\n" +
        "- Xem lịch hẹn sắp tới (My appointments)\n" +
        "- Xem thông tin cá nhân (Profile)\n" +
        "- Xem và đặt lịch các dịch vụ (Services)\n" +
        "- Đăng ký lịch hẹn dịch vụ (Schedule service)\n" +
        "- Xem thông tin xe của bạn (Vehicle info)\n" +
        "- Xem lịch sử thanh toán và chi phí (Records)\n" +
        "- Xem danh sách sản phẩm và phụ kiện (Products)\n" +
        "Bạn cần mình giúp việc nào?",
    };
  }

  return {
    type: "message",
    message:
      "Xin lỗi, mình chưa hiểu rõ yêu cầu của bạn. Bạn có thể nói rõ hơn được không?",
  };
}
