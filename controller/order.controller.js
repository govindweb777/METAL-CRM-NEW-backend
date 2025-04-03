const Order = require("../models/order.model");
const  WorkQueueItem = require("../models/workQueueItem.model");
const Counter = require("../models/counter");
const {uploadImageToCloudinary, localFileUpload} = require("../utils/ImageUploader")


// exports.createOrder = async (req, res) => {
//   try {
//     console.log("Inside create order controller", req.body);

//     const { dimensions, assignedTo, customer, requirements, status, } = req.body;
//     console.log("Assigned To:", assignedTo);

//     console.log("this is req.file",req.body);

//     const image = req.file?req.file.path:"";
//     const customerId = req.user.id;

//     if (!dimensions) {
//       return res.status(400).json({
//         success: false,
//         message: "Dimensions field is mandatory",
//       });
//     }

//     let imageUrls = [];

//     // if(req.files && req.files.images) {
//     //   const filesArray = Array.isArray(req.files.images) ? req.files.images : [req.files.images];

//     //   // Upload images to Cloudinary and store URLs
//     //   const uploadResults = await Promise.all(
//     //     filesArray.map((file) => uploadImageToCloudinary(file, process.env.FOLDER_NAME))
//     //   );

//     //   imageUrls = uploadResults.map((file) => file.secure_url);
//     // }

//     // Generate Sequential Order ID
//     let counterDoc = await Counter.findOneAndUpdate(
//       { name: "orderCounter" },
//       { $inc: { seq: 1 } },
//       { new: true, upsert: true }
//     );

//     const newOrderId = `ORD${String(counterDoc.seq).padStart(3, '0')}`;

//     const newOrder = new Order({
//       orderId: newOrderId,
//       customer: customerId,
//       requirements:requirements,
//       dimensions,
//       image: image, 
//       createdBy: req.user.id,
//       customerName: customer,
//       status: status || "New",
//       assignedTo: assignedTo || null,
//     });

//     const order = await newOrder.save();

    

//     // if (assignedTo) {
//     //   await User.findByIdAndUpdate(assignedTo, { isActive: true });
//     // }


//     // Populate related fields
//     const populatedOrder = await Order.findById(order._id)
//       .populate("customer", "name email")
//       .populate("assignedTo", "name email")
//       .populate("createdBy", "name email");

//     res.status(201).json({
//       success: true,
//       message: "Order created successfully",
//       data: populatedOrder,
//     });

//   } catch (error) {
//     console.error("Error occurred while creating order", error);
//     return res.status(500).json({
//       success: false,
//       message: "Problem in creating the order",
//       error: error.message,
//     });
//   }
// };



exports.assignOrder= async(req,res)=>{
    try {
        const {assignedTo}= req.body;
        console.log("assignedTo");

        let order= await Order.findById(req.params.id);
        console.log("order is :",order);
        if(!order){
            return res.status(404).json({
                success:false,
                message:"Order not found"
            })
        };

        if(!assignedTo){
            return res.status(400).json({
                success:false,
                message:"All fields are mandatory",
            })
        }

        order= await Order.findByIdAndUpdate(req.params.id,{
            $set:{
                assignedTo,
                status:'Assigned'
            }
        },{new:true}).populate('customer',"name email")
        .populate('assignedTo',"name email")
        .populate('createdBy', "name email")

        return res.status(200).json({
          success:true,
          message:"order assigned successfully",
          order
        })

        
    } catch (error) {
        console.error("problem in assigning order",error);
        return res.status(402).json({
            success:false,
            message:"unable to assign order",
            error:error.message
        })
        
    }
}


exports.getOrders = async (req, res) => {
    try {
      const { status, customer, assignedTo } = req.query;
      
      let query = {};
      if (status) query.status = status;
      if (customer) query.customer = customer;
      if (assignedTo) query.assignedTo = assignedTo;
      
      
      
      const orders = await Order.find(query)
        .populate('customer', 'name email')
        .populate('assignedTo', 'firstName lastName email')
        .populate('approvedBy', 'name email')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 });

      // console.log("this is orders",orders);
      return res.status(200).json({
        success:true,
        message:"all orders has been fetched successfully",
        orders
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  };


  
  exports.getOrderById = async (req, res) => {
    try {
      
      const order = await Order.findById(req.params.id)
        .populate('customer', 'name email phone')
      
        .populate('assignedTo', 'firstName lastName email')
        .populate('approvedBy', 'name email')
        .populate('createdBy', 'name email');
        console.log(order.assignedTo);

      
      if (!order) {
        return res.status(404).json({ msg: 'Order not found' });
      }
      
      
      
      res.status(200).json({
        success:true,
        message:"order has been fetched successfully",
        order
      });
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Order not found' });
      }
      res.status(500).send('Server error');
    }
  };



  exports.updateOrder = async (req, res) => {
    try {
      
      const { requirements, dimensions,assignedTo} = req.body;
      
      // Check if order exists
      let order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ msg: 'Order not found' });
      }
      
      const updateFields = {};
      if (requirements) updateFields.requirements = requirements;
      if (dimensions) updateFields.dimensions = dimensions;
      if (assignedTo) updateFields.assignedTo = assignedTo;
      

      //check if new files are uploaded
      if(req.files && req.files.images){
        const files= req.files.images;
       const filesArray = Array.isArray(files) ? files : [files];
              const filesImage = await localFileUpload(
                      files,
                      
                  );

        //extract secure urls from the uploaded images
        const imageUrls= filesImage.map((file)=>file.path);
        updateFields.image=imageUrls;
      console.log("imageUrl is:",imageUrls);
      }

      order = await Order.findByIdAndUpdate(
        req.params.id,
        { $set: updateFields },
        { new: true }
      ).populate('customer', 'name email')
        .populate('assignedTo', 'name email')
        .populate('approvedBy', 'name email')
        .populate('createdBy', 'name email');
  
      res.status(200).json({
        success:true,
        message:"order has been updated successfully",
        order});
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Order not found' });
      }
      res.status(500).send('Server error');
    }
  };
  


  // exports.updateOrder = async (req, res) => {
  //   try {
      
  //     const { requirements, dimensions, status} = req.body;
      
  //     // Check if order exists
  //     let order = await Order.findById(req.params.id);
  //     if (!order) {
  //       return res.status(404).json({ msg: 'Order not found' });
  //     }

  //     const updateFields = {};

  //     if(status){
  //       updateFields.status=status;
  //     }

  //     if (requirements) updateFields.requirements = requirements;
  //     if (dimensions) updateFields.dimensions = dimensions;
      

  //     //check if new files are uploaded
  //     if(req.files && req.files.images){
  //       const files= req.files.images;

  //       //ensure files are in array format
  //       const filesArray = Array.isArray(files)? files:[files];

  //       //upload new image to cloudinary
  //       const filesImage = await Promise.all(
  //         filesArray.map((file)=>
  //           uploadImageToCloudinary(file,process.env.FOLDER_NAME)
  //         )
  //       );

  //       //extract secure urls from the uploaded images
  //       const imageUrls= filesImage.map((file)=>file.secure_url);
  //       updateFields.image=imageUrls;
  //     }
  
  //     order = await Order.findByIdAndUpdate(
  //       req.params.id,
  //       { $set: updateFields },
  //       { new: true }
  //     ).populate('customer', 'name email')
  //       .populate('assignedTo', 'firstName lastName email')
  //       .populate('approvedBy', 'name email')
  //       .populate('createdBy', 'name email');
  
  //     res.status(200).json({
  //       success:true,
  //       message:"order has been updated successfully",
  //       order});
  //   } catch (err) {
  //     console.error(err.message);
  //     if (err.kind === 'ObjectId') {
  //       return res.status(404).json({ msg: 'Order not found' });
  //     }
  //     res.status(500).send('Server error');
  //   }
  // };
  

  exports.deleteOrder = async (req, res) => {
    try {
      const order = await Order.findById(req.params.id);
      
      if (!order) {
        return res.status(404).json({ msg: 'Order not found' });
      }
      
      
      
      // Remove related work queue items
      await WorkQueueItem.deleteMany({ order: req.params.id });
      
      // Remove order
      await order.deleteOne();
      
      res.json({ msg: 'Order and related items removed' });
    } catch (err) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Order not found' });
      }
      res.status(500).send('Server error');
    }}




    exports.approveOrder = async (req, res) => {
        try {
          // Check if order exists
          let order = await Order.findById(req.params.id);
          if (!order) {
            return res.status(404).json({
              success:false, 
              msg: 'Order not found'
             });
          }
          
          
          
          // Check if order is in the right status
          if (order.status !== 'PendingApproval') {
            return res.status(400).json({ msg: 'Order is not in pending approval status' });
          }
      
          // Update order status and add to work queue
          order = await Order.findByIdAndUpdate(
            req.params.id,
            { 
              $set: { 
                status: 'InWorkQueue',
                approvedBy: req.user.id
              }
            },
            { new: true }
          ).populate('customer', 'name email')
            .populate('assignedTo', 'name email')
            .populate('approvedBy', 'name email')
            .populate('createdBy', 'name email');
          
          // Create work queue item
          const workQueueItem = new WorkQueueItem({
            order: order._id,
            status: 'Pending'
          });
          
          await workQueueItem.save();
          
          // // Notify display team
          // io.to('display_team').emit('new-work-queue-item', {
          //   orderId: order._id,
          //   message: 'New item added to work queue'
          // });
      
          res.status(200).json({
            success:true,
            message:"order approved",
            order

            });
        } catch (err) {
          console.error(err.message);
          if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Order not found' });
          }
          res.status(500).send('Server error');
        }
      };




