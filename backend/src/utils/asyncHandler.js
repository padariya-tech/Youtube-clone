const asyncHandler = (requestHandler) =>{
  return (req,res,next)=>{
    Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err))
  }
}


export {asyncHandler}

// const asyncHandler = () =>{} 
// const asyncHandler = (func) => {() =>{}} pass function as argument and execute function
// const asyncHandler = (func) => async () => {} same thing as above but with async

  
// const asyncHandler = (func) => async (req,res,next) => {
//     try {
//             await func(req,res,next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success:false,
//             message:err.message
//         })
//     }
// }