const express = require("express");
const app = express();
const database = require("./config/database");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");
//const { cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");

const path = require("path");  

dotenv.config();
const PORT = process.env.PORT || 3000;

app.use(cors({ credentials: true, origin: process.env.CLIENT_URL }));
//app.use(cors({ credentials: true, origin:"*" }));


app.use(express.json());
app.use(cookieParser());

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);

// Cloudinary connection
// cloudinaryConnect();

database.connectWithDb();

// // Serve static files from the 'utils/files' directory
// app.use("/files", express.static(path.join(__dirname, "utils/files")));


app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Routes
const userRoutes = require("./routes/user.routes");
const adminRoutes = require("./routes/admin.routes");
const designerRoutes = require("./routes/designer.routes");
const superAdminRoutes = require("./routes/superAdmin.routes");
const accountRoutes = require("./routes/account.routes");

app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/sa", superAdminRoutes);
app.use("/api/v1/d", designerRoutes);
app.use("/api/v1/ac", accountRoutes);

app.get("/", (req, res) => {
  return res.json({ message: "Your server is up and running" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});