const express= require("express");
const router = express.Router();
const multer = require('multer');
const {storage} = require("../config/cloudinary");
const upload = multer({ storage });


const {auth, isAdmin ,isGraphics} = require("../middleware/auth");

const {adminController}= require("../controller/admin.controller");
const {
    createLead,
    updateLead,
    deleteLead,
    convertToCustomer
    }= require('../controller/lead.controller');

const{ createCustomer, updateCustomer, deleteCustomer,
    getCustomerOrders, 
    getAllCustomers
    }= require("../controller/customer.controller")


const{
    createOrder,
    updateOrder,
    deleteOrder,
    getOrderById,
    getOrders,
    assignOrder,
    approveOrder

    }= require("../controller/order.controller")

const graphicController = require("../controller/graphics.controller");
    // const {localFileUpload}= require("../config/cloudinary")
    
const{localFileUpload}= require("../utils/ImageUploader")


// router.get("/admin",auth,isAdmin,adminController);
router.post("/createLead",auth,isAdmin,createLead);
router.put("/updateLead/:id",auth,isAdmin,updateLead);
router.delete("/deleteLead/:id",auth,isAdmin,deleteLead);
router.post("/convertToCustomer/:id",auth,isAdmin,convertToCustomer);

//create customer route
router.post("/createCustomer",auth,isAdmin,createCustomer);

router.put("/updateCustomer/:id",auth,isAdmin,updateCustomer);
router.delete("/deleteCustomer/:id",auth,isAdmin,deleteCustomer);
router.get("/getCustomerOrders/:id",auth,isAdmin,getCustomerOrders);
router.get("/getAllCustomers", auth, isAdmin, getAllCustomers);

//create Order

// router.post("/createOrder",auth,isAdmin,upload.single('image'),createOrder);
// router.post("/createOrder/:id",auth,isAdmin,createOrder);
//router.put("/updateOrder/:id",auth,isAdmin, upload.single('image') ,updateOrder);

router.put("/updateOrder/:id",auth,isAdmin,updateOrder);
router.delete("/deleteOrder/:id",auth,isAdmin,deleteOrder);
router.get("/getOrderById/:id",auth,isAdmin,getOrderById,);
router.get("/getOrders",auth,isAdmin,getOrders);
router.put("/assignOrder/:id",auth,isAdmin,assignOrder);
router.put("/approveOrder",auth,isAdmin,approveOrder);


router.post('/createOrder/:id', auth, isAdmin, graphicController.createOrder);

// Get pending orders (for admin or graphics team)
router.get('/pending', auth, isAdmin, graphicController.getPendingOrders);

// Reassign unassigned orders (for admin)
router.put( '/reassign', auth, isAdmin, graphicController.reassignUnassignedOrders);

// Get user's assigned orders (for graphics team)
router.get('/assigned', auth, isGraphics, graphicController.getUserAssignedOrders);




module.exports= router